import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppFooter() {
    return (
        <footer className="mt-auto border-t py-4">
            <div className="container mx-auto flex max-w-4xl items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="mailto:harpinder.singh@rvsolutions.in">Tech Support</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="mailto:richa.babbar@rvsolutions.in">Process Support</Link>
                    </Button>
                </div>
                <p>Developed with Care & ❤️ by Harpinder Singh.</p>
            </div>
      </footer>
    );
}
