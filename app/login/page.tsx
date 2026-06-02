"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/app-state-provider";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, ready, login } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && currentUser) router.replace("/dashboard");
  }, [currentUser, ready, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to log in.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_24%),hsl(var(--bg))] p-4 text-[hsl(var(--text))]">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">JEE Advanced</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">Sign in and continue the long game from your iPhone, iPad, or desktop.</p>
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
          Login
        </button>
        <p className="mt-4 text-sm text-[hsl(var(--muted))]">
          Need an account? <Link href="/signup" className="font-medium text-[hsl(var(--text))]">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

