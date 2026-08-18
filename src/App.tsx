import { useEffect, useState } from "react";
import { useApp, type View } from "./store";
import { Onboarding } from "./onboarding/Onboarding";
import { WeekView } from "./week/WeekView";
import { TimerView } from "./views/TimerView";
import { ProjectsView } from "./views/ProjectsView";
import { TasksView } from "./views/TasksView";
import { TimelineView } from "./views/TimelineView";
import { PROJECT } from "./week/data";

/**
 * Toggl 2.0 (Focus) — a solo user's first week, end to end.
 *
 * THESIS: Toggl's value is accumulated intelligence, but W0 is decided before
 * accumulation exists. Onboarding asks for a project and never asks how long
 * the user thinks it will take — so week one has no denominator and nothing to
 * say. One field at project creation gives the whole week a scale, and Reports
 * refuses the dashboard-of-tiles to show that week as a single object: how much
 * of it is known, and how much is guessed.
 * OWN-WORLD: Toggl's own production system — 329 extracted tokens, GT Haptik
 * display over Inter UI, 14px body, 4/8/20/32 radii, 1px border-primary
 * separation over shadow, the project's --*-data-* colour ramp for all time.
 * STORY: Sign up, pick an intent, connect a calendar, name a project — and say
 * how long you think it takes. Then track. The week fills, the holes show, the
 * calendar settles them, and by Sunday it hands back a calibrated estimate
 * from zero history.
 * FIRST VIEWPORT: Onboarding, then Reports mid-week — one sentence that changes
 * daily, the estimate as a single horizontal length, the week as seven ribbons.
 * FORM: One continuous time ribbon — candidate 7 of 7, seed key 25fc8c09.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, and DESIGN.md
 */
export default function App() {
  const app = useApp();

  if (!app.s.onboarded) return <Onboarding onDone={app.finishOnboarding} />;

  return (
    <div className="flex h-screen overflow-hidden" style={PROJECT.colour as React.CSSProperties}>
      <IconRail />
      <Sidebar app={app} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-primary">
        <TimerBar app={app} />
        <Header app={app} />
        {app.view === "reports" ? (
          <WeekView app={app} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {app.view === "timer" && <TimerView app={app} />}
            {app.view === "projects" && <ProjectsView app={app} />}
            {app.view === "tasks" && <TasksView app={app} />}
            {app.view === "timeline" && <TimelineView app={app} />}
          </div>
        )}
      </main>
    </div>
  );
}

function IconRail() {
  return (
    <div className="relative z-20 hidden w-12 shrink-0 flex-col items-center justify-between bg-tertiary py-4 md:flex">
      <span className="flex size-6 flex-center rounded-full bg-brand-focus text-brand-toggl" aria-label="Toggl 2.0">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M8 2.5v5" />
          <path d="M12.2 4.2a6 6 0 1 1-8.4 0" />
        </svg>
      </span>
      <span className="flex size-7 flex-center rounded-full bg-secondary-active text-h6 font-semibold text-secondary">
        MZ
      </span>
    </div>
  );
}

const NAV: { section: string; items: { label: string; view: View }[] }[] = [
  { section: "TRACK", items: [{ label: "Timer", view: "timer" }] },
  { section: "ANALYZE", items: [{ label: "Reports", view: "reports" }] },
  {
    section: "PLAN",
    items: [
      { label: "Projects", view: "projects" },
      { label: "Tasks", view: "tasks" },
      { label: "Timeline", view: "timeline" },
    ],
  },
];

function Sidebar({ app }: { app: ReturnType<typeof useApp> }) {
  return (
    <aside className="hidden w-50 shrink-0 flex-col border-r border-primary bg-primary md:flex" aria-label="Main">
      <div className="flex h-16 items-center px-4">
        <span className="truncate text-p1 font-medium text-primary">Martín's workspace</span>
      </div>
      <nav className="flex flex-col gap-4 px-3 pb-4">
        {NAV.map(({ section, items }) => (
          <div key={section} className="flex flex-col gap-0.5">
            <span className="px-2 pb-1 text-h6 font-semibold tracking-wide text-secondary">{section}</span>
            {items.map((item) => {
              const active = app.view === item.view;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => app.setView(item.view)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded px-2 py-1.5 text-left text-p1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                    active
                      ? "bg-muted font-medium text-accent"
                      : "text-secondary hover:bg-primary-hover hover:text-primary"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-primary px-4 py-3">
        <p className="text-p2 text-secondary">Premium trial — 31 days left</p>
      </div>
    </aside>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function TimerBar({ app }: { app: ReturnType<typeof useApp> }) {
  const { s } = app;
  const [label, setLabel] = useState("");
  const [, tick] = useState(0);

  useEffect(() => {
    if (!s.runningSince) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [s.runningSince]);

  const elapsed = s.runningSince ? Math.floor((Date.now() - s.runningSince) / 1000) : 0;
  const clock = `${Math.floor(elapsed / 3600)}:${pad(Math.floor((elapsed % 3600) / 60))}:${pad(elapsed % 60)}`;
  const running = Boolean(s.runningSince);

  const toggle = () => {
    if (running) {
      app.stopTimer();
      app.setView("reports");
    } else {
      app.startTimer(label.trim() || "Untitled");
      setLabel("");
      app.setView("timer");
    }
  };

  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-primary px-4 sm:px-8">
      <input
        value={running ? s.runningLabel : label}
        onChange={(e) => setLabel(e.target.value)}
        readOnly={running}
        placeholder="What are you working on?"
        aria-label="What are you working on?"
        className="min-w-0 flex-1 bg-transparent text-h3 text-primary outline-none placeholder:text-secondary"
      />
      <span className="hidden items-center gap-2 sm:flex">
        <span className="rounded border border-primary px-2.5 py-1 text-p2 text-secondary">{s.projectName}</span>
      </span>
      <span className="text-p1 font-medium text-primary tabular-nums">{clock}</span>
      <button
        type="button"
        onClick={toggle}
        aria-label={running ? "Stop timer" : "Start timer"}
        className={`flex size-9 shrink-0 flex-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
          running ? "bg-accent text-inverted" : "border border-primary text-secondary hover:bg-primary-hover"
        }`}
      >
        {running ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <rect x="3" y="3" width="10" height="10" rx="1.5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M5 3.5l8 4.5-8 4.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

const TITLES: Record<View, string> = {
  timer: "Timer",
  reports: "Reports",
  projects: "Projects",
  tasks: "Tasks",
  timeline: "Timeline",
};

function Header({ app }: { app: ReturnType<typeof useApp> }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-primary bg-secondary px-4 sm:px-8">
      <h2 className="text-h5 font-semibold text-primary">{TITLES[app.view]}</h2>
      {app.view === "reports" && (
        <span className="whitespace-nowrap rounded-sm border border-primary bg-primary px-1.5 py-0.5 text-h6 font-semibold tracking-wide text-secondary">
          THIS WEEK
        </span>
      )}
      <nav className="ml-auto flex gap-1 md:hidden" aria-label="Sections">
        {(Object.keys(TITLES) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => app.setView(v)}
            aria-current={app.view === v ? "page" : undefined}
            className={`rounded px-2 py-1 text-h6 font-semibold tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
              app.view === v ? "bg-accent text-inverted" : "text-secondary"
            }`}
          >
            {TITLES[v].slice(0, 4).toUpperCase()}
          </button>
        ))}
      </nav>
    </header>
  );
}
