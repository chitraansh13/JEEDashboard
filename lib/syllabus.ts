import rawSyllabus from "@/data/syllabus.json";

export type SubjectName = "Physics" | "Chemistry" | "Mathematics";
export type LearningStatus = "not_started" | "learning" | "completed";

export type ProgressRecord = {
  subtopicId: string;
  learningStatus: LearningStatus;
  revision1: boolean;
  revision2: boolean;
  revision3: boolean;
  pyqCompleted: boolean;
  advancedQuestionsCompleted: boolean;
  updatedAt: string | null;
  completedAt: string | null;
};

export type SubtopicNode = {
  id: string;
  name: string;
  path: string[];
  chapterName: string;
  unitName: string;
  subjectName: SubjectName;
  classTags: string[];
};

export type TopicNode = {
  id: string;
  name: string;
  subtopics: SubtopicNode[];
};

export type ChapterNode = {
  id: string;
  name: string;
  classTags: string[];
  topics: TopicNode[];
};

export type UnitNode = {
  id: string;
  name: string;
  chapters: ChapterNode[];
};

export type SubjectNode = {
  id: string;
  name: SubjectName;
  units: UnitNode[];
};

export type SearchResult = {
  id: string;
  label: string;
  kind: "chapter" | "topic" | "subtopic";
  href: string;
  path: string[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const subjectRouteMap: Record<SubjectName, string> = {
  Physics: "/physics",
  Chemistry: "/chemistry",
  Mathematics: "/mathematics"
};

const normalizedSubjects: SubjectNode[] = rawSyllabus.subjects.map((subject) => {
  const subjectId = slugify(subject.name);
  return {
    id: subjectId,
    name: subject.name as SubjectName,
    units: subject.units.map((unit) => {
      const unitId = `${subjectId}__${slugify(unit.name)}`;
      return {
        id: unitId,
        name: unit.name,
        chapters: unit.chapters.map((chapter) => {
          const chapterId = `${unitId}__${slugify(chapter.name)}`;
          const classTags = chapter.class_tags ?? ["11", "12"];
          return {
            id: chapterId,
            name: chapter.name,
            classTags,
            topics: chapter.topics.map((topic) => {
              const topicId = `${chapterId}__${slugify(topic.name)}`;
              return {
                id: topicId,
                name: topic.name,
                subtopics: topic.subtopics.map((subtopic) => ({
                  id: `${topicId}__${slugify(subtopic)}`,
                  name: subtopic,
                  path: [subject.name, unit.name, chapter.name, topic.name, subtopic],
                  chapterName: chapter.name,
                  unitName: unit.name,
                  subjectName: subject.name as SubjectName,
                  classTags
                }))
              };
            })
          };
        })
      };
    })
  };
});

const allSubtopics = normalizedSubjects.flatMap((subject) =>
  subject.units.flatMap((unit) =>
    unit.chapters.flatMap((chapter) => chapter.topics.flatMap((topic) => topic.subtopics))
  )
);

const allChapters = normalizedSubjects.flatMap((subject) =>
  subject.units.flatMap((unit) => unit.chapters.map((chapter) => ({ subject, unit, chapter })))
);

const allTopics = normalizedSubjects.flatMap((subject) =>
  subject.units.flatMap((unit) =>
    unit.chapters.flatMap((chapter) => chapter.topics.map((topic) => ({ subject, unit, chapter, topic })))
  )
);

export const syllabus = normalizedSubjects;
export const totalSubtopics = allSubtopics.length;

export const getSubjectRoute = (subject: SubjectName) => subjectRouteMap[subject];

export const getSubject = (subjectName: SubjectName) =>
  normalizedSubjects.find((subject) => subject.name === subjectName);

export const getAllSubtopics = () => allSubtopics;

export const getSubtopicMap = () =>
  allSubtopics.reduce<Record<string, SubtopicNode>>((acc, subtopic) => {
    acc[subtopic.id] = subtopic;
    return acc;
  }, {});

export const searchSyllabus = (query: string): SearchResult[] => {
  const value = query.trim().toLowerCase();
  if (!value) return [];

  const chapterResults = allChapters
    .filter(({ chapter }) => chapter.name.toLowerCase().includes(value))
    .slice(0, 10)
    .map(({ subject, unit, chapter }) => ({
      id: chapter.id,
      label: chapter.name,
      kind: "chapter" as const,
      href: `${subjectRouteMap[subject.name]}#${chapter.id}`,
      path: [subject.name, unit.name, chapter.name]
    }));

  const topicResults = allTopics
    .filter(({ topic }) => topic.name.toLowerCase().includes(value))
    .slice(0, 10)
    .map(({ subject, unit, chapter, topic }) => ({
      id: topic.id,
      label: topic.name,
      kind: "topic" as const,
      href: `${subjectRouteMap[subject.name]}#${chapter.id}`,
      path: [subject.name, unit.name, chapter.name, topic.name]
    }));

  const subtopicResults = allSubtopics
    .filter((subtopic) => subtopic.name.toLowerCase().includes(value))
    .slice(0, 12)
    .map((subtopic) => ({
      id: subtopic.id,
      label: subtopic.name,
      kind: "subtopic" as const,
      href: `${subjectRouteMap[subtopic.subjectName]}#${subtopic.chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      path: subtopic.path
    }));

  return [...subtopicResults, ...topicResults, ...chapterResults].slice(0, 12);
};

export const getImportantChapterTargets = () => [
  "System of Particles and Rigid Body Dynamics",
  "Electrostatics and Capacitance",
  "Current Electricity",
  "Oscillations and Waves",
  "Ray Optics",
  "Wave Optics",
  "Thermal Physics",
  "Chemical Bonding and Molecular Structure",
  "Basic Principles of Organic Chemistry",
  "Coordination Compounds",
  "Differential Calculus",
  "Integral Calculus and Differential Equations",
  "Algebra",
  "Analytical Geometry in Two Dimensions",
  "Probability and Statistics"
];

export const flattenForImport = () => {
  const subjects = normalizedSubjects.map((subject) => ({
    id: subject.id,
    name: subject.name
  }));
  const classes = [
    { id: "11", name: "11" },
    { id: "12", name: "12" }
  ];

  const units = normalizedSubjects.flatMap((subject) =>
    subject.units.flatMap((unit) => {
      const classSet = new Set(
        unit.chapters.flatMap((chapter) => chapter.classTags.length ? chapter.classTags : ["11", "12"])
      );
      return Array.from(classSet).map((classId) => ({
        id: `${unit.id}__${classId}`,
        subject_id: subject.id,
        class_id: classId,
        name: unit.name
      }));
    })
  );

  const chapters = normalizedSubjects.flatMap((subject) =>
    subject.units.flatMap((unit) =>
      unit.chapters.flatMap((chapter) =>
        chapter.classTags.map((classId) => ({
          id: `${chapter.id}__${classId}`,
          unit_id: `${unit.id}__${classId}`,
          class_id: classId,
          chapter_name: chapter.name,
          weightage: getImportantChapterTargets().includes(chapter.name) ? 5 : 3
        }))
      )
    )
  );

  const topics = normalizedSubjects.flatMap((subject) =>
    subject.units.flatMap((unit) =>
      unit.chapters.flatMap((chapter) =>
        chapter.topics.flatMap((topic) =>
          chapter.classTags.map((classId) => ({
            id: `${topic.id}__${classId}`,
            chapter_id: `${chapter.id}__${classId}`,
            topic_name: topic.name
          }))
        )
      )
    )
  );

  const subtopics = normalizedSubjects.flatMap((subject) =>
    subject.units.flatMap((unit) =>
      unit.chapters.flatMap((chapter) =>
        chapter.topics.flatMap((topic) =>
          topic.subtopics.flatMap((subtopic) =>
            chapter.classTags.map((classId) => ({
              id: `${subtopic.id}__${classId}`,
              topic_id: `${topic.id}__${classId}`,
              subtopic_name: subtopic.name
            }))
          )
        )
      )
    )
  );

  return { subjects, classes, units, chapters, topics, subtopics };
};
