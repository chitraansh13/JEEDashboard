"use client";

import { useAppState } from "@/components/app-state-provider";
import { getDefaultProgress } from "@/lib/analytics";
import { getAllSubtopics } from "@/lib/syllabus";

export function RevisionPage() {
  const { progressMap, updateLearningStatus, toggleFlag } = useAppState();
  const now = Date.now();

  const queues = getAllSubtopics().reduce(
    (acc, subtopic) => {
      const record = progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id);
      const stale = record.updatedAt ? now - new Date(record.updatedAt).getTime() > 1000 * 60 * 60 * 24 * 14 : false;
      if (record.learningStatus === "completed" && (!record.revision1 || stale)) acc.needsRevision.push({ subtopic, record });
      if (record.learningStatus !== "not_started" && (!record.pyqCompleted || !record.advancedQuestionsCompleted)) {
        acc.practicePending.push({ subtopic, record });
      }
      if (record.learningStatus === "learning" || (record.learningStatus === "completed" && !record.revision2 && !record.revision3)) {
        acc.weakTopics.push({ subtopic, record });
      }
      return acc;
    },
    {
      needsRevision: [] as Array<{ subtopic: ReturnType<typeof getAllSubtopics>[number]; record: ReturnType<typeof getDefaultProgress> }>,
      practicePending: [] as Array<{ subtopic: ReturnType<typeof getAllSubtopics>[number]; record: ReturnType<typeof getDefaultProgress> }>,
      weakTopics: [] as Array<{ subtopic: ReturnType<typeof getAllSubtopics>[number]; record: ReturnType<typeof getDefaultProgress> }>
    }
  );

  const sections = [
    { title: "Needs Revision", data: queues.needsRevision.slice(0, 25) },
    { title: "Weak Topics", data: queues.weakTopics.slice(0, 25) },
    { title: "Practice Pending", data: queues.practicePending.slice(0, 25) }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {sections.map((section) => (
        <section key={section.title} className="glass-card rounded-[30px] p-5">
          <h3 className="text-xl font-semibold">{section.title}</h3>
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">{section.data.length} queued subtopics</p>
          <div className="mt-5 space-y-3">
            {section.data.length === 0 ? (
              <div className="rounded-[24px] border border-white/15 bg-white/45 p-5 text-sm text-[hsl(var(--muted))] dark:border-white/10 dark:bg-white/5">
                Nothing here right now.
              </div>
            ) : (
              section.data.map(({ subtopic, record }) => (
                <div key={subtopic.id} className="rounded-[24px] border border-white/15 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="font-medium">{subtopic.name}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">{subtopic.path.join(" > ")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateLearningStatus(subtopic.id, record.learningStatus === "completed" ? "learning" : "completed")}
                      className="rounded-full bg-slate-950 px-3 py-2 text-xs text-white dark:bg-white dark:text-slate-950"
                    >
                      {record.learningStatus === "completed" ? "Mark learning" : "Mark completed"}
                    </button>
                    {[
                      ["revision1", "Rev 1"],
                      ["revision2", "Rev 2"],
                      ["revision3", "Rev 3"],
                      ["pyqCompleted", "PYQ"],
                      ["advancedQuestionsCompleted", "Advanced"]
                    ].map(([field, label]) => (
                      <button
                        key={field}
                        onClick={() => toggleFlag(subtopic.id, field as never)}
                        className="rounded-full border border-white/20 px-3 py-2 text-xs dark:border-white/10"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
