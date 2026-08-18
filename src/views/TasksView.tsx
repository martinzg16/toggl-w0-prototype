import { useState } from "react";
import { fmt } from "../week/data";
import type { App } from "../store";
import {
  BarsIcon, BoardIcon, ChevronDown, FilterIcon, FlagIcon, GearIcon, GroupIcon,
  ListIcon, PersonIcon, PlusIcon, SearchIcon, SortIcon, SparkleIcon,
} from "../week/Icons";

/** Toggl's task list: the filter bar, the column table, the grouped rows. */
export function TasksView({ app }: { app: App }) {
  const { s } = app;
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    app.addTask(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col px-4 py-5 sm:px-8 sm:py-6">
      <div className="flex items-center gap-3 pb-4">
        <h1 className="font-display text-h2 text-primary">
          Tasks <span className="text-tertiary">· List</span>
        </h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-p1 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          <PlusIcon className="size-3.5" /> Add task
        </button>
      </div>

      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <Pill icon={<PersonIcon />} label="My tasks" caret />
        <Pill icon={<FilterIcon />} label="Filters" badge="1" />
        <Pill icon={<GroupIcon />} label="Group by:" value="Date" />
        <Pill icon={<PlusIcon />} />
        <Pill icon={<SortIcon />} label="Sort by:" value="Priority" />
        <span className="ml-auto flex items-center gap-1">
          <span className="flex items-center gap-0.5 rounded border border-primary p-0.5">
            <span className="flex size-7 flex-center rounded-sm bg-muted text-accent" aria-hidden><ListIcon /></span>
            <span className="flex size-7 flex-center rounded-sm text-secondary" aria-hidden><BoardIcon /></span>
          </span>
          <span className="flex size-8 flex-center text-secondary" aria-hidden><SearchIcon /></span>
          <span className="flex size-8 flex-center text-accent" aria-hidden><SparkleIcon /></span>
          <span className="flex size-8 flex-center text-secondary" aria-hidden><GearIcon /></span>
        </span>
      </div>

      {/* column header */}
      <div className="flex items-center gap-3 border-y border-primary py-2 text-h6 font-semibold tracking-wide text-secondary">
        <span className="w-5 shrink-0" />
        <span className="flex min-w-0 flex-1 items-center gap-1">TASKS <ChevronDown className="size-3" /></span>
        <span className="hidden w-24 shrink-0 items-center gap-1 lg:flex">DATES <ChevronDown className="size-3" /></span>
        <span className="hidden w-28 shrink-0 items-center gap-1 xl:flex">PROJECT <ChevronDown className="size-3" /></span>
        <span className="hidden w-20 shrink-0 items-center gap-1 text-accent md:flex">PRIORITY</span>
        <span className="hidden w-24 shrink-0 items-center gap-1 sm:flex">STATUS</span>
        <span className="w-16 shrink-0 text-right">ESTIMATE</span>
      </div>

      {s.tasks.length > 0 && (
        <div className="flex items-center gap-1.5 py-2 text-p2 text-secondary">
          <ChevronDown className="size-3" />
          No date <span className="text-tertiary">• {s.tasks.length}</span>
        </div>
      )}

      <ul className="flex flex-col">
        {s.tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 border-b border-primary py-2.5">
            <button
              type="button"
              onClick={() => app.toggleTask(t.id)}
              aria-pressed={t.done}
              aria-label={`Mark ${t.name} ${t.done ? "not done" : "done"}`}
              className={`flex size-5 shrink-0 flex-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                t.done ? "border-accent bg-accent text-inverted" : "border-secondary hover:border-accent"
              }`}
            >
              {t.done && (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 8.5 6.5 12 13 4.5" />
                </svg>
              )}
            </button>
            <span className={`min-w-0 flex-1 truncate text-p1 ${t.done ? "text-secondary line-through" : "text-primary"}`}>
              {t.name}
            </span>
            <span className="hidden w-24 shrink-0 text-p2 text-tertiary lg:block">—</span>
            <span className="hidden w-28 shrink-0 items-center gap-1.5 truncate text-p2 text-secondary xl:flex">
              <span className="size-2 shrink-0 rounded-full bg-data" /> {s.projectName}
            </span>
            <span className="hidden w-20 shrink-0 items-center gap-1.5 text-p2 text-secondary md:flex">
              <BarsIcon className="size-3.5" /> High
            </span>
            <span className="hidden w-24 shrink-0 items-center gap-1.5 text-p2 text-secondary sm:flex">
              <FlagIcon className="size-3.5" /> {t.done ? "Done" : "In Progress"}
            </span>
            <span className="w-16 shrink-0 text-right text-p2 text-secondary tabular-nums">
              {t.estimate ? fmt(t.estimate) : "—"}
            </span>
            <button
              type="button"
              onClick={() => {
                app.startTimer(t.name);
                app.setView("timer");
              }}
              className="shrink-0 rounded bg-secondary px-2 py-1 text-h6 font-semibold tracking-wide text-secondary outline-none transition-opacity hover:bg-secondary-hover focus-visible:ring-2 focus-visible:ring-bg-accent sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              START
            </button>
          </li>
        ))}
      </ul>

      {(adding || s.tasks.length > 0) && (
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-primary py-2.5">
          <span className="size-5 shrink-0 rounded-full border border-dashed border-secondary" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus={adding}
            placeholder="Add task"
            aria-label="Add task"
            className="min-w-0 flex-1 bg-transparent text-p1 text-primary outline-none placeholder:text-secondary"
          />
        </form>
      )}

      {s.tasks.length === 0 && !adding && (
        <div className="flex flex-col items-start gap-2 py-10">
          <p className="text-p1 text-primary">No tasks yet.</p>
          <p className="max-w-[54ch] text-p2 text-secondary">
            Break {s.projectName} into the pieces you actually bill for. Each one can carry its own estimate,
            so by the end of the week you learn which kind of work you underprice.
          </p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-1 flex items-center gap-1.5 rounded px-2 py-1.5 text-p1 font-medium text-accent outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            <PlusIcon className="size-3.5" /> Add your first task
          </button>
        </div>
      )}
    </div>
  );
}

function Pill({
  icon, label, value, caret, badge,
}: { icon: React.ReactNode; label?: string; value?: string; caret?: boolean; badge?: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-primary px-2.5 py-1.5 text-p2 text-secondary">
      <span className="shrink-0 opacity-70">{icon}</span>
      {label}
      {value && <span className="font-medium text-accent">{value}</span>}
      {badge && (
        <span className="flex size-4 flex-center rounded-full bg-accent text-[0.5625rem] font-bold text-inverted">
          {badge}
        </span>
      )}
      {caret && <ChevronDown className="size-3" />}
    </span>
  );
}
