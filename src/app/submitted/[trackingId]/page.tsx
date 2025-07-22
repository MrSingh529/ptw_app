
"use client";

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmittedPageProps {
  params: {
    trackingId: string;
  };
}

export default function SubmittedPage({ params }: SubmittedPageProps) {
  const trackingId = decodeURIComponent(params.trackingId);
  const searchParams = useSearchParams();

  useEffect(() => {
    const approverEmail = searchParams.get('approverEmail');
    const requesterEmail = searchParams.get('requesterEmail');
    const trackingIdParam = searchParams.get('trackingId');

    if (approverEmail && requesterEmail && trackingIdParam) {
      const baseUrl = "https://rvsptwapp.vercel.app";
      const approvalLink = `${baseUrl}/approve/${searchParams.get('approvalToken')}`;

      // Mail for Approver
      const approverSubject = `PTW Approval Request: ${trackingIdParam}`;
      const approverBody = `<h1>Permit-to-Work Approval Request</h1><p>A new permit request with Tracking ID <strong>${trackingIdParam}</strong> requires your approval.</p><p>Please click the link to review: <a href="${approvalLink}">View Request</a></p>`;
      const approverMailto = `mailto:${approverEmail}?subject=${encodeURIComponent(approverSubject)}&body=${encodeURIComponent(approverBody)}`;
      
      // Mail for Requester
      const requesterSubject = `PTW Submission Confirmation: ${trackingIdParam}`;
      const requesterBody = `<h1>Permit Request Submitted Successfully</h1><p>Your request with Tracking ID <strong>${trackingIdParam}</strong> has been submitted.</p><p>Track its status here: <a href="${baseUrl}/track?id=${encodeURIComponent(trackingIdParam)}">Track Submission</a></p>`;
      const requesterMailto = `mailto:${requesterEmail}?subject=${encodeURIComponent(requesterSubject)}&body=${encodeURIComponent(requesterBody)}`;

      // To avoid popup blockers, we can't open two windows at once reliably.
      // We will open the most critical one (for the approver) and inform the user to send the second one.
      // A better UX would be a small modal that lets the user click to open each one.
      // For now, let's just open the approver's email.
      window.open(approverMailto, '_self');
    }
  }, [searchParams]);


  return (
    <div className="container flex h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">
            Submission Successful!
          </CardTitle>
          <CardDescription>
            Your permit request has been submitted. Your email client should now open to send the approval request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your tracking ID is:
          </p>
          <p className="text-2xl font-mono font-bold text-primary bg-primary/10 py-2 rounded-md">
            {trackingId}
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            An email should be ready to send to the approver. Please send it. You will be notified of their
            decision. You can track the status of your request using the link below.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/track?id=${trackingId}`}>
              Track Your Submission
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
