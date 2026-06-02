"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Flame,
  Home,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Target
} from "lucide-react";
import { searchSyllabus } from "@/lib/syllabus";
import { useAppState } from "@/components/app-state-provider";

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/physics", label: "Physics", icon: Sparkles },
  { href: "/chemistry", label: "Chemistry", icon: BookOpen },
  { href: "/mathematics", label: "Maths", icon: Target },
  { href: "/revision", label: "Revision", icon: Flame }
];

const secondaryLinks = [
  { href: "/important", label: "Important", icon: ChevronRight },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser, logout } = useAppState();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = useMemo(() => searchSyllabus(query), [query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_26%),radial-gradient(circle_at_bottom,rgba(251,191,36,0.14),transparent_24%),hsl(var(--bg))] text-[hsl(var(--text))]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <aside className="glass-card sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] flex-col rounded-[30px] p-5 lg:flex">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">JEE Advanced</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Prep OS</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">Built for a two-year grind, not a checklist weekend.</p>
          </div>

          <nav className="space-y-2">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-white/70 text-slate-950 shadow-glass dark:bg-white/10 dark:text-white"
                      : "text-[hsl(var(--muted))] hover:bg-white/40 hover:text-[hsl(var(--text))] dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/20 pt-6 dark:border-white/10">
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-white/70 text-slate-950 dark:bg-white/10 dark:text-white"
                      : "text-[hsl(var(--muted))] hover:bg-white/40 hover:text-[hsl(var(--text))] dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto rounded-[26px] border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium">{currentUser}</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted))]">Local session active</p>
            <button
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm hover:bg-white/60 dark:border-white/10 dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="glass-card sticky top-4 z-20 mb-6 rounded-[28px] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">Apple-style focus mode</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted))]">{description}</p>
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/20 bg-white/65 px-5 py-3 text-sm text-[hsl(var(--muted))] shadow-glass transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
                Search chapter, topic, or subtopic
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>

      <nav className="glass-card fixed inset-x-4 bottom-4 z-30 grid grid-cols-5 rounded-[26px] p-2 lg:hidden">
        {primaryLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${
                active ? "bg-white/75 text-slate-950 dark:bg-white/10 dark:text-white" : "text-[hsl(var(--muted))]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/35 p-4 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="glass-card mx-auto mt-12 max-w-3xl rounded-[32px] p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 rounded-[22px] border border-white/20 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-[hsl(var(--muted))]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search capacitor, electrostatics, aldehydes..."
                  className="w-full bg-transparent text-base outline-none placeholder:text-[hsl(var(--muted))]"
                />
              </div>
              <div className="mt-4 space-y-2">
                {results.length === 0 ? (
                  <p className="rounded-[24px] px-4 py-8 text-center text-sm text-[hsl(var(--muted))]">
                    Search results will appear here.
                  </p>
                ) : (
                  results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={() => setSearchOpen(false)}
                      className="block rounded-[24px] border border-white/15 bg-white/45 px-4 py-3 transition hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{result.label}</p>
                          <p className="mt-1 text-xs text-[hsl(var(--muted))]">{result.path.join(" > ")}</p>
                        </div>
                        <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] dark:bg-white/10">
                          {result.kind}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
