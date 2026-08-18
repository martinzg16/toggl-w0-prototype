import { fmt, minutesOf } from "../week/data";
import type { App } from "../store";
import { ArrowIcon } from "../week/Icons";
import { KINDS } from "../lib/model";

/** The estimate captured in onboarding, and what the week has done to it. */
export function ProjectsView({ app }: { app: App }) {
  const { s } = app;
  const tracked = s.week
    .slice(0, s.today + 1)
    .flatMap((d) => d.segments)
    .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
    .reduce((t, sg) => t + minutesOf(sg), 0);
  const est = s.projectEstimate;
  const over = tracked > est;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <h1 className="font-display text-h2 text-primary">Projects</h1>

      <article className="flex flex-col gap-4 rounded border border-primary p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full bg-data" />
            <div>
              <h2 className="text-h4 font-semibold text-primary">{s.projectName}</h2>
              <p className="text-p2 text-secondary">Acme Corp</p>
            </div>
          </div>
          <span className="text-p2 text-secondary tabular-nums">
            {fmt(tracked)} / {fmt(est)}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-data transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (tracked / Math.max(est, 1)) * 100)}%` }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-h6 font-semibold tracking-wide text-secondary">KIND OF WORK</span>
          <span className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <span
                key={k.id}
                aria-current={s.projectKind === k.id ? "true" : undefined}
                className={`rounded px-2.5 py-1 text-p2 font-medium ${
                  s.projectKind === k.id ? "bg-muted text-accent" : "bg-secondary text-secondary"
                }`}
              >
                {k.label}
              </span>
            ))}
          </span>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-h6 font-semibold tracking-wide text-secondary">
            WEEKLY PACE — SET WHEN YOU CREATED THIS PROJECT
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={Math.round(est / 60)}
              onChange={(e) => app.setEstimate(Math.max(1, Number(e.target.value) || 1) * 60)}
              className="w-20 rounded border border-primary bg-primary px-2.5 py-1.5 text-p1 text-primary tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-bg-accent"
            />
            <span className="text-p1 text-secondary">hours a week</span>
          </span>
        </label>

        {over && (
          <p className="text-p2 text-warning">
            Already {fmt(tracked - est)} over. This week will offer a calibrated figure on Friday.
          </p>
        )}
      </article>

      <button
        type="button"
        onClick={() => app.setView("week")}
        className="flex items-center gap-1.5 self-start rounded px-2 py-1.5 text-p1 font-medium text-accent outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
      >
        See this week <ArrowIcon className="size-3.5" />
      </button>
    </div>
  );
}
