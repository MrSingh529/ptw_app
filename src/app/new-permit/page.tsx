
import { PtwForm } from "@/components/ptw-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { AppFooter } from "@/components/app-footer";

export const dynamic = 'force-dynamic';

export default function NewPermitPage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl py-8">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            New Permit to Work
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Please fill out the form below to request a permit. All fields are
            mandatory unless specified otherwise.
          </p>
        </header>
        <Suspense fallback={<FormSkeleton />}>
          <PtwForm />
        </Suspense>
      </div>
      <AppFooter />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-56 w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
