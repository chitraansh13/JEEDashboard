"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, CircleDashed, Filter } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { buildAnalytics, getDefaultProgress, getReadinessValue } from "@/lib/analytics";
import { ChapterNode, SubjectName, getSubject } from "@/lib/syllabus";

const subjectAccent: Record<SubjectName, string> = {
  Physics: "bg-sky-500",
  Chemistry: "bg-emerald-500",
  Mathematics: "bg-amber-500"
};

function ChapterCard({ chapter, subject }: { chapter: ChapterNode; subject: SubjectName }) {
  const { progressMap, updateLearningStatus, toggleFlag } = useAppState();
  const total = chapter.topics.flatMap((topic) => topic.subtopics).length;
  const completed = chapter.topics
    .flatMap((topic) => topic.subtopics)
    .filter((subtopic) => (progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id)).learningStatus === "completed").length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <details id={chapter.id} className="glass-card rounded-[28px] p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${subjectAccent[subject]}`} />
              <p className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--muted))]">{chapter.classTags.join(" / ")}</p>
            </div>
            <h3 className="text-xl font-semibold">{chapter.name}</h3>
          </div>
          <div className="min-w-[180px]">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[hsl(var(--muted))]">Chapter progress</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/40 dark:bg-white/10">
              <div className={`h-2 rounded-full ${subjectAccent[subject]}`} style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-5 space-y-4">
        {chapter.topics.map((topic) => (
          <div key={topic.id} className="rounded-[24px] border border-white/15 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
            <h4 className="mb-3 text-base font-semibold">{topic.name}</h4>
            <div className="space-y-3">
              {topic.subtopics.map((subtopic) => {
                const record = progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id);
                const readiness = getReadinessValue(record);
                return (
                  <div
                    key={subtopic.id}
                    className="rounded-[22px] border border-white/15 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{subtopic.name}</p>
                        <p className="mt-1 text-xs text-[hsl(var(--muted))]">Readiness {readiness}/6</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["not_started", "Not started"],
                          ["learning", "Learning"],
                          ["completed", "Completed"]
                        ].map(([status, label]) => (
                          <button
                            key={status}
                            onClick={() => updateLearningStatus(subtopic.id, status as never)}
                            className={`rounded-full px-3 py-2 text-xs ${
                              record.learningStatus === status
                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                : "border border-white/20 bg-white/70 text-[hsl(var(--muted))] dark:border-white/10 dark:bg-white/5"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ["revision1", "Rev 1"],
                        ["revision2", "Rev 2"],
                        ["revision3", "Rev 3"],
                        ["pyqCompleted", "PYQ"],
                        ["advancedQuestionsCompleted", "Advanced"]
                      ].map(([field, label]) => {
                        const active = Boolean(record[field as keyof typeof record]);
                        return (
                          <button
                            key={field}
                            onClick={() => toggleFlag(subtopic.id, field as never)}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-xs ${
                              active
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "border border-white/20 bg-white/60 text-[hsl(var(--muted))] dark:border-white/10 dark:bg-white/5"
                            }`}
                          >
                            {active ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

export function SubjectPage({ subjectName }: { subjectName: SubjectName }) {
  const subject = getSubject(subjectName);
  const { progressMap } = useAppState();
  const analytics = buildAnalytics(progressMap);
  const [classFilter, setClassFilter] = useState<"all" | "11" | "12">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [chemTab, setChemTab] = useState<"Physical Chemistry" | "Organic Chemistry" | "Inorganic Chemistry" | "all">("all");

  const chapters = useMemo(() => {
    if (!subject) return [];
    let base = subject.units.flatMap((unit) =>
      unit.chapters.map((chapter) => ({
        ...chapter,
        unitName: unit.name
      }))
    );

    if (subjectName === "Chemistry" && chemTab !== "all") {
      base = base.filter((chapter) => chapter.unitName === chemTab);
    }
    if (classFilter !== "all") {
      base = base.filter((chapter) => chapter.classTags.includes(classFilter));
    }
    if (statusFilter !== "all") {
      base = base.filter((chapter) => {
        const subtopics = chapter.topics.flatMap((topic) => topic.subtopics);
        const completed = subtopics.filter(
          (subtopic) => (progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id)).learningStatus === "completed"
        ).length;
        return statusFilter === "completed" ? completed === subtopics.length : completed < subtopics.length;
      });
    }
    return base;
  }, [chemTab, classFilter, progressMap, statusFilter, subject, subjectName]);

  if (!subject) return null;

  const subjectScore = analytics.subjectBreakdown[subjectName];
  const percentage = subjectScore ? Math.round((subjectScore.completed / subjectScore.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[30px] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--muted))]">{subjectName}</p>
            <h3 className="mt-2 text-4xl font-semibold tracking-tight">{percentage}% complete</h3>
            <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted))]">
              Expand by chapter, mark learning status instantly, and keep revision passes visible at the subtopic level.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/55 px-4 py-3 text-sm text-[hsl(var(--muted))] dark:border-white/10 dark:bg-white/5">
            <Filter className="h-4 w-4" />
            Trackable from phone, tablet, and desktop
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[30px] p-5">
        <div className="flex flex-wrap gap-2">
          {["all", "11", "12"].map((filter) => (
            <button
              key={filter}
              onClick={() => setClassFilter(filter as "all" | "11" | "12")}
              className={`rounded-full px-4 py-2 text-sm ${
                classFilter === filter ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/60 dark:bg-white/5"
              }`}
            >
              {filter === "all" ? "All classes" : `Class ${filter}`}
            </button>
          ))}
          {["all", "completed", "incomplete"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as "all" | "completed" | "incomplete")}
              className={`rounded-full px-4 py-2 text-sm ${
                statusFilter === filter ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white/60 dark:bg-white/5"
              }`}
            >
              {filter === "all" ? "All status" : filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        {subjectName === "Chemistry" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {["all", "Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"].map((tab) => (
              <button
                key={tab}
                onClick={() => setChemTab(tab as never)}
                className={`rounded-full px-4 py-2 text-sm ${
                  chemTab === tab ? "bg-emerald-500 text-white" : "bg-white/60 dark:bg-white/5"
                }`}
              >
                {tab === "all" ? "All chemistry" : tab}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        {chapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} subject={subjectName} />
        ))}
      </section>
    </div>
  );
}
