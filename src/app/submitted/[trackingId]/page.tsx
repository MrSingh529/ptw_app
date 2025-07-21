import Link from "next/link";
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
            Your permit request has been submitted.
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
            An email has been sent to the approver for their review. You will be
            notified of their decision. You can track the status of your
            request using the link below.
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
