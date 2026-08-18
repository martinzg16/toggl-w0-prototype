import { useState } from "react";
import { GRID_END, GRID_START, fmt, minutesOf, type Segment } from "../week/data";
import type { App } from "../store";
import { PlusIcon } from "../week/Icons";

const SPAN = GRID_END - GRID_START;
const HOURS = Array.from({ length: SPAN / 60 + 1 }, (_, i) => GRID_START / 60 + i);
const SLOT = 30; // minutes per clickable cell
const ROW_H = 44; // px per hour

const top = (m: number) => ((m - GRID_START) / SPAN) * 100;
const height = (a: number, b: number) => ((b - a) / SPAN) * 100;

/**
 * Toggl's week calendar. Availability is the shaded band, calendar events are
 * hatched until logged, and clicking an empty slot drops a block on the day.
 * Everything here is the same store Reports reads.
 */
export function TimerView({ app }: { app: App }) {
  const { s } = app;
  const [draft, setDraft] = useState<{ day: number; start: number } | null>(null);
  const [label, setLabel] = useState("");

  const days = s.week.slice(0, 5);

  const commit = () => {
    if (!draft) return;
    app.addEntry(draft.day, draft.start, draft.start + 60, label.trim() || "Untitled");
    setDraft(null);
    setLabel("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* day headers — logged / available, per Toggl */}
      <div className="flex shrink-0 border-b border-primary pr-3">
        <div className="w-14 shrink-0" />
        {days.map((d, i) => {
          const logged = d.segments
            .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
            .reduce((t, sg) => t + minutesOf(sg), 0);
          const available = d.workEnd - d.workStart;
          const isToday = i === s.today;
          return (
            <div key={d.weekday} className="flex flex-1 items-baseline gap-2 border-l border-primary px-3 py-2">
              <span
                className={`text-h3 tabular-nums ${
                  isToday ? "flex size-7 flex-center rounded-full bg-accent text-inverted" : "text-secondary"
                }`}
              >
                {d.date}
              </span>
              <span className="min-w-0">
                <span className="block text-p2 font-medium text-primary">{d.weekday}</span>
                <span className="block text-h6 font-semibold tracking-wide text-secondary tabular-nums">
                  {logged > 0 ? fmt(logged) : "–"} / {fmt(available)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* the grid */}
      <div className="min-h-0 flex-1 overflow-y-auto" data-tour="calendar">
        <div className="flex" style={{ height: (SPAN / 60) * ROW_H }}>
          <div className="relative w-14 shrink-0">
            {HOURS.map((hr) => (
              <span
                key={hr}
                className="absolute right-2 -translate-y-1/2 text-h6 font-semibold tracking-wide text-secondary tabular-nums"
                style={{ top: `${top(hr * 60)}%` }}
              >
                {hr}:00
              </span>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={day.weekday}
              className="relative min-w-0 flex-1 border-l border-primary bg-secondary"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgb(var(--stroke-primary)) 0 1px, transparent 1px " +
                  ROW_H +
                  "px)",
              }}
            >
              {/* availability reads as the open band; hours outside it stay shaded */}
              {day.workEnd > day.workStart && (
                <div
                  className="absolute inset-x-0 border-y border-primary bg-primary"
                  style={{ top: `${top(day.workStart)}%`, height: `${height(day.workStart, day.workEnd)}%` }}
                />
              )}

              {/* clickable empty slots */}
              {Array.from({ length: SPAN / SLOT }, (_, k) => {
                const start = GRID_START + k * SLOT;
                return (
                  <button
                    key={start}
                    type="button"
                    onClick={() => {
                      setDraft({ day: dayIndex, start });
                      setLabel("");
                    }}
                    aria-label={`Add time on ${day.weekday} at ${Math.floor(start / 60)}:${String(start % 60).padStart(2, "0")}`}
                    className="absolute inset-x-0 outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent focus-visible:ring-inset"
                    style={{ top: `${top(start)}%`, height: `${height(start, start + SLOT)}%` }}
                  />
                );
              })}

              {day.segments.map((sg) => (
                <Block key={sg.id} seg={sg} claimed={s.claimed.has(sg.id)} onClaim={() => app.claim(sg.id)} />
              ))}

              {draft?.day === dayIndex && (
                <div
                  className="absolute inset-x-1 z-10 rounded-sm border border-accent bg-primary p-1.5 shadow-raised-20"
                  style={{ top: `${top(draft.start)}%`, height: `${height(draft.start, draft.start + 60)}%` }}
                >
                  <input
                    autoFocus
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commit();
                      if (e.key === "Escape") setDraft(null);
                    }}
                    onBlur={commit}
                    placeholder="What did you do?"
                    aria-label="Entry description"
                    className="w-full bg-transparent text-p2 text-primary outline-none placeholder:text-secondary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="flex shrink-0 items-center gap-2 border-t border-primary bg-secondary px-4 py-2 text-p2 text-secondary sm:px-8">
        <PlusIcon className="size-3.5 shrink-0" />
        Click any slot to log time. Shaded hours are your availability; hatched blocks came from your calendar
        and are not logged yet.
      </p>
    </div>
  );
}

function Block({ seg, claimed, onClaim }: { seg: Segment; claimed: boolean; onClaim: () => void }) {
  const solid = seg.kind === "tracked" || claimed;
  const style = { top: `${top(seg.start)}%`, height: `${height(seg.start, seg.end)}%` };
  const shared = "absolute inset-x-1 z-10 overflow-hidden rounded-sm px-1.5 py-1 text-left";

  if (solid) {
    return (
      <div className={`${shared} bg-data text-inverted`} style={style} title={`${seg.label} · ${fmt(minutesOf(seg))}`}>
        <span className="block truncate text-p2 font-medium">{seg.label}</span>
        <span className="block text-h6 tabular-nums opacity-80">{fmt(minutesOf(seg))}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClaim}
      title={`${seg.label} · ${fmt(minutesOf(seg))} — click to log`}
      className={`${shared} cursor-pointer border border-dashed border-data-secondary text-data outline-none transition-colors hover:brightness-95 focus-visible:ring-2 focus-visible:ring-bg-accent`}
      style={{
        ...style,
        backgroundImage:
          "repeating-linear-gradient(135deg, rgb(var(--background-data) / 20%) 0 3px, transparent 3px 7px)",
      }}
    >
      <span className="block truncate text-p2 font-medium">{seg.label}</span>
      <span className="block text-h6 tabular-nums opacity-80">{fmt(minutesOf(seg))}</span>
    </button>
  );
}
