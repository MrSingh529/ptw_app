
"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";

export function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-4 z-50">
       <div className="container h-14 w-full max-w-4xl rounded-full border border-black/5 bg-background/60 p-2 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 dark:bg-zinc-800/60">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center">
             <Link href="/" className="mr-6 flex items-center space-x-2 pl-4">
              <Image 
                src="/logo.png" 
                alt="PermitFlow Logo" 
                width={100} 
                height={120} 
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
          <div className="flex items-center justify-end space-x-2 pr-2">
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden md:flex">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                   <div className="flex flex-col gap-4 py-8">
                     <Link href="/new-permit" className="text-lg" onClick={() => setOpen(false)}>New Permit</Link>
                     <Link href="/track" className="text-lg" onClick={() => setOpen(false)}>Track</Link>
                     <Link href="/admin" className="text-lg" onClick={() => setOpen(false)}>Admin</Link>
                     {user && (
                        <Button variant="ghost" onClick={() => { signOut(); setOpen(false); }} className="justify-start text-lg -ml-4 mt-4">
                           <LogOut className="mr-2 h-5 w-5" />
                           Sign Out
                        </Button>
                     )}
                   </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
