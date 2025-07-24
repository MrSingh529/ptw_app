
"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-4 z-50">
       <div className="container h-14 w-full max-w-4xl rounded-full border border-black/5 bg-background/60 p-2 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 dark:bg-zinc-800/60">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center">
             <Link href="/" className="mr-6 flex items-center space-x-2 pl-4">
              <Image 
                src="/logo.png" 
                alt="Surbक्षा PTW Logo" 
                width={50} 
                height={50} 
                className="object-contain"
              />
            </Link>
            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link
                href="/new-permit"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                New Permit
              </Link>
              <Link
                href="/track"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                Track
              </Link>
              <Link
                href="/admin"
                className="transition-colors hover:text-primary text-foreground/80"
              >
                Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center justify-end space-x-4 pr-2">
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
