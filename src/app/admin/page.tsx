import { Suspense } from 'react';
import { AdminClient } from './admin-client';
import { AuthGuard } from '@/components/auth-guard';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Overview and management of all PTW requests.
          </p>
        </header>

        <Suspense fallback={<DashboardSkeleton />}>
          <AdminClient />
        </Suspense>
        
      </div>
    </AuthGuard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  )
}
