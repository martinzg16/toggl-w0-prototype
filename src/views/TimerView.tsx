import { BAND_END, BAND_START, fmt, minutesOf } from "../week/data";
import type { App } from "../store";

const span = BAND_END - BAND_START;
const pct = (m: number) => ((m - BAND_START) / span) * 100;

/** Today, at hour resolution. Time started here lands on the same ribbon Reports reads. */
export function TimerView({ app }: { app: App }) {
  const { s } = app;
  const day = s.week[s.today];
  const total = day.segments
    .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
    .reduce((t, sg) => t + minutesOf(sg), 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 text-primary">
          {day.weekday} {day.date}
        </h1>
        <p className="text-p2 text-secondary tabular-nums">
          <span className="text-primary">{fmt(total)}</span> logged today ·{" "}
          {s.projectName || "No project"}
        </p>
      </div>

      <div className="relative h-10 rounded bg-secondary">
        {day.workEnd > day.workStart && (
          <div
            className="absolute inset-y-0 rounded bg-secondary-hover"
            style={{ left: `${pct(day.workStart)}%`, width: `${pct(day.workEnd) - pct(day.workStart)}%` }}
          />
        )}
        {day.segments.map((sg) => {
          const solid = sg.kind === "tracked" || s.claimed.has(sg.id);
          return (
            <div
              key={sg.id}
              title={`${sg.label} · ${fmt(minutesOf(sg))}`}
              className={`absolute inset-y-1 rounded-sm ${solid ? "bg-data" : "border border-dashed border-data-secondary"}`}
              style={{
                left: `${pct(sg.start)}%`,
                width: `${pct(sg.end) - pct(sg.start)}%`,
                backgroundImage: solid
                  ? undefined
                  : "repeating-linear-gradient(135deg, rgb(var(--background-data) / 22%) 0 3px, transparent 3px 7px)",
              }}
            />
          );
        })}
      </div>

      <ul className="flex flex-col divide-y divide-primary border-y border-primary">
        {day.segments.length === 0 && (
          <li className="py-6 text-p1 text-secondary">
            Nothing logged today yet. Hit play above to start.
          </li>
        )}
        {day.segments.map((sg) => {
          const solid = sg.kind === "tracked" || s.claimed.has(sg.id);
          return (
            <li key={sg.id} className="flex items-center gap-3 py-2.5">
              <span
                className={`size-2.5 shrink-0 rounded-full ${solid ? "bg-data" : "border border-dashed border-data-secondary"}`}
              />
              <span className="min-w-0 flex-1 truncate text-p1 text-primary">{sg.label}</span>
              {!solid && (
                <button
                  type="button"
                  onClick={() => app.claim(sg.id)}
                  className="rounded bg-secondary px-2 py-1 text-h6 font-semibold tracking-wide text-secondary outline-none transition-colors hover:bg-secondary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
                >
                  LOG IT
                </button>
              )}
              <span className="shrink-0 text-p2 text-secondary tabular-nums">{fmt(minutesOf(sg))}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
