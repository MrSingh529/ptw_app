import { Suspense } from 'react';
import { TrackingClient } from './tracking-client';

export default function TrackPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Track Your Permit
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Enter your tracking ID below to see the current status of your request.
        </p>
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        <TrackingClient />
      </Suspense>
    </div>
  );
}
