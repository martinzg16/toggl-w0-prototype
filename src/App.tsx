import { useEffect, useState } from "react";
import { useApp, type View } from "./store";
import { Onboarding } from "./onboarding/Onboarding";
import { WeekView } from "./week/WeekView";
import { TimerView } from "./views/TimerView";
import { ProjectsView } from "./views/ProjectsView";
import { TasksView } from "./views/TasksView";
import { TimelineView } from "./views/TimelineView";
import { WeekVerdict } from "./views/WeekVerdict";
import { PROJECT, fmt } from "./week/data";
import {
  ApprovalIcon, AtIcon, BellIcon, BoardIcon, CalendarIcon, ChevronDown, ChevronLeft,
  ChevronRight, ClockIcon, CollapseIcon, DollarIcon, GridIcon, ListIcon as ListViewIcon,
  DownloadIcon, FolderIcon, GearIcon, HashIcon, HelpIcon, ListIcon, PalmIcon,
  PersonIcon, PlusIcon, ReportIcon, SendIcon, StarIcon, TimelineIcon, UpgradeIcon, WeekIcon,
} from "./week/Icons";

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
            {app.view === "week" && <WeekVerdict app={app} />}
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
      <span className="relative flex size-7 flex-center rounded-full bg-brand-focus text-brand-toggl" aria-label="Toggl 2.0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M8 2.5v5" />
          <path d="M12.2 4.2a6 6 0 1 1-8.4 0" />
        </svg>
        <span className="absolute -bottom-2 text-[0.5rem] font-bold text-accent">2.0</span>
      </span>

      <span className="text-secondary" aria-hidden><CollapseIcon /></span>

      <span className="flex flex-col items-center gap-4">
        <span className="flex size-7 flex-center rounded-full bg-secondary-active text-h6 font-semibold text-secondary">MZ</span>
        <span className="text-secondary" aria-hidden><BellIcon /></span>
        <span className="text-secondary" aria-hidden><SendIcon /></span>
        <span className="text-secondary" aria-hidden><HelpIcon /></span>
      </span>
    </div>
  );
}

type NavItem = { label: string; view?: View; icon: React.ReactNode; starred?: boolean };
const NAV: { section: string; items: NavItem[] }[] = [
  { section: "TRACK", items: [{ label: "Timer", view: "timer", icon: <ClockIcon /> }] },
  {
    section: "ANALYZE",
    items: [
      { label: "This week", view: "week", icon: <WeekIcon /> },
      { label: "Reports", view: "reports", icon: <ReportIcon /> },
    ],
  },
  {
    section: "PLAN",
    items: [
      { label: "Projects", view: "projects", icon: <FolderIcon /> },
      { label: "Tasks", view: "tasks", icon: <ListIcon /> },
      { label: "Timeline", view: "timeline", icon: <TimelineIcon />, starred: true },
    ],
  },
  {
    section: "MANAGE",
    items: [
      { label: "Members", icon: <PersonIcon /> },
      { label: "Approvals", icon: <ApprovalIcon />, starred: true },
      { label: "Time off", icon: <PalmIcon />, starred: true },
    ],
  },
];

function Sidebar({ app }: { app: ReturnType<typeof useApp> }) {
  return (
    <aside className="hidden w-50 shrink-0 flex-col border-r border-primary bg-primary md:flex" aria-label="Main">
      <button
        type="button"
        className="flex h-16 items-center gap-1.5 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-bg-accent"
      >
        <span className="truncate text-p1 font-semibold text-primary">Martinzg16's organi…</span>
        <ChevronDown className="shrink-0 text-secondary" />
      </button>

      <nav className="flex flex-col gap-4 overflow-y-auto px-3 pb-4">
        {NAV.map(({ section, items }) => (
          <div key={section} className="flex flex-col gap-0.5">
            <span className="px-2 pb-1 text-h6 font-semibold tracking-wide text-secondary">{section}</span>
            {items.map((item) => {
              const active = item.view && app.view === item.view;
              const reachable = Boolean(item.view);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.view && app.setView(item.view)}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={!reachable}
                  className={`group flex items-center gap-2.5 rounded px-2 py-1.5 text-left text-p1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                    active
                      ? "bg-muted font-medium text-accent"
                      : reachable
                        ? "text-secondary hover:bg-primary-hover hover:text-primary"
                        : "cursor-default text-tertiary"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.starred && <StarIcon className="shrink-0 text-tertiary" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 px-3 pb-3">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded px-2 py-1.5 text-left text-p1 font-medium text-accent outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          <UpgradeIcon className="shrink-0" />
          <span className="flex-1">Upgrade</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-h6 font-semibold tracking-wide text-accent">
            31 DAYS
          </span>
        </button>
        <span className="flex items-center gap-2.5 px-2 py-1.5 text-p1 text-tertiary">
          <DownloadIcon className="shrink-0" /> Download apps
        </span>
        <span className="flex items-center gap-2.5 px-2 py-1.5 text-p1 text-tertiary">
          <GearIcon className="shrink-0" /> Admin settings
        </span>
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
    <div className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-8">
      <input
        value={running ? s.runningLabel : label}
        onChange={(e) => setLabel(e.target.value)}
        readOnly={running}
        placeholder="What are you working on?"
        aria-label="What are you working on?"
        className="min-w-0 flex-1 bg-transparent text-h3 text-primary outline-none placeholder:text-secondary"
      />
      <span className="hidden items-center gap-2 lg:flex">
        <Chip icon={<AtIcon />} label="Task" />
        <Chip icon={<PlusIcon />} label={s.projectName || "Project"} filled={Boolean(s.projectName)} />
        <Chip icon={<HashIcon />} label="Tags" />
        <span className="px-1 text-secondary" aria-hidden><DollarIcon /></span>
      </span>
      <span className="text-h3 text-primary tabular-nums">{clock}</span>
      <button
        type="button"
        onClick={toggle}
        aria-label={running ? "Stop timer" : "Start timer"}
        className="flex size-9 shrink-0 flex-center rounded-full bg-accent text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
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

/** Toggl's dashed entry chips: an affordance to attach, not a filled control. */
function Chip({ icon, label, filled }: { icon: React.ReactNode; label: string; filled?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-p1 ${
        filled
          ? "border border-primary bg-secondary text-primary"
          : "border border-dashed border-primary text-secondary"
      }`}
    >
      <span className="shrink-0 opacity-70">{icon}</span>
      {label}
    </span>
  );
}

function Header({ app }: { app: ReturnType<typeof useApp> }) {
  const { s } = app;
  const logged = s.week
    .slice(0, s.today + 1)
    .flatMap((d) => d.segments)
    .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
    .reduce((t, sg) => t + (sg.end - sg.start), 0);
  const planned = s.week.flatMap((d) => d.segments).reduce((t, sg) => t + (sg.end - sg.start), 0);

  return (
    <div className="shrink-0 border-b border-primary">
      {/* week navigation — Toggl's own period control */}
      <div className="flex items-center gap-2 px-4 py-2 sm:px-8">
        <span className="flex items-center gap-1 rounded border border-primary px-1 py-0.5">
          <span className="flex size-6 flex-center text-secondary" aria-hidden><ChevronLeft /></span>
          <span className="flex items-center gap-1.5 px-2 text-p1 text-primary">
            <CalendarIcon className="text-secondary" />
            This week <span className="text-secondary">• W34</span>
          </span>
          <span className="flex size-6 flex-center text-secondary" aria-hidden><ChevronRight /></span>
        </span>

        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="flex items-center gap-1 rounded border border-primary px-2 py-1 text-p2 text-secondary">
            5 Days <ChevronDown />
          </span>
          <span className="flex items-center gap-0.5 rounded border border-primary p-0.5">
            {[
              { id: "cal", icon: <CalendarIcon />, view: "timer" as View },
              { id: "board", icon: <BoardIcon />, view: "timeline" as View },
              { id: "list", icon: <ListViewIcon />, view: "tasks" as View },
              { id: "grid", icon: <GridIcon />, view: "reports" as View },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => app.setView(v.view)}
                aria-label={v.view}
                aria-current={app.view === v.view ? "true" : undefined}
                className={`flex size-7 flex-center rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                  app.view === v.view ? "bg-muted text-accent" : "text-secondary hover:bg-primary-hover"
                }`}
              >
                {v.icon}
              </button>
            ))}
          </span>
        </span>
      </div>

      {/* logged vs planned — the bar Toggl puts above every week */}
      <div className="flex items-center gap-3 border-t border-primary bg-secondary px-4 py-2 text-p2 sm:px-8">
        <span className="whitespace-nowrap text-secondary">
          Logged <span className="font-medium text-primary tabular-nums">{fmt(logged)}</span>
        </span>
        <span className="hidden whitespace-nowrap text-secondary sm:inline">Planned</span>
        <span className="hidden h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary-active sm:block">
          <span
            className="block h-full rounded-full bg-inverted-secondary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (logged / Math.max(planned, 1)) * 100)}%` }}
          />
        </span>
        <span className="whitespace-nowrap text-secondary tabular-nums">{fmt(planned)}</span>
        <button
          type="button"
          onClick={() => app.setView("reports")}
          className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 py-1 font-medium text-accent outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          View reports <ChevronRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
