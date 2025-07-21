
import { PtwForm } from "@/components/ptw-form";

export default function NewPermitPage() {
  return (
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
      <PtwForm />
    </div>
  );
}
