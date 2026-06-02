"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/app-state-provider";

export default function SignupPage() {
  const router = useRouter();
  const { currentUser, ready, signup } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && currentUser) router.replace("/dashboard");
  }, [currentUser, ready, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await signup(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign up.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_24%),hsl(var(--bg))] p-4 text-[hsl(var(--text))]">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">Create account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Start your 2-year tracker</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">A clean, Apple-style prep system that remembers every micro-topic.</p>
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/70 px-4 outline-none dark:border-white/10 dark:bg-white/5"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/20 bg-white/70 px-4 outline-none dark:border-white/10 dark:bg-white/5"
            required
          />
        </div>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <button className="mt-6 min-h-12 w-full rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          Sign up
        </button>
        <p className="mt-4 text-sm text-[hsl(var(--muted))]">
          Already have an account? <Link href="/login" className="font-medium text-[hsl(var(--text))]">Login</Link>
        </p>
      </form>
    </div>
  );
}

