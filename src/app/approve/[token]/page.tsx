import { getPermitForApproval } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ApprovalClient } from "./approval-client";

interface ApprovalPageProps {
  params: {
    token: string;
  };
}

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const { token } = params;
  const { success, permit, error } = await getPermitForApproval(token);

  if (!success || !permit) {
    return (
      <div className="container flex items-center justify-center py-10">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Could not load permit details."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
        <header className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
                Permit Approval Request
            </h1>
            <p className="mt-2 text-muted-foreground">
                Tracking ID: <span className="font-mono text-primary">{permit.trackingId}</span>
            </p>
        </header>
        <ApprovalClient permit={permit} token={token} />
    </div>
  );
}
