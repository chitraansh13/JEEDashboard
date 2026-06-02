import {
  ProgressRecord,
  SubjectName,
  getAllSubtopics,
  getImportantChapterTargets,
  getSubject
} from "@/lib/syllabus";

const PROGRESS_WEIGHT = 6;

const percent = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100));

export const getDefaultProgress = (subtopicId: string): ProgressRecord => ({
  subtopicId,
  learningStatus: "not_started",
  revision1: false,
  revision2: false,
  revision3: false,
  pyqCompleted: false,
  advancedQuestionsCompleted: false,
  updatedAt: null,
  completedAt: null
});

export const getReadinessValue = (record: ProgressRecord) => {
  return [
    record.learningStatus === "completed",
    record.revision1,
    record.revision2,
    record.revision3,
    record.pyqCompleted,
    record.advancedQuestionsCompleted
  ].filter(Boolean).length;
};

export const buildAnalytics = (progressMap: Record<string, ProgressRecord>) => {
  const subtopics = getAllSubtopics();
  const totals = {
    subtopics: subtopics.length,
    readinessPossible: subtopics.length * PROGRESS_WEIGHT
  };

  let completionCount = 0;
  let readinessCount = 0;

  const subjectBreakdown = {} as Record<SubjectName, { total: number; completed: number }>;
  const classBreakdown: Record<string, { total: number; completed: number }> = {
    "11": { total: 0, completed: 0 },
    "12": { total: 0, completed: 0 }
  };
  const unitBreakdown: Record<string, { total: number; completed: number; subject: SubjectName }> = {};
  const recentCompleted: { id: string; name: string; path: string[]; completedAt: string }[] = [];
  const dailyCounts: Record<string, number> = {};

  for (const subtopic of subtopics) {
    const record = progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id);
    const completed = record.learningStatus === "completed";
    if (completed) completionCount += 1;
    readinessCount += getReadinessValue(record);

    if (!subjectBreakdown[subtopic.subjectName]) {
      subjectBreakdown[subtopic.subjectName] = { total: 0, completed: 0 };
    }
    subjectBreakdown[subtopic.subjectName].total += 1;
    if (completed) subjectBreakdown[subtopic.subjectName].completed += 1;

    for (const classTag of subtopic.classTags) {
      classBreakdown[classTag].total += 1;
      if (completed) classBreakdown[classTag].completed += 1;
    }

    if (!unitBreakdown[subtopic.unitName]) {
      unitBreakdown[subtopic.unitName] = { total: 0, completed: 0, subject: subtopic.subjectName };
    }
    unitBreakdown[subtopic.unitName].total += 1;
    if (completed) unitBreakdown[subtopic.unitName].completed += 1;

    if (record.completedAt) {
      recentCompleted.push({
        id: subtopic.id,
        name: subtopic.name,
        path: subtopic.path,
        completedAt: record.completedAt
      });
      const day = record.completedAt.slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] ?? 0) + 1;
    }
  }

  const weeklyActivity = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: dailyCounts[key] ?? 0,
      date: key
    };
  });

  const heatmap = Array.from({ length: 21 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (20 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      count: dailyCounts[key] ?? 0
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let cursor = new Date();
  while ((dailyCounts[cursor.toISOString().slice(0, 10)] ?? 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const completionDays = Object.keys(dailyCounts).sort();
  let longestStreak = 0;
  let running = 0;
  let previous: string | null = null;
  for (const day of completionDays) {
    if (!previous) {
      running = 1;
    } else {
      const prevDate = new Date(previous);
      prevDate.setDate(prevDate.getDate() + 1);
      running = prevDate.toISOString().slice(0, 10) === day ? running + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, running);
    previous = day;
  }

  const importantChapters = getImportantChapterTargets().map((chapterName) => {
    const subjectHit =
      getSubject("Physics")?.units.flatMap((unit) => unit.chapters).find((chapter) => chapter.name === chapterName) ??
      getSubject("Chemistry")?.units.flatMap((unit) => unit.chapters).find((chapter) => chapter.name === chapterName) ??
      getSubject("Mathematics")?.units.flatMap((unit) => unit.chapters).find((chapter) => chapter.name === chapterName);

    const chapterSubtopics =
      subjectHit?.topics.flatMap((topic) => topic.subtopics) ?? [];
    const chapterCompleted = chapterSubtopics.filter(
      (subtopic) => (progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id)).learningStatus === "completed"
    ).length;
    const chapterReadiness = chapterSubtopics.reduce(
      (sum, subtopic) => sum + getReadinessValue(progressMap[subtopic.id] ?? getDefaultProgress(subtopic.id)),
      0
    );

    return {
      chapterName,
      subject: subjectHit?.topics[0]?.subtopics[0]?.subjectName ?? "Physics",
      completion: percent(chapterCompleted, chapterSubtopics.length),
      readiness: percent(chapterReadiness, chapterSubtopics.length * PROGRESS_WEIGHT)
    };
  });

  return {
    totals,
    overallReadiness: percent(readinessCount, totals.readinessPossible),
    syllabusCompletion: percent(completionCount, totals.subtopics),
    subjectBreakdown,
    classBreakdown,
    unitBreakdown,
    weeklyActivity,
    heatmap,
    streak,
    longestStreak,
    recentCompleted: recentCompleted.sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 10),
    importantChapters,
    completedCount: completionCount,
    remainingCount: totals.subtopics - completionCount,
    todayKey: today
  };
};
