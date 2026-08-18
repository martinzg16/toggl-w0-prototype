import { COMPANIONS, type App } from "../store";
import { KINDS, readWeek, summarise, TONE_CLASS, type WeekProject } from "../lib/model";
import { AlertIcon, CheckIcon } from "../week/Icons";
import { minutesOf } from "../week/data";

/**
 * Surface B — the Friday verdict. Deliberately NOT inside Reports: Reports is
 * the surface that tells a solo user "One person's bars can't show balance",
 * and week one needs a destination that works with no history and no teammates.
 */
export function WeekVerdict({ app }: { app: App }) {
  const { s } = app;

  const tracked =
    s.week
      .slice(0, s.today + 1)
      .flatMap((d) => d.segments)
      .filter((sg) => sg.kind === "tracked" || s.claimed.has(sg.id))
      .reduce((t, sg) => t + minutesOf(sg), 0) / 60;

  const mine: WeekProject = {
    id: "mine",
    name: s.projectName,
    kind: s.projectKind,
    planned: s.recalibrated.mine ?? s.projectEstimate / 60,
    tracked: Math.round(tracked * 10) / 10,
    colour: {},
  };

  const projects = [mine, ...COMPANIONS].map((p) =>
    s.recalibrated[p.id] != null ? { ...p, planned: s.recalibrated[p.id] } : p,
  );
  const week = summarise(projects, s.dismissed);

  if (s.paceSkipped && s.projectEstimate === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-8 sm:px-8">
        <h1 className="font-display text-h2 text-primary">Your first week</h1>
        <p className="max-w-[58ch] text-p1 text-secondary">
          You skipped setting a pace, so there is nothing to read this against yet. Set one on
          {" "}{s.projectName} and Friday starts saying something.
        </p>
        <button
          type="button"
          onClick={() => app.setView("projects")}
          className="self-start rounded bg-accent px-3 py-2 text-p1 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          Set a pace
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 sm:px-8 sm:py-8">
      <p className="text-p2 text-secondary">Friday, 21 August</p>
      <h1 className="mt-1 font-display text-h2 leading-tight text-primary">Your first week</h1>

      {/* the total, kept quiet on purpose */}
      <p className="mt-5 text-p1 text-secondary tabular-nums">
        You planned {week.planned}h across {projects.length} projects and tracked {week.tracked}h.
      </p>

      {/* and the verdict that contradicts it */}
      <p className="mt-1.5 text-balance text-h3 font-semibold leading-snug text-primary">
        {week.flagged.length === 0 ? (
          <>Nothing left open. That&rsquo;s the whole report.</>
        ) : (
          <>
            {week.delta}h {week.over ? "over" : "under"} in total — which is not the story.{" "}
            {week.worst!.name} is.
          </>
        )}
      </p>

      <ol className="mt-8 flex flex-col">
        {projects.map((p) => (
          <Row
            key={p.id}
            project={p}
            answered={s.dismissed.has(p.id) ? "keep" : s.recalibrated[p.id] != null ? "update" : undefined}
            onUpdate={() => app.recalibrate(p.id, p.tracked)}
            onKeep={() => app.keepAsIs(p.id)}
          />
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 border-t border-primary pt-6">
        <p className="flex gap-2.5 text-p2 leading-relaxed text-secondary">
          <AlertIcon className="mt-0.5 shrink-0 text-tertiary" />
          Thursday only has 1.2h logged across everything. If that&rsquo;s a gap rather than a light
          day, two of these readings move.
        </p>
        <p className="text-p2 leading-relaxed text-tertiary">
          None of this needed history. It&rsquo;s the number you gave each project on day one,
          checked against what you actually tracked.
        </p>
        <p className="text-h6 font-semibold tracking-wide text-tertiary">
          COMPANION PROJECTS ARE SYNTHETIC · YOURS IS LIVE FROM THE TIMER
        </p>
      </div>
    </div>
  );
}

function Row({
  project, answered, onUpdate, onKeep,
}: {
  project: WeekProject;
  answered?: "update" | "keep";
  onUpdate: () => void;
  onKeep: () => void;
}) {
  const reading = readWeek(project.kind, project.planned, project.tracked);
  const tone = TONE_CLASS[reading.tone];
  const scale = Math.max(project.planned, project.tracked) || 1;
  const kindLabel = KINDS.find((k) => k.id === project.kind)!.label;
  const actionable = (reading.tone === "alarm" || reading.tone === "watch") && !answered;

  return (
    <li
      className={`flex flex-col gap-3 border-b border-primary py-5 first:border-t ${
        answered === "keep" ? "opacity-60" : ""
      }`}
      style={project.colour as React.CSSProperties}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="size-2.5 shrink-0 rounded-full bg-data" />
        <span className="text-p1 font-medium text-primary">{project.name}</span>
        {project.client && <span className="text-p2 text-secondary">{project.client}</span>}
        <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-h6 font-semibold tracking-wide text-secondary">
          {kindLabel.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <BarRow label="PLANNED" value={project.planned} scale={scale} className="bg-secondary-active" />
        <BarRow label="TRACKED" value={project.tracked} scale={scale} className={tone.bar} />
      </div>

      <div>
        <p className={`text-p1 font-medium ${tone.text}`}>{reading.headline}</p>
        <p className="text-p2 leading-snug text-secondary">{reading.detail}</p>
      </div>

      {actionable && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onUpdate}
            className="rounded bg-accent px-3 py-1.5 text-p2 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Make it {project.tracked}h a week
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="rounded border border-primary px-3 py-1.5 text-p2 font-medium text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Keep {project.planned}h
          </button>
        </div>
      )}

      {answered && (
        <p className="flex items-center gap-1.5 text-p2 text-secondary">
          <CheckIcon className="size-3.5 shrink-0 text-success" />
          {answered === "update" ? `Plan updated to ${project.planned}h a week.` : "Kept as it was."}
        </p>
      )}
    </li>
  );
}

function BarRow({
  label, value, scale, className,
}: { label: string; value: number; scale: number; className: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-16 shrink-0 text-h6 font-semibold tracking-wide text-secondary">{label}</span>
      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
        <span
          className={`block h-full origin-left rounded-full transition-transform duration-500 ease-out ${className}`}
          style={{ transform: `scaleX(${Math.min(1, value / scale)})` }}
        />
      </span>
      <span className="w-12 shrink-0 text-right text-p2 text-secondary tabular-nums">{value}h</span>
    </div>
  );
}
