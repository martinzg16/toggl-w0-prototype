import { useCallback, useMemo, useState } from "react";
import { BAND_END, BAND_START, WEEK as SEED, type Day, type Segment } from "./week/data";

export type View = "timer" | "reports" | "projects" | "tasks" | "timeline";
export type Intent = "track" | "plan" | "projects";
/** How the user arrived: with a Toggl Track history, or with nothing at all. */
export type Origin = "imported" | "cold";

export interface Task {
  id: string;
  name: string;
  done: boolean;
  /** minutes the user expects this to take */
  estimate: number | null;
  plannedDay: number | null;
}

export interface AppState {
  onboarded: boolean;
  origin: Origin;
  intent: Intent | null;
  calendarConnected: boolean;
  projectName: string;
  /** THE intervention: captured at project creation, in minutes */
  projectEstimate: number;
  week: Day[];
  today: number;
  claimed: Set<string>;
  tasks: Task[];
  /** epoch ms when the running timer started, null when stopped */
  runningSince: number | null;
  runningLabel: string;
}

/** Nothing is seeded. A cold-start user types their own. */
const SEED_TASKS: Task[] = [];

/**
 * What comes across from Toggl Track. A returning user already has projects,
 * so the first step is picking one — and each carries the thing a cold start
 * cannot have: how long this exact work actually took last time.
 */
export interface ImportedProject {
  id: string;
  name: string;
  client: string;
  /** average minutes per week, measured over `weeks` */
  avgMinutes: number;
  weeks: number;
}

export const IMPORTED_PROJECTS: ImportedProject[] = [
  { id: "p1", name: "Acme rebrand", client: "Acme Corp", avgMinutes: 14 * 60, weeks: 8 },
  { id: "p2", name: "Northwind identity", client: "Northwind", avgMinutes: 9 * 60 + 30, weeks: 5 },
  { id: "p3", name: "Contra newsletter", client: "Contra", avgMinutes: 3 * 60, weeks: 12 },
];

export function useApp() {
  const [s, setS] = useState<AppState>({
    onboarded: false,
    origin: "cold",
    intent: null,
    calendarConnected: false,
    projectName: "",
    projectEstimate: 0,
    week: SEED,
    today: 2,
    claimed: new Set(),
    tasks: SEED_TASKS,
    runningSince: null,
    runningLabel: "",
  });
  const [view, setView] = useState<View>("reports");

  const finishOnboarding = useCallback(
    (o: {
      origin: Origin;
      intent: Intent;
      calendarConnected: boolean;
      projectName: string;
      projectEstimate: number;
    }) => {
      setS((p) => ({ ...p, ...o, onboarded: true }));
      setView(o.intent === "track" ? "reports" : o.intent === "plan" ? "tasks" : "projects");
    },
    [],
  );

  const startTimer = useCallback((label: string) => {
    setS((p) => (p.runningSince ? p : { ...p, runningSince: Date.now(), runningLabel: label }));
  }, []);

  /** Stops the timer and writes a real block onto today's ribbon. */
  const stopTimer = useCallback(() => {
    setS((p) => {
      if (!p.runningSince) return p;
      const elapsedMin = Math.max(1, Math.round((Date.now() - p.runningSince) / 60000));
      const day = p.week[p.today];
      const lastEnd = day.segments.reduce((m, sg) => Math.max(m, sg.end), day.workStart);
      const start = Math.min(Math.max(lastEnd + 15, BAND_START), BAND_END - elapsedMin);
      const seg: Segment = {
        id: `live-${Date.now()}`,
        start,
        end: Math.min(start + elapsedMin, BAND_END),
        label: p.runningLabel || "Untitled",
        kind: "tracked",
      };
      const week = p.week.map((d, i) => (i === p.today ? { ...d, segments: [...d.segments, seg] } : d));
      return { ...p, week, runningSince: null, runningLabel: "" };
    });
  }, []);

  /** Drop a block straight onto the calendar — the plan-and-track gesture. */
  const addEntry = useCallback((dayIndex: number, start: number, end: number, label: string) => {
    setS((p) => {
      const seg: Segment = { id: `cal-${Date.now()}`, start, end, label: label || "Untitled", kind: "tracked" };
      return {
        ...p,
        week: p.week.map((d, i) => (i === dayIndex ? { ...d, segments: [...d.segments, seg] } : d)),
      };
    });
  }, []);

  const claim = useCallback((id: string) => {
    setS((p) => ({ ...p, claimed: new Set(p.claimed).add(id) }));
  }, []);

  const claimMany = useCallback((ids: string[]) => {
    setS((p) => {
      const next = new Set(p.claimed);
      ids.forEach((i) => next.add(i));
      return { ...p, claimed: next };
    });
  }, []);

  const setToday = useCallback((today: number) => setS((p) => ({ ...p, today })), []);
  const setEstimate = useCallback((m: number) => setS((p) => ({ ...p, projectEstimate: m })), []);
  const toggleTask = useCallback((id: string) => {
    setS((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }, []);
  const addTask = useCallback((name: string) => {
    setS((p) => ({
      ...p,
      tasks: [...p.tasks, { id: `t${Date.now()}`, name, done: false, estimate: null, plannedDay: null }],
    }));
  }, []);

  return useMemo(
    () => ({
      s, view, setView, finishOnboarding, startTimer, stopTimer, addEntry,
      claim, claimMany, setToday, setEstimate, toggleTask, addTask,
    }),
    [s, view, finishOnboarding, startTimer, stopTimer, addEntry, claim, claimMany, setToday, setEstimate, toggleTask, addTask],
  );
}

export type App = ReturnType<typeof useApp>;
