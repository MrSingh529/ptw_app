
import { z } from "zod";

// This is the single source of truth for the server-side validation.
// It expects filenames (strings) for uploaded files.
export const ptwSchema = z.object({
    requesterCompany: z.string().min(1, "Company name is required."),
    siteName: z.string().min(1, "Site name is required."),
    siteId: z.string().min(1, "Site ID is required."),
    region: z.string({ required_error: "Region is required." }),
    circle: z.string({ required_error: "Circle is required." }),
    teamMembers: z.array(z.object({
        name: z.string().min(1, "Team member name is required."),
        farmOrToclip: z.string().min(1, "FARM/ToCli No. is required."),
    })).min(1, "At least one team member is required."),
    workTypes: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one work type.",
    }),
    otherWorkDescription: z.string().optional(),
    riskAssessment: z.enum(["I confirm", "I do not confirm"]),
    ppeConfirmation: z.enum(["Confirmed", "Not confirmed"]),
    toolBoxTalks: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one tool-box talk item.",
    }),
    uploadedFiles: z.object({
        ppe: z.string().url().optional(),
        team: z.string().url().optional(),
        certifications: z.string().url().optional(),
        siteConditions: z.string().url().optional(),
    }),
    permissionDate: z.string().min(1, "A permission date is required."), // Sent as ISO string from client
    requesterEmail: z.string().email("Invalid email address."),
    approverEmail: z.string().email("Invalid email address.").min(1, "Approver email is required."),
    contactNumber: z.string().min(10, "Contact number must be at least 10 digits.").max(13, "Contact number must be at most 13 digits."),
    declaration: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.workTypes.includes('Other') && !data.otherWorkDescription?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherWorkDescription'],
            message: 'Description for "Other" work type is required.',
        });
    }
    if (data.requesterEmail.toLowerCase() === data.approverEmail.toLowerCase()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['approverEmail'],
            message: 'Approver email cannot be the same as the requester email.',
        });
    }
    if (!data.declaration) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['declaration'],
            message: 'You must accept the declaration.',
        });
    }
});

export type PtwFormValues = z.infer<typeof ptwSchema>;
