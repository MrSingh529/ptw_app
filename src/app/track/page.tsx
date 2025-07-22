
import { Suspense } from 'react';
import { TrackingClient } from './tracking-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AppFooter } from '@/components/app-footer';

export const dynamic = 'force-dynamic';

export default function TrackPage() {
  return (
    <>
    <div className="container mx-auto max-w-2xl py-8 flex-1">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Track Your Permit
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Enter your tracking ID below to see the current status of your request.
        </p>
      </header>
      <Suspense fallback={<CardSkeleton />}>
        <TrackingClient />
      </Suspense>
    </div>
    <AppFooter />
    </>
  );
}


function CardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </CardContent>
        </Card>
    )
}
