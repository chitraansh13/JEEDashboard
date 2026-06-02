"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "A calm command center for readiness, syllabus completion, streaks, weekly activity, and important chapter focus."
  },
  "/physics": {
    title: "Physics",
    description: "Work through every chapter, topic, and micro-topic with instant progress tracking and revision control."
  },
  "/chemistry": {
    title: "Chemistry",
    description: "Split into Physical, Organic, and Inorganic sections while preserving the full JEE Advanced syllabus tree."
  },
  "/mathematics": {
    title: "Mathematics",
    description: "Track algebra, trigonometry, coordinate geometry, calculus, vectors, and 3D without flattening the syllabus."
  },
  "/revision": {
    title: "Revision",
    description: "See what needs a first revision, deeper revision, PYQ practice, or advanced problem work."
  },
  "/important": {
    title: "Important Chapters",
    description: "Keep high-weightage chapters visible so effort stays aligned with what matters most."
  },
  "/settings": {
    title: "Settings",
    description: "Theme, export, and reset controls for this device-first tracker."
  }
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = useMemo(() => pageMeta[pathname] ?? pageMeta["/dashboard"], [pathname]);

  return (
    <AuthGate>
      <AppShell title={meta.title} description={meta.description}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
