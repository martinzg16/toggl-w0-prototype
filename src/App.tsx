import { WeekView } from "./week/WeekView";

/**
 * Toggl 2.0 (Focus) — Reports, in a solo user's first week.
 *
 * THESIS: Toggl's value is accumulated intelligence, but W0 is decided before
 * accumulation exists. This surface refuses the dashboard-of-tiles that every
 * analytics page ships and instead shows one week as a single object: how much
 * of it is known, and how much is guessed.
 * OWN-WORLD: Toggl's own production system — 329 extracted tokens, GT Haptik
 * display over Inter UI, 14px body, 4/8/20/32 radii, 1px border-primary
 * separation over shadow, the project's --*-data-* colour ramp for all time.
 * STORY: A freelancer sees their estimate as a length, their tracked time
 * filling it, and the hours their calendar knows about but Toggl never got.
 * One tap settles each one. By Sunday the week has taught them their next
 * estimate — from zero history.
 * FIRST VIEWPORT: One sentence that changes daily, the estimate as a single
 * horizontal length, then the week as seven ribbons at hour resolution.
 * Repair sits directly under the hole it fixes. Day scrubber pinned bottom.
 * FORM: One continuous time ribbon — candidate 7 of 7, seed key 25fc8c09.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, and DESIGN.md
 */
export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <IconRail />
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-primary">
        <TimerBar />
        <Header />
        <WeekView />
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

const NAV: { section: string; items: { label: string; active?: boolean }[] }[] = [
  { section: "TRACK", items: [{ label: "Timer" }] },
  { section: "ANALYZE", items: [{ label: "Reports", active: true }] },
  { section: "PLAN", items: [{ label: "Projects" }, { label: "Tasks" }, { label: "Timeline" }] },
];

function Sidebar() {
  return (
    <aside className="hidden w-50 shrink-0 flex-col border-r border-primary bg-primary md:flex" aria-label="Main">
      <div className="flex h-16 items-center px-4">
        <span className="truncate text-p1 font-medium text-primary">Martín's workspace</span>
      </div>
      <nav className="flex flex-col gap-4 px-3 pb-4">
        {NAV.map(({ section, items }) => (
          <div key={section} className="flex flex-col gap-0.5">
            <span className="px-2 pb-1 text-h6 font-semibold tracking-wide text-tertiary">{section}</span>
            {items.map((item) => (
              <a
                key={item.label}
                href={item.active ? undefined : "#"}
                aria-current={item.active ? "page" : undefined}
                aria-disabled={!item.active}
                className={`rounded px-2 py-1.5 text-p1 transition-colors ${
                  item.active
                    ? "bg-muted font-medium text-accent"
                    : "cursor-default text-tertiary"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-primary px-4 py-3">
        <p className="text-p2 text-tertiary">Premium trial — 31 days left</p>
      </div>
    </aside>
  );
}

/** Toggl's most recognizable element. Stopped, non-interactive: this
 *  prototype is about the week, not the timer, but the week lives under it. */
function TimerBar() {
  return (
    <div className="hidden h-16 shrink-0 items-center gap-3 border-b border-primary px-4 sm:flex sm:px-8">
      <span className="min-w-0 flex-1 truncate text-h3 text-secondary">What are you working on?</span>
      <span className="hidden items-center gap-2 sm:flex">
        {["Task", "Project", "Tags"].map((chip) => (
          <span
            key={chip}
            className="rounded border border-primary px-2.5 py-1 text-p2 text-secondary"
          >
            {chip}
          </span>
        ))}
      </span>
      <span className="text-p1 font-medium text-primary tabular-nums">0:00:00</span>
      <span
        className="flex size-9 shrink-0 flex-center rounded-full border border-primary text-secondary"
        aria-hidden
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 3.5l8 4.5-8 4.5z" />
        </svg>
      </span>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-primary bg-secondary px-4 sm:px-8">
      <h2 className="text-h5 font-semibold text-primary">Reports</h2>
      <span className="whitespace-nowrap rounded-sm border border-primary bg-primary px-1.5 py-0.5 text-h6 font-semibold tracking-wide text-secondary">
        THIS WEEK
      </span>
    </header>
  );
}
