"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state-provider";
import { buildAnalytics } from "@/lib/analytics";

export function ImportantPage() {
  const { progressMap } = useAppState();
  const analytics = buildAnalytics(progressMap);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {analytics.importantChapters.map((chapter) => (
        <div key={chapter.chapterName} className="glass-card rounded-[30px] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted))]">{chapter.subject}</p>
          <h3 className="mt-2 text-2xl font-semibold">{chapter.chapterName}</h3>
          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Completion</span>
                <span>{chapter.completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/35 dark:bg-white/10">
                <div className="h-2 rounded-full bg-sky-500" style={{ width: `${chapter.completion}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Readiness</span>
                <span>{chapter.readiness}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/35 dark:bg-white/10">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${chapter.readiness}%` }} />
              </div>
            </div>
          </div>
          <Link
            href={
              chapter.subject === "Physics"
                ? "/physics"
                : chapter.subject === "Chemistry"
                  ? "/chemistry"
                  : "/mathematics"
            }
            className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm dark:border-white/10"
          >
            Open subject
          </Link>
        </div>
      ))}
    </div>
  );
}
