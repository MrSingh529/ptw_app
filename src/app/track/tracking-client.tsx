
"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPermitStatus } from "../actions";
import { PtwFormValues } from "@/lib/schema";
import { differenceInDays } from "date-fns";

interface StatusResult {
  status: "Pending" | "Approved" | "Rejected" | "Resubmitted";
  submittedAt: Date;
  lastUpdatedAt: Date;
  rejectionRemarks?: string;
  aiSuggestions?: string;
  data: PtwFormValues;
  resubmittedFrom?: string;
  resubmittedTo?: string;
}

export function TrackingClient() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTrack = () => {
    if (!trackingId) {
      setError("Please enter a tracking ID.");
      return;
    }
    setError(null);
    setResult(null);
    startTransition(async () => {
      const response = await getPermitStatus(trackingId);
      if (response.success) {
        setResult(response as unknown as StatusResult);
      } else {
        setError(response.error || "An unknown error occurred.");
      }
    });
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      handleTrack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Resubmitted":
          return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Resubmitted</Badge>;
      case "Pending":
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const createResubmitQuery = (data: PtwFormValues) => {
    const query = new URLSearchParams();
    
    // Add simple key-value pairs
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        query.append(key, String(value));
      }
    });

    // Handle complex types
    if (data.teamMembers) {
      query.append('teamMembers', JSON.stringify(data.teamMembers));
    }
     if (data.workTypes) {
      query.append('workTypes', data.workTypes.join(','));
    }
     if (data.toolBoxTalks) {
      query.append('toolBoxTalks', data.toolBoxTalks.join(','));
    }

    // Exclude file uploads from query params
    return query.toString();
  };

  const daysPending = result && result.status === 'Pending' 
    ? differenceInDays(new Date(), new Date(result.submittedAt))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Status</CardTitle>
        <CardDescription>Enter the tracking ID you received upon submission.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="PTW/RV/SITEID/2024-25/ABC123"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          />
          <Button onClick={handleTrack} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">Track</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <Alert>
            <AlertTitle className="flex items-center justify-between">
              <span>Status Details</span>
              {getStatusBadge(result.status)}
            </AlertTitle>
            <AlertDescription as="div" className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>Submitted By:</strong> {result.data.requesterEmail}</div>
                <div><strong>Approver:</strong> {result.data.approverEmail}</div>
                <div><strong>Submitted At:</strong> {new Date(result.submittedAt).toLocaleString()}</div>
                <div><strong>Last Updated:</strong> {new Date(result.lastUpdatedAt).toLocaleString()}</div>
              </div>
              
              {result.status === 'Pending' && (
                <p className="font-semibold text-amber-600">
                  Pending for: {daysPending} day{daysPending === 1 ? '' : 's'}
                </p>
              )}

               {result.resubmittedFrom && (
                    <div className="pt-2">
                      <p><strong>Note:</strong> This permit is a resubmission for the original permit with ID <span className="font-mono">{result.resubmittedFrom}</span>.</p>
                    </div>
              )}

              {result.resubmittedTo && (
                    <div className="pt-2">
                      <p><strong>Note:</strong> This permit was resubmitted and replaced by a new permit with ID <span className="font-mono">{result.resubmittedTo}</span>.</p>
                       <Button asChild variant="link" size="sm" className="px-0 h-auto">
                           <Link href={`/track?id=${result.resubmittedTo}`}>
                                View New Submission
                           </Link>
                       </Button>
                    </div>
              )}

              {result.status === "Rejected" && (
                <>
                  {result.rejectionRemarks && (
                    <div className="pt-2">
                      <p><strong>Rejection Remarks:</strong></p>
                      <p className="p-2 bg-muted rounded-md">{result.rejectionRemarks}</p>
                    </div>
                  )}
                  {result.aiSuggestions && (
                     <div className="pt-2">
                        <p><strong>AI-Powered Suggestions:</strong></p>
                        <p className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md whitespace-pre-wrap">{result.aiSuggestions}</p>
                    </div>
                  )}
                  <Button asChild size="sm" className="mt-2">
                      <Link href={{ pathname: '/new-permit', query: { resubmit: trackingId, ...Object.fromEntries(new URLSearchParams(createResubmitQuery(result.data))) } }}>
                          Resubmit Permit
                      </Link>
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
