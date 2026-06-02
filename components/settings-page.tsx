"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppState } from "@/components/app-state-provider";

export function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { exportProgress, resetProgress, isSupabase } = useAppState();

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jee-progress-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[30px] p-6">
        <h3 className="text-xl font-semibold">Sync Status</h3>
        <div className="mt-3 flex items-center gap-3">
          {isSupabase ? (
            <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Sync Active
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Device-Local Storage Mode
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-[hsl(var(--muted))]">
          {isSupabase
            ? "Your progress is secured and synchronized across all your devices in real-time."
            : "Your progress is stored locally on this machine. To persist progress securely in the cloud, populate the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY variables in .env.local."}
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
      <section className="glass-card rounded-[30px] p-5">
        <h3 className="text-xl font-semibold">Theme</h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">Choose a calm light or dark interface.</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 ${resolvedTheme === "light" ? "bg-white text-slate-950" : "bg-white/55 dark:bg-white/5"}`}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 ${resolvedTheme === "dark" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/55 dark:bg-white/5"}`}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </div>
      </section>

      <section className="glass-card rounded-[30px] p-5">
        <h3 className="text-xl font-semibold">Export Progress</h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">Download your entire tracker state as JSON.</p>
        <button onClick={handleExport} className="mt-5 rounded-full bg-slate-950 px-4 py-3 text-sm text-white dark:bg-white dark:text-slate-950">
          Export JSON
        </button>
      </section>

      <section className="glass-card rounded-[30px] p-5">
        <h3 className="text-xl font-semibold">Reset Progress</h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">Clear all subtopic, revision, and practice data for this device account.</p>
        <button onClick={resetProgress} className="mt-5 rounded-full bg-red-500 px-4 py-3 text-sm text-white">
          Reset progress
        </button>
      </section>
      </div>
    </div>
  );
}
