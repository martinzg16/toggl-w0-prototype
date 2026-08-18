import { fmt, minutesOf } from "../week/data";
import type { App } from "../store";

/** The week as plan rather than record: what each day holds. */
export function TimelineView({ app }: { app: App }) {
  const { s } = app;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="font-display text-h2 text-primary">Timeline</h1>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded border border-primary bg-secondary-active sm:grid-cols-5">
        {s.week.slice(0, 5).map((d, i) => {
          const logged = d.segments
            .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
            .reduce((t, sg) => t + minutesOf(sg), 0);
          const planned = s.tasks.filter((t) => t.plannedDay === i);
          const isToday = i === s.today;
          return (
            <div key={d.weekday} className={`flex min-h-40 flex-col gap-2 p-3 ${isToday ? "bg-muted" : "bg-primary"}`}>
              <div className="flex items-baseline justify-between">
                <span className={`text-p2 font-medium ${isToday ? "text-accent" : "text-secondary"}`}>
                  {d.weekday} {d.date}
                </span>
                <span className="text-h6 font-semibold text-secondary tabular-nums">
                  {logged > 0 ? fmt(logged) : "—"}
                </span>
              </div>
              {planned.map((t) => (
                <span
                  key={t.id}
                  className="truncate rounded-sm bg-data-muted px-2 py-1 text-p2 text-data"
                >
                  {t.name}
                </span>
              ))}
              {planned.length === 0 && (
                <span className="text-p2 text-secondary">
                  {i > s.today ? "Nothing planned" : "—"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="max-w-[60ch] text-p2 text-secondary">
        {s.tasks.length === 0
          ? "Add tasks and they appear here, ready to drop onto a day. Logged totals come from the timer."
          : "Planned tasks come from Tasks. Logged totals come from the timer."}
      </p>
    </div>
  );
}
