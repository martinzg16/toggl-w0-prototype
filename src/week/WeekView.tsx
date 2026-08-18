import { useMemo, useState } from "react";
import { PROJECT, countedMinutes, fmt, minutesOf } from "./data";
import { proposeDuration } from "../lib/model";
import type { App } from "../store";
import {
  daysTracked,
  statement,
  trackedMinutes,
  unclaimedMinutes,
  unclaimedSegments,
  type WeekState,
} from "./logic";
import { Ribbon } from "./Ribbon";
import { ArrowIcon, CalendarIcon, CheckIcon, PlusIcon } from "./Icons";

export function WeekView({ app }: { app: App }) {
  const { s: store } = app;
  const [focused, setFocused] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const state: WeekState = useMemo(
    () => ({
      today: store.today,
      claimed: store.claimed,
      week: store.week,
      claimDurations: store.claimDurations,
      projectName: store.projectName,
      estimate: store.projectEstimate,
    }),
    [store.today, store.claimed, store.claimDurations, store.week, store.projectName, store.projectEstimate],
  );
  const today = store.today;
  const setToday = app.setToday;

  const tracked = trackedMinutes(state);
  const missing = unclaimedMinutes(state);
  const gaps = unclaimedSegments(state);
  const days = daysTracked(state);
  const est = store.projectEstimate;
  const said = statement(state);

  const [logging, setLogging] = useState<{ seg: import("./data").Segment; dayIndex: number } | null>(null);
  const claimAll = () => app.claimMany(gaps.map(({ seg }) => seg.id));

  /* Everything already settled this week is the evidence a proposal draws on. */
  const history = store.week
    .flatMap((d) => d.segments)
    .filter((sg) => sg.kind === "tracked" || store.claimed.has(sg.id))
    .map((sg) => ({
      label: sg.label,
      minutes: countedMinutes(sg, store.claimDurations),
      slotMinutes: sg.kind === "calendar" ? minutesOf(sg) : undefined,
    }));

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={PROJECT.colour as React.CSSProperties}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
          {/* The sentence. It is the headline, and it changes every day. */}
          <div className="flex flex-col gap-2">
            <h1 className="max-w-[38ch] text-balance font-display text-h2 leading-tight text-primary">
            {said.line}
          </h1>
          <div className="flex items-center gap-4 text-p2 text-secondary tabular-nums">
            <span>
              <span className="text-primary">{fmt(tracked)}</span> tracked of {fmt(est)} estimated
            </span>
            <span className="h-3 w-px bg-secondary-active" />
            <span>
              <span className="text-primary">
                {days.tracked} of {days.total}
              </span>{" "}
              working days tracked
            </span>
          </div>
        </div>

        {/* The estimate as a length, not a number. */}
        <EstimateBar tracked={tracked} missing={missing} estimate={est} />

        <Ribbon
          state={state}
          onClaim={(id) => {
            const found = store.week.flatMap((d, i) => d.segments.map((sg) => ({ sg, i }))).find((x) => x.sg.id === id);
            if (found) setLogging({ seg: found.sg, dayIndex: found.i });
          }}
          focused={focused}
          onFocus={setFocused}
        />

        {gaps.length > 0 && (
          <Repair
            gaps={gaps}
            focused={focused}
            onFocus={setFocused}
            onOpen={(seg, dayIndex) => setLogging({ seg, dayIndex })}
            onClaimAll={claimAll}
            total={missing}
            week={store.week}
          />
        )}

        {said.action === "expand" && !expanded && (
          <Expansion onAdd={() => setExpanded(true)} />
        )}
          {expanded && (
            <p className="flex items-center gap-2 text-p1 text-secondary">
              <CheckIcon className="shrink-0 text-success" />
              Second project added. Its estimate starts from what this week taught you.
            </p>
          )}
        </div>
      </div>

      {logging && (
        <LogDialog
          seg={logging.seg}
          day={store.week[logging.dayIndex].weekday}
          history={history}
          onCancel={() => setLogging(null)}
          onConfirm={(minutes) => {
            app.claim(logging.seg.id, minutes);
            setLogging(null);
          }}
        />
      )}

      <Scrubber today={today} onChange={setToday} week={store.week} />
    </div>
  );
}

function EstimateBar({ tracked, missing, estimate }: { tracked: number; missing: number; estimate: number }) {
  const total = Math.max(estimate, tracked + missing);
  const w = (m: number) => `${(m / total) * 100}%`;
  const over = tracked + missing > estimate;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex h-7 w-full overflow-hidden rounded bg-secondary">
        <div className="h-full bg-data transition-all duration-300 ease-out" style={{ width: w(tracked) }} />
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: w(missing),
            backgroundImage:
              "repeating-linear-gradient(135deg, rgb(var(--background-data) / 30%) 0 3px, transparent 3px 7px)",
          }}
        />
        {/* the estimate line: where the user said this would land */}
        <div
          className="absolute inset-y-0 w-0.5 bg-inverted-secondary"
          style={{ left: `${(estimate / total) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-h6 font-semibold tracking-wide text-secondary tabular-nums">
        <span>YOUR ESTIMATE · {fmt(estimate)}</span>
        {over && (
          <span className="text-warning">
            OVER BY {fmt(tracked + missing - estimate)}
            {missing > 0 ? " ONCE SETTLED" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Repair({
  gaps,
  focused,
  onFocus,
  onOpen,
  onClaimAll,
  total,
  week,
}: {
  week: import("./data").Day[];
  gaps: { seg: import("./data").Segment; dayIndex: number }[];
  focused: string | null;
  onFocus: (id: string | null) => void;
  onOpen: (seg: import("./data").Segment, dayIndex: number) => void;
  onClaimAll: () => void;
  total: number;
}) {
  return (
    <section className="flex flex-col gap-2 border-t border-primary pt-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-h6 font-semibold tracking-wide text-secondary">
          <CalendarIcon className="size-3.5" />
          FROM YOUR CALENDAR · {fmt(total)} UNLOGGED
        </h2>
        <button
          type="button"
          onClick={onClaimAll}
          className="rounded px-2 py-1.5 text-p2 font-medium text-accent transition-colors hover:bg-primary-hover"
        >
          Log all
        </button>
      </div>

      <ul className="flex flex-col">
        {gaps.map(({ seg, dayIndex }) => (
          <li key={seg.id}>
            <button
              type="button"
              onClick={() => onOpen(seg, dayIndex)}
              onMouseEnter={() => onFocus(seg.id)}
              onMouseLeave={() => onFocus(null)}
              onFocus={() => onFocus(seg.id)}
              onBlur={() => onFocus(null)}
              className={`group flex w-full items-center gap-3 rounded px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                focused === seg.id ? "bg-primary-hover" : "hover:bg-primary-hover"
              }`}
            >
              <span className="w-10 shrink-0 text-p2 text-secondary tabular-nums">{week[dayIndex].weekday}</span>
              <span className="min-w-0 flex-1 truncate text-p1 text-primary">{seg.label}</span>
              <span className="shrink-0 text-p2 text-secondary tabular-nums">{fmt(minutesOf(seg))}</span>
              <span className="flex shrink-0 items-center gap-1 rounded bg-secondary px-2 py-1 text-h6 font-semibold tracking-wide text-secondary transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                <PlusIcon className="size-3" />
                LOG IT
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Expansion({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="flex items-center justify-between gap-4 rounded bg-muted px-4 py-3">
      <p className="text-p1 text-primary">
        One week in, your estimates have something to stand on. Ready for a second client?
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex shrink-0 items-center gap-1.5 rounded bg-accent px-3 py-2 text-p1 font-medium text-inverted transition-colors hover:bg-accent-hover"
      >
        Add a project
        <ArrowIcon className="size-3.5" />
      </button>
    </section>
  );
}

/**
 * A booked slot says when something was scheduled, not how long it took.
 * Rather than laundering that into tracked time, propose a duration from the
 * evidence and let the user settle it.
 */
function LogDialog({
  seg, day, history, onCancel, onConfirm,
}: {
  seg: import("./data").Segment;
  day: string;
  history: { label: string; minutes: number; slotMinutes?: number }[];
  onCancel: () => void;
  onConfirm: (minutes: number) => void;
}) {
  const slot = minutesOf(seg);
  const proposal = proposeDuration({ id: seg.id, label: seg.label, slotMinutes: slot }, history);
  const [mins, setMins] = useState(proposal.minutes);
  const step = (d: number) => setMins((m) => Math.max(15, Math.min(600, m + d)));

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-dark/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Log ${seg.label}`}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-100 rounded-md border border-primary bg-primary p-5 shadow-raised-50"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-h6 font-semibold tracking-wide text-secondary">
          {day.toUpperCase()} · FROM YOUR CALENDAR
        </p>
        <h2 className="mt-1 text-h4 font-semibold text-primary">{seg.label}</h2>
        <p className="mt-1 text-p2 leading-relaxed text-secondary">{proposal.reason}</p>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-15)}
            aria-label="15 minutes less"
            className="flex size-9 shrink-0 flex-center rounded border border-primary text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            −
          </button>
          <span className="min-w-24 text-center font-display text-h2 text-primary tabular-nums">
            {fmt(mins)}
          </span>
          <button
            type="button"
            onClick={() => step(15)}
            aria-label="15 minutes more"
            className="flex size-9 shrink-0 flex-center rounded border border-primary text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            +
          </button>
          {mins !== slot && (
            <button
              type="button"
              onClick={() => setMins(slot)}
              className="ml-auto rounded px-2 py-1.5 text-p2 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
            >
              Use the {fmt(slot)} slot
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-2 text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(mins)}
            autoFocus
            className="ml-auto rounded bg-accent px-4 py-2 text-p1 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Log {fmt(mins)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Scrubber({
  today, onChange, week,
}: { today: number; onChange: (i: number) => void; week: import("./data").Day[] }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-primary bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-8">
      <span className="whitespace-nowrap text-h6 font-semibold tracking-wide text-secondary">
        STEP THROUGH WEEK ONE
      </span>
      <div className="flex flex-1 gap-1 lg:flex-none" role="group" aria-label="Step through the week">
        {week.map((d, i) => (
          <button
            key={d.weekday}
            type="button"
            onClick={() => onChange(i)}
            aria-current={i === today}
            className={`flex-1 rounded px-2 py-1 text-p2 lg:flex-none lg:px-2.5 font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
              i === today
                ? "bg-accent text-inverted"
                : i < today
                  ? "text-secondary hover:bg-primary-hover hover:text-primary"
                  : "text-tertiary hover:bg-primary-hover hover:text-secondary"
            }`}
          >
            {d.weekday}
          </button>
        ))}
      </div>
      <span className="ml-auto hidden whitespace-nowrap text-p2 text-secondary tabular-nums sm:inline">Day {today + 1} of 7</span>
    </div>
  );
}
