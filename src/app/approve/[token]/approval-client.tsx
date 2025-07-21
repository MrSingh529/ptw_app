"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { PtwFormValues } from "@/lib/schema";
import { Permit } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updatePermitStatus } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, ThumbsDown, ThumbsUp, XCircle, Image as ImageIcon } from "lucide-react";

interface ApprovalClientProps {
  permit: Permit;
  token: string;
}

export function ApprovalClient({ permit, token }: ApprovalClientProps) {
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [isActioned, setIsActioned] = useState(false);
  const [finalStatus, setFinalStatus] = useState<"Approved" | "Rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (status: "Approved" | "Rejected") => {
    setError(null);
    startTransition(async () => {
      const response = await updatePermitStatus(token, status, rejectionRemarks);
      if (response.success) {
        setIsActioned(true);
        setFinalStatus(response.status);
        toast({
          title: "Action Recorded",
          description: `Permit has been ${response.status}.`,
        });
      } else {
        setError(response.error || "An unknown error occurred.");
      }
    });
  };

  const data = permit.data as Partial<PtwFormValues>;

  if (isActioned) {
    return (
        <Alert variant={finalStatus === 'Approved' ? 'default' : 'destructive'} className="border-2">
            {finalStatus === 'Approved' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle className="text-xl font-bold">Action Complete</AlertTitle>
            <AlertDescription className="text-base">
            The permit has been successfully <strong>{finalStatus}</strong>. The requester has been notified.
            </AlertDescription>
        </Alert>
    );
  }
  
  const fileUploads = data.uploadedFiles as { ppe?: string; team?: string; certifications?: string; siteConditions?: string; } | undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Requester and Site Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Company:</strong> {data.requesterCompany}</div>
          <div><strong>Site Name:</strong> {data.siteName}</div>
          <div><strong>Site ID:</strong> {data.siteId}</div>
          <div><strong>Permission Date:</strong> {data.permissionDate ? new Date(data.permissionDate).toLocaleDateString() : 'N/A'}</div>
          <div><strong>Region:</strong> {data.region}</div>
          <div><strong>Circle:</strong> {data.circle}</div>
          <div><strong>Requester Email:</strong> {data.requesterEmail}</div>
          <div><strong>Contact:</strong> {data.contactNumber}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work and Team Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold">Team Members:</h4>
                <ul className="list-disc pl-5 text-sm">
                    {data.teamMembers?.map((member, i) => <li key={i}>{member.name} ({member.farmOrToclip})</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold">Work Types:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                    {data.workTypes?.map(wt => <Badge key={wt} variant="secondary">{wt}</Badge>)}
                </div>
                {data.workTypes?.includes('Other') && <p className="text-sm mt-2"><strong>Other Details:</strong> {data.otherWorkDescription}</p>}
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Safety Confirmations & Uploads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
             <div>
                <h4 className="font-semibold">Tool-Box Talks Confirmed:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                    {data.toolBoxTalks?.map(item => <Badge key={item} variant="outline">{item}</Badge>)}
                </div>
            </div>
             <p className="text-sm">Risk Assessment & PPE confirmed by requester.</p>
             <p className="text-sm">Declaration confirmed by requester.</p>
             <div>
                <h4 className="font-semibold">Uploaded Files:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {fileUploads?.ppe && <FilePreview label="PPE Photo" url={fileUploads.ppe} />}
                    {fileUploads?.team && <FilePreview label="Team Photo" url={fileUploads.team} />}
                    {fileUploads?.certifications && <FilePreview label="Certifications Photo" url={fileUploads.certifications} />}
                    {fileUploads?.siteConditions && <FilePreview label="Site Conditions Photo" url={fileUploads.siteConditions} />}
                </div>
                {!fileUploads || Object.values(fileUploads).every(url => !url) && (
                    <p className="text-sm text-muted-foreground mt-2">No files were uploaded.</p>
                )}
             </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Approval Action</CardTitle>
            <CardDescription>Review the details above and approve or reject the permit request.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-4">
            {error && <p className="text-sm text-destructive mr-auto">{error}</p>}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isPending}>
                        <ThumbsDown className="mr-2 h-4 w-4"/>
                        Reject
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Permit Request</DialogTitle>
                        <DialogDescription>
                            Please provide mandatory remarks for rejecting this permit. This will be sent to the requester.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="remarks">Rejection Remarks</Label>
                        <Textarea id="remarks" value={rejectionRemarks} onChange={e => setRejectionRemarks(e.target.value)} placeholder="e.g., Site photo is not clear."/>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => handleAction('Rejected')} disabled={isPending || !rejectionRemarks}>
                            Submit Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button onClick={() => handleAction('Approved')} disabled={isPending} className="bg-green-600 hover:bg-green-700">
                <ThumbsUp className="mr-2 h-4 w-4"/>
                Approve
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function FilePreview({ label, url }: { label: string; url: string }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="overflow-hidden transition-all group-hover:shadow-lg group-hover:border-primary">
                 <div className="relative aspect-video w-full">
                    <Image src={url} alt={label} fill={true} objectFit="cover" className="transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-semibold">View Full Image</p>
                    </div>
                </div>
                <CardContent className="p-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        {label}
                    </p>
                </CardContent>
            </Card>
        </a>
    )
}
