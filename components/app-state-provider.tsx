"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "next-themes";
import { getDefaultProgress } from "@/lib/analytics";
import { LearningStatus, ProgressRecord, getAllSubtopics } from "@/lib/syllabus";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

type AppStateContextValue = {
  ready: boolean;
  currentUser: string | null;
  isSupabase: boolean;
  progressMap: Record<string, ProgressRecord>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateLearningStatus: (subtopicId: string, status: LearningStatus) => void;
  toggleFlag: (
    subtopicId: string,
    field: "revision1" | "revision2" | "revision3" | "pyqCompleted" | "advancedQuestionsCompleted"
  ) => void;
  resetProgress: () => void;
  exportProgress: () => string;
};

const USERS_KEY = "jee-tracker-users";
const SESSION_KEY = "jee-tracker-session";
const progressKey = (email: string) => `jee-tracker-progress:${email}`;

const AppStateContext = createContext<AppStateContextValue | null>(null);

const ensureRecord = (subtopicId: string, map: Record<string, ProgressRecord>) =>
  map[subtopicId] ?? getDefaultProgress(subtopicId);

const mapDbToRecord = (row: any): ProgressRecord => ({
  subtopicId: row.subtopic_id,
  learningStatus: row.learning_status,
  revision1: row.revision_1,
  revision2: row.revision_2,
  revision3: row.revision_3,
  pyqCompleted: row.pyq_completed,
  advancedQuestionsCompleted: row.advanced_questions_completed,
  updatedAt: row.updated_at,
  completedAt: row.completed_at || null
});

const supabase = createSupabaseBrowserClient();

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressRecord>>({});

  const isSupabase = hasSupabaseEnv && !!supabase;

  useEffect(() => {
    let active = true;

    async function initSession() {
      if (isSupabase && supabase) {
        // Handle Supabase Auth state updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!active) return;
          if (session) {
            setCurrentUser(session.user.email ?? null);
            setCurrentUserId(session.user.id);
            // Fetch progress from DB
            const { data, error } = await supabase
              .from("progress")
              .select("*")
              .eq("user_id", session.user.id);
            
            if (data && !error && active) {
              const map: Record<string, ProgressRecord> = {};
              data.forEach((row) => {
                map[row.subtopic_id] = mapDbToRecord(row);
              });
              setProgressMap(map);
            }
          } else {
            setCurrentUser(null);
            setCurrentUserId(null);
            setProgressMap({});
          }
          setReady(true);
        });

        // Fetch initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && active) {
          setCurrentUser(session.user.email ?? null);
          setCurrentUserId(session.user.id);
          const { data, error } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", session.user.id);
          
          if (data && !error && active) {
            const map: Record<string, ProgressRecord> = {};
            data.forEach((row) => {
              map[row.subtopic_id] = mapDbToRecord(row);
            });
            setProgressMap(map);
          }
        }
        if (active) {
          setReady(true);
        }

        return () => {
          active = false;
          subscription.unsubscribe();
        };
      } else {
        const session = window.localStorage.getItem(SESSION_KEY);
        setCurrentUser(session);
        if (session && active) {
          const saved = window.localStorage.getItem(progressKey(session));
          setProgressMap(saved ? JSON.parse(saved) : {});
        }
        if (active) {
          setReady(true);
        }
      }
    }

    initSession();

    return () => {
      active = false;
    };
  }, [isSupabase]);

  // Persist LocalStorage for offline fallback
  useEffect(() => {
    if (!ready || isSupabase || !currentUser) return;
    window.localStorage.setItem(progressKey(currentUser), JSON.stringify(progressMap));
  }, [currentUser, progressMap, ready, isSupabase]);

  const persistLocalSession = (email: string) => {
    window.localStorage.setItem(SESSION_KEY, email);
    setCurrentUser(email);
    const saved = window.localStorage.getItem(progressKey(email));
    setProgressMap(saved ? JSON.parse(saved) : {});
  };

  const login = async (email: string, password: string) => {
    if (isSupabase && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } else {
      const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, { password: string }>;
      if (!users[email] || users[email].password !== password) {
        return { ok: false, error: "Invalid email or password." };
      }
      persistLocalSession(email);
      return { ok: true };
    }
  };

  const signup = async (email: string, password: string) => {
    if (isSupabase && supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } else {
      const users = JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, { password: string }>;
      if (users[email]) {
        return { ok: false, error: "Account already exists." };
      }
      users[email] = { password };
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
      persistLocalSession(email);
      return { ok: true };
    }
  };

  const logout = async () => {
    if (isSupabase && supabase) {
      await supabase.auth.signOut();
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
    setCurrentUser(null);
    setCurrentUserId(null);
    setProgressMap({});
  };

  const syncRecordToDb = async (record: ProgressRecord) => {
    if (!isSupabase || !supabase || !currentUserId) return;
    await supabase.from("progress").upsert({
      user_id: currentUserId,
      subtopic_id: record.subtopicId,
      learning_status: record.learningStatus,
      revision_1: record.revision1,
      revision_2: record.revision2,
      revision_3: record.revision3,
      pyq_completed: record.pyqCompleted,
      advanced_questions_completed: record.advancedQuestionsCompleted,
      updated_at: record.updatedAt,
      completed_at: record.completedAt
    }, {
      onConflict: "user_id,subtopic_id"
    });
  };

  const updateLearningStatus = (subtopicId: string, status: LearningStatus) => {
    setProgressMap((current) => {
      const record = ensureRecord(subtopicId, current);
      const nextRecord = {
        ...record,
        learningStatus: status,
        updatedAt: new Date().toISOString(),
        completedAt: status === "completed" ? record.completedAt ?? new Date().toISOString() : null
      };

      syncRecordToDb(nextRecord);

      return { ...current, [subtopicId]: nextRecord };
    });
  };

  const toggleFlag = (
    subtopicId: string,
    field: "revision1" | "revision2" | "revision3" | "pyqCompleted" | "advancedQuestionsCompleted"
  ) => {
    setProgressMap((current) => {
      const record = ensureRecord(subtopicId, current);
      const nextRecord = {
        ...record,
        [field]: !record[field],
        updatedAt: new Date().toISOString()
      };

      syncRecordToDb(nextRecord);

      return { ...current, [subtopicId]: nextRecord };
    });
  };

  const resetProgress = async () => {
    if (isSupabase && supabase) {
      if (!currentUserId) return;
      await supabase.from("progress").delete().eq("user_id", currentUserId);
      setProgressMap({});
    } else {
      if (!currentUser) return;
      setProgressMap({});
      window.localStorage.removeItem(progressKey(currentUser));
    }
  };

  const exportProgress = () => {
    return JSON.stringify(
      {
        user: currentUser,
        mode: isSupabase ? "supabase" : "local",
        exportedAt: new Date().toISOString(),
        syllabusSubtopics: getAllSubtopics().length,
        progress: progressMap
      },
      null,
      2
    );
  };

  const value = useMemo(
    () => ({
      ready,
      currentUser,
      isSupabase,
      progressMap,
      login,
      signup,
      logout,
      updateLearningStatus,
      toggleFlag,
      resetProgress,
      exportProgress
    }),
    [ready, currentUser, isSupabase, progressMap]
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
    </ThemeProvider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
};
