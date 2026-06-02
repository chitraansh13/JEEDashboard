"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { motion } from "framer-motion";
import { Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { buildAnalytics } from "@/lib/analytics";

function Card({ title, value, hint, icon: Icon }: { title: string; value: string; hint: string; icon: React.ElementType }) {
  return (
    <motion.div layout className="glass-card rounded-[28px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--muted))]">{title}</p>
          <h3 className="mt-3 text-4xl font-semibold tracking-tight">{value}</h3>
          <p className="mt-2 text-sm text-[hsl(var(--muted))]">{hint}</p>
        </div>
        <span className="rounded-2xl bg-white/70 p-3 dark:bg-white/10">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { progressMap } = useAppState();
  const analytics = buildAnalytics(progressMap);
  const subjectData = Object.entries(analytics.subjectBreakdown).map(([subject, value]) => ({
    subject,
    progress: Math.round((value.completed / value.total) * 100)
  }));

  const classData = Object.entries(analytics.classBreakdown).map(([name, value]) => ({
    name: `Class ${name}`,
    progress: Math.round((value.completed / value.total) * 100)
  }));

  const topUnits = Object.entries(analytics.unitBreakdown)
    .map(([unit, value]) => ({
      unit,
      progress: Math.round((value.completed / value.total) * 100),
      subject: value.subject
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 8);

  const completionPie = [
    { name: "Done", value: analytics.completedCount, fill: "#0ea5e9" },
    { name: "Remaining", value: analytics.remainingCount, fill: "rgba(148,163,184,0.22)" }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Overall JEE Readiness" value={`${analytics.overallReadiness}%`} hint="Learning + revisions + PYQ + advanced practice" icon={Sparkles} />
        <Card title="Syllabus Completion" value={`${analytics.syllabusCompletion}%`} hint={`${analytics.completedCount} finished, ${analytics.remainingCount} remaining`} icon={Target} />
        <Card title="Study Streak" value={`${analytics.streak} days`} hint={`Longest streak ${analytics.longestStreak} days`} icon={Flame} />
        <Card title="Today’s Push" value="Finish 5" hint="Small daily wins compound over two years." icon={TrendingUp} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[30px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted))]">Weekly Activity</p>
              <h3 className="text-xl font-semibold">Topics completed this week</h3>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklyActivity}>
                <defs>
                  <linearGradient id="weekly" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(100,116,139,0.8)" />
                <YAxis stroke="rgba(100,116,139,0.8)" allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fill="url(#weekly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="glass-card rounded-[30px] p-5">
            <p className="text-sm text-[hsl(var(--muted))]">Subject Comparison</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <XAxis dataKey="subject" stroke="rgba(100,116,139,0.8)" />
                  <YAxis stroke="rgba(100,116,139,0.8)" />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-[30px] p-5">
            <p className="text-sm text-[hsl(var(--muted))]">Class Progress</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {classData.map((item) => (
                <div key={item.name} className="rounded-[24px] border border-white/15 bg-white/45 p-4 text-center dark:border-white/10 dark:bg-white/5">
                  <div className="mx-auto h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="65%"
                        outerRadius="100%"
                        data={[{ value: item.progress, fill: item.name.includes("11") ? "#10b981" : "#f59e0b" }]}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={12} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="-mt-8 text-2xl font-semibold">{item.progress}%</p>
                  <p className="text-sm text-[hsl(var(--muted))]">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[30px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted))]">Completion Split</p>
              <h3 className="text-xl font-semibold">Overall syllabus</h3>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionPie} innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={4} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {completionPie.map((item) => (
              <div key={item.name} className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs dark:bg-white/5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5">
          <p className="text-sm text-[hsl(var(--muted))]">Unit Breakdown</p>
          <h3 className="text-xl font-semibold">High-level progress bars</h3>
          <div className="mt-5 space-y-4">
            {topUnits.map((unit) => (
              <div key={unit.unit}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{unit.unit}</span>
                  <span className="text-[hsl(var(--muted))]">{unit.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/40 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-slate-950 dark:bg-white" style={{ width: `${unit.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[30px] p-5">
          <p className="text-sm text-[hsl(var(--muted))]">Daily Heatmap</p>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {analytics.heatmap.map((day) => (
              <div key={day.date} className="text-center">
                <div
                  className="h-10 rounded-2xl"
                  style={{
                    background:
                      day.count === 0
                        ? "rgba(148,163,184,0.18)"
                        : `rgba(14,165,233,${Math.min(0.2 + day.count * 0.12, 0.95)})`
                  }}
                />
                <p className="mt-1 text-[10px] text-[hsl(var(--muted))]">{day.date.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[30px] p-5">
          <p className="text-sm text-[hsl(var(--muted))]">Recently Completed</p>
          <div className="mt-4 space-y-3">
            {analytics.recentCompleted.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted))]">Nothing completed yet. Start with 5 subtopics today.</p>
            ) : (
              analytics.recentCompleted.map((entry) => (
                <div key={entry.id} className="rounded-[22px] border border-white/15 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="font-medium">{entry.name}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted))]">{entry.path.join(" > ")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
