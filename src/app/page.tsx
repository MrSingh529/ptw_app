
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Shield, Workflow } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Work Safety with PermitFlow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our digital Permit-to-Work system simplifies safety protocols, ensuring every task is authorized and compliant, quickly and efficiently.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/new-permit">Start New Permit</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/track">Track a Permit</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/hero-image.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="construction safety planning"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Everything You Need for a Safer Workplace</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From intuitive forms to real-time tracking and powerful analytics, PermitFlow provides a comprehensive solution for managing work permits.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Bilingual Forms</CardTitle>
                  <Workflow className="w-6 h-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Easy-to-fill forms in both English and Hindi, ensuring clarity for all team members.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">AI-Powered Insights</CardTitle>
                  <Check className="w-6 h-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Get intelligent suggestions on rejected permits to improve your chances of approval.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Real-Time Tracking</CardTitle>
                  <Shield className="w-6 h-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Monitor the status of your permit from submission to approval with a unique tracking ID.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 RV Solutions X PermitFlow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Developed with Care & ❤️ by CEO Office.
          </Link>
        </nav>
      </footer>
    </div>
  );
}
