
"use server";

import { z } from "zod";
import { ptwSchema, type PtwFormValues } from "@/lib/schema";
import type { Permit, PermitStatus } from "@/lib/constants";
import { analyzeRejectionRemarks } from "@/ai/flows/analyze-rejection-remarks";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, StorageError } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import { sendEmail } from "@/lib/email";


// Helper to convert Firestore Timestamps
const convertPermitDates = (permit: any): Permit => {
    const data = permit.data;
    return {
        ...permit,
        id: permit.id,
        createdAt: permit.createdAt instanceof Timestamp ? permit.createdAt.toDate() : new Date(permit.createdAt),
        updatedAt: permit.updatedAt instanceof Timestamp ? permit.updatedAt.toDate() : new Date(permit.updatedAt),
        data: {
          ...data,
          permissionDate: data.permissionDate instanceof Timestamp 
            ? data.permissionDate.toDate().toISOString()
            : new Date(data.permissionDate).toISOString()
        }
    };
};

function getFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Financial year in India is April (month 3) to March.
  return month >= 3 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
}

// Helper function to upload a file and get its URL
async function uploadFile(file: File, trackingId: string): Promise<string> {
    if (!(file instanceof File) || file.size === 0) return "";
    const storageRef = ref(storage, `permits/${trackingId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}


export async function submitPermit(formData: FormData) {
  try {
      const rawData: Record<string, any> = {};
      const fileKeys = ['uploadedFiles.ppe', 'uploadedFiles.team', 'uploadedFiles.certifications', 'uploadedFiles.siteConditions'];
      const files: Record<string, File> = {};

      for (const [key, value] of formData.entries()) {
          if (fileKeys.includes(key) && value instanceof File) {
              files[key.split('.')[1]] = value;
          } else if (key === 'workTypes' || key === 'toolBoxTalks') {
              if (!rawData[key]) rawData[key] = [];
              rawData[key].push(value);
          } else if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!rawData[parent]) rawData[parent] = {};
                rawData[parent][child] = value;
          } else {
              rawData[key] = value;
          }
      }
      
      const dataToValidate = {
        ...rawData,
        teamMembers: JSON.parse(rawData.teamMembers as string),
        declaration: rawData.declaration === 'true',
        uploadedFiles: {},
      };
      
      const validationResult = ptwSchema.safeParse(dataToValidate);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        console.error("Server-side validation failed:", errorMessages);
        return { success: false, error: `Validation failed: ${errorMessages}` };
      }
      const validatedData = validationResult.data;
    
      if (validatedData.riskAssessment === "I do not confirm") {
          console.log("Risk assessment not confirmed, submission blocked on server.");
          return { success: false, error: "Permit rejected: Risk assessment must be confirmed." };
      }
      
      const approvalToken = crypto.randomUUID();
      const financialYear = getFinancialYear();
      const uniqueId = crypto.randomUUID().substring(0, 6).toUpperCase();
      const trackingId = `PTW/RV/${validatedData.siteId.toUpperCase()}/${financialYear}/${uniqueId}`;
      
      const uploadedFiles = {
          ppe: await uploadFile(files.ppe, trackingId),
          team: await uploadFile(files.team, trackingId),
          certifications: await uploadFile(files.certifications, trackingId),
          siteConditions: await uploadFile(files.siteConditions, trackingId),
      };

      const permitDataToSave = {
          ...validatedData,
          uploadedFiles, 
          permissionDate: Timestamp.fromDate(new Date(validatedData.permissionDate))
      };
    
      const permitDocData = {
        trackingId,
        status: "Pending" as PermitStatus,
        data: permitDataToSave,
        approvalToken,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
    
      const docRef = await addDoc(collection(db, "permits"), permitDocData);
      console.log(`Permit data saved to Firestore with ID: ${docRef.id}. Tracking ID: ${trackingId}`);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
          const errorMsg = "NEXT_PUBLIC_BASE_URL environment variable is not set. Emails will not have correct links.";
          console.error(errorMsg);
          return { success: false, error: errorMsg };
      }

      const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(trackingId)}`;

      // --- Email to Approver ---
      const approvalLink = `${baseUrl}/approve/${approvalToken}`;
      const approverSubject = `PTW Approval Request: ${trackingId}`;
      const approverHtml = `<h1>Permit-to-Work Approval Request</h1><p>A new permit request with Tracking ID <strong>${trackingId}</strong> requires your approval.</p><p>Please click the link to review: <a href="${approvalLink}">View Request</a></p>`;
      
      try {
        await sendEmail({ to: validatedData.approverEmail, subject: approverSubject, html: approverHtml });
      } catch (emailError) {
        console.error("Failed to send approval email but submission was successful:", emailError);
      }
      
      // --- Email to Requester ---
      const requesterSubject = `PTW Submission Confirmation: ${trackingId}`;
      const requesterHtml = `<h1>Submission Confirmed</h1><p>Your permit request with Tracking ID <strong>${trackingId}</strong> has been successfully submitted.</p><p>You will be notified once the approver takes action. You can track the status of your request here: <a href="${trackingLink}">Track Submission</a></p>`;

      try {
        await sendEmail({ to: validatedData.requesterEmail, subject: requesterSubject, html: requesterHtml });
      } catch (emailError) {
         console.error("Failed to send confirmation email but submission was successful:", emailError);
      }

      return { success: true, trackingId };

  } catch (error) {
      if (error instanceof StorageError) {
        console.error("Firebase Storage error:", error);
        return { success: false, error: "File upload failed. This is often due to Firebase Storage not being enabled or incorrect security rules. Please check your Firebase project configuration." };
      }
       if (error instanceof FirebaseError) {
        console.error("Firebase error:", error);
        return { success: false, error: `A Firebase error occurred: ${error.message}` };
       }
      console.error("A critical unexpected error occurred in submitPermit:", error);
      const errorMessage = error instanceof Error ? error.message : "A critical server error occurred. Please check the logs.";
      return { success: false, error: errorMessage };
  }
}


export async function getPermitForApproval(token: string) {
  try {
    const q = query(collection(db, "permits"), where("approvalToken", "==", token), where("status", "==", "Pending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const alreadyActionedQuery = query(collection(db, "permits"), where("approvalToken", "==", token));
      const alreadyActionedSnapshot = await getDocs(alreadyActionedQuery);
      if(!alreadyActionedSnapshot.empty) {
         return { success: false, error: "This permit has already been actioned and can no longer be modified." };
      }
      return { success: false, error: "Invalid or expired approval token." };
    }

    const permitDoc = querySnapshot.docs[0];
    const permit = { id: permitDoc.id, ...permitDoc.data() };

    return { success: true, permit: convertPermitDates(permit as any) };
  } catch (error) {
    console.error("Error fetching permit for approval:", error);
    return { success: false, error: "Could not load permit details." };
  }
}

export async function updatePermitStatus(token: string, status: "Approved" | "Rejected", remarks?: string) {
    try {
        const q = query(collection(db, "permits"), where("approvalToken", "==", token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: "Invalid token." };
        }

        const permitDoc = querySnapshot.docs[0];
        const permitData = permitDoc.data() as Permit;

        if (permitData.status !== "Pending") {
            return { success: false, error: "This permit has already been actioned." };
        }

        if (status === "Rejected" && (!remarks || remarks.trim().length === 0)) {
            return { success: false, error: "Rejection remarks are mandatory." };
        }
        
        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
            approvalToken: crypto.randomUUID(), 
        };

        let aiSuggestions = null;
        if (status === "Rejected") {
            updateData.rejectionRemarks = remarks;
             try {
                const formDetails = JSON.stringify(permitData.data, null, 2);
                const aiResponse = await analyzeRejectionRemarks({ formDetails, rejectionRemarks: remarks! });
                console.log("AI Suggested Corrections:", aiResponse.suggestedCorrections);
                updateData.aiSuggestions = aiResponse.suggestedCorrections;
                aiSuggestions = aiResponse.suggestedCorrections;
            } catch (aiError) {
                console.error("AI analysis failed:", aiError);
            }
        }
        
        await updateDoc(doc(db, "permits", permitDoc.id), updateData);
        
        console.log(`Permit ${permitData.trackingId} has been ${status}.`);
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_BASE_URL environment variable is not set. Email notification will not have correct links.");
            return { success: true, status }; // Return success, but log error
        }

        const subject = `PTW Status Update for ${permitData.trackingId}: ${status}`;
        const emailBody = `
          <h1>Permit Status Updated</h1>
          <p>The status for your permit with Tracking ID <strong>${permitData.trackingId}</strong> has been updated to: <strong>${status}</strong>.</p>
          ${status === "Approved" ? `<p>Your permit is now approved.</p>` : ''}
          ${status === "Rejected" ? `
              <p><strong>Rejection Remarks:</strong><br/>${remarks}</p>
              ${aiSuggestions ? `<p><strong>AI-Powered Suggestions for Resubmission:</strong><br/>${aiSuggestions}</p>` : ''}
          ` : ''}
          <p>You can view the latest status here:</p>
          <a href="${baseUrl}/track?id=${encodeURIComponent(permitData.trackingId)}">Track Submission</a>
        `;

        try {
            await sendEmail({ to: permitData.data.requesterEmail, subject, html: emailBody });
        } catch(emailError) {
            console.error("Email sending failed but status update was successful:", emailError);
            // Do not block user flow if email fails.
        }
        
        return { success: true, status };

    } catch (error) {
        console.error("Error updating permit status:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `An unexpected error occurred: ${errorMessage}` };
    }
}


export async function getPermitStatus(trackingId: string) {
    try {
        const q = query(collection(db, "permits"), where("trackingId", "==", trackingId.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: "Tracking ID not found." };
        }

        const permitDoc = querySnapshot.docs[0];
        const permitData = { id: permitDoc.id, ...permitDoc.data() };
        
        const convertedData = convertPermitDates(permitData as any);

        return {
            success: true,
            status: convertedData.status,
            submittedAt: convertedData.createdAt,
            lastUpdatedAt: convertedData.updatedAt,
            rejectionRemarks: convertedData.rejectionRemarks,
            aiSuggestions: (convertedData as any).aiSuggestions,
            data: convertedData.data
        };
    } catch(error) {
        console.error("Error fetching permit status:", error);
        return { success: false, error: "Tracking ID not found." };
    }
}

export async function getAllPermits() {
    try {
        const q = query(collection(db, "permits"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const allPermits = querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            const convertedData = convertPermitDates(data as any);
            return {
                id: doc.id,
                trackingId: convertedData.trackingId,
                status: convertedData.status,
                createdAt: convertedData.createdAt,
                updatedAt: convertedData.updatedAt, 
                ...convertedData.data, 
                teamMembers: convertedData.data.teamMembers.map(m => `${m.name} (${m.farmOrToclip})`).join('; '), 
                workTypes: convertedData.data.workTypes.join(', '), 
                toolBoxTalks: convertedData.data.toolBoxTalks.join(', '), 
                permissionDate: new Date(convertedData.data.permissionDate).toLocaleDateString(),
            };
        });
        return { success: true, permits: allPermits };
    } catch (error) {
        console.error("Error fetching all permits:", error);
        return { success: false, permits: [], error: "Failed to fetch permits." };
    }
}

export async function resubmitPermit(formData: FormData) {
    try {
        const originalTrackingId = formData.get('originalTrackingId') as string;
        if (!originalTrackingId) {
            return { success: false, error: "Original tracking ID is missing for resubmission." };
        }
        
        const q = query(collection(db, "permits"), where("trackingId", "==", originalTrackingId.toUpperCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const originalDoc = querySnapshot.docs[0];
            await updateDoc(originalDoc.ref, {
                status: "Resubmitted",
                updatedAt: serverTimestamp(),
            });
        }

        return await submitPermit(formData);

    } catch (error) {
        console.error("Resubmission error:", error);
        return { success: false, error: "An unexpected error occurred during resubmission." };
    }

}
