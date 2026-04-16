import { useState } from "react";
import SignupForm from "./SignupForm";
import type { SignupResponseDto } from "../types/checkIn";

export default function SignupPage() {
  const [result, setResult] = useState<SignupResponseDto | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Daily Check-In</h1>
          <p className="text-sm text-slate-400">
            Sign up with your email to receive an interactive check-in link.
          </p>
        </header>

        {result ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm text-slate-300">
              We sent your Daily Check-In email. Open it to continue the practice.
            </p>
          </section>
        ) : (
          <SignupForm onSignedUp={setResult} />
        )}
      </div>
    </main>
  );
}

