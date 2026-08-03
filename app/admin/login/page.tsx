"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { login } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {state?.error && (
        <p className="text-[13px] text-oxblood" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing In…" : "Sign In"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex flex-col items-center leading-none mb-10">
          <span className="font-serif-display text-2xl text-charcoal">
            Finding <em className="italic text-bronze-dark">Treasures</em>
          </span>
          <span className="text-[10px] tracking-[0.32em] uppercase text-charcoal-soft mt-1">
            4 U
          </span>
        </Link>

        <div className="border border-line p-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-bronze-dark mb-1.5">
            Owner Access
          </p>
          <h1 className="font-serif-display text-2xl text-charcoal mb-6">Admin Sign In</h1>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
