import { useEffect, useLayoutEffect, useState } from "react";
import type { App, View } from "../store";
import { CheckIcon } from "../week/Icons";
import { WEEK } from "../week/data";

/**
 * The walkthrough Toggl ships after onboarding, made hands-on. Every stop
 * performs the real action against the real store, through the product's own
 * affordance, and the spotlight keeps the affected element visible so the user
 * watches their own change land.
 *
 * The timer is deliberately absent. Starting a clock assumes the user is
 * working right now, which a person setting up rarely is — and this feature
 * does not improve capture, so capture cannot be the toll to get in.
 */
type Ctx = { project: string; imported: boolean };

interface Stop {
  id: string;
  target: string;
  view: View;
  title: string;
  body: (c: Ctx) => string;
  place?: "below" | "right";
  cta: string;
  placeholder?: string;
  prefill?: (c: Ctx) => string;
  /** day + hour pickers, for the stop that puts something on the calendar */
  schedule?: boolean;
  run: (app: App, v: { text: string; day: number; hour: number }) => void;
  confirm: (v: { text: string; day: number; hour: number }) => string;
}

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17];
const hhmm = (h: number) => `${h}:00`;

const STOPS: Stop[] = [
  {
    id: "timer",
    target: "[data-tour='timer']",
    view: "timer",
    title: "Name what you want to measure",
    body: () =>
      "This sits in the timer bar, ready. Press play whenever you actually start — nothing runs until you do.",
    place: "below",
    cta: "Save it",
    placeholder: "What do you want to measure?",
    prefill: ({ project }) => `${project} — first pass`,
    run: (app, v) => app.setDraftLabel(v.text.trim()),
    confirm: (v) => `“${v.text}” is waiting in the timer bar. Press play when you start.`,
  },
  {
    id: "calendar",
    target: "[data-tour='calendar']",
    view: "timer",
    title: "Put work on a day",
    body: () =>
      "Most time gets logged after the fact. Pick the day and hour and it lands on the calendar — the open band is your working hours.",
    place: "below",
    cta: "Add it to the calendar",
    placeholder: "What did you do?",
    prefill: () => "Kickoff notes",
    schedule: true,
    run: (app, v) => app.addEntry(v.day, v.hour * 60, v.hour * 60 + 60, v.text.trim() || "Untitled"),
    confirm: (v) => `“${v.text}” is on ${WEEK[v.day].weekday} at ${hhmm(v.hour)}.`,
  },
  {
    id: "tasks",
    target: "[data-tour='add-task']",
    view: "tasks",
    title: "Break the project into tasks",
    body: ({ project, imported }) =>
      imported
        ? `Your imported projects came across with none. Add task, up here, is where the pieces of ${project} go.`
        : `Add task, up here, is where you break ${project} into the pieces you actually bill for.`,
    place: "below",
    cta: "Add this task",
    placeholder: "Add a task",
    prefill: () => "Wordmark exploration",
    run: (app, v) => app.addTask(v.text.trim() || "Untitled task"),
    confirm: (v) => `“${v.text}” is in ${"your task list"}.`,
  },
  {
    id: "week",
    target: "[data-tour-nav='week']",
    view: "week",
    title: "Friday, your number gets checked",
    body: ({ project }) =>
      `This is where the pace you set for ${project} meets what you actually tracked — and where you correct it.`,
    place: "right",
    cta: "Finish",
    run: (app) => app.endTour(),
    confirm: () => "",
  },
];

export function Tour({ app }: { app: App }) {
  const { s } = app;
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [text, setText] = useState("");
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(11);
  const [justDid, setJustDid] = useState<string | null>(null);
  const stop = STOPS[i];
  const ctx: Ctx = { project: s.projectName, imported: s.origin === "imported" };

  useEffect(() => {
    if (stop && app.view !== stop.view) app.setView(stop.view);
  }, [stop, app]);

  useEffect(() => {
    setText(stop?.prefill ? stop.prefill(ctx) : "");
    setJustDid(null);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!stop) return;
    const measure = () => {
      const el = document.querySelector(stop.target);
      setBox(el ? el.getBoundingClientRect() : null);
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [stop, app.view, justDid]);

  if (!stop) return null;
  const last = i + 1 === STOPS.length;
  const advance = () => (last ? app.endTour() : setI(i + 1));

  const perform = () => {
    const v = { text, day, hour };
    stop.run(app, v);
    if (last) return;
    setJustDid(stop.confirm(v));
  };

  const pad = 6;
  const tipH = stop.schedule ? 400 : 300;
  const tip: React.CSSProperties = box
    ? stop.place === "right"
      ? { top: Math.max(12, Math.min(box.top - 8, innerHeight - tipH)), left: box.right + 14 }
      : {
          top: Math.min(box.bottom + 12, Math.max(12, innerHeight - tipH)),
          left: Math.min(Math.max(12, box.left), innerWidth - 372),
        }
    : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product tour">
      {box && (
        <div
          className="pointer-events-none absolute rounded transition-all duration-300 ease-out"
          style={{
            top: box.top - pad,
            left: box.left - pad,
            width: box.width + pad * 2,
            height: box.height + pad * 2,
            boxShadow: "0 0 0 9999px rgb(19 18 19 / 55%)",
            outline: "2px solid rgb(var(--background-accent))",
          }}
        />
      )}

      <div
        className="absolute w-[min(22rem,calc(100vw-1.5rem))] rounded border border-primary bg-primary p-4 shadow-raised-50"
        style={tip}
      >
        <p className="text-h6 font-semibold tracking-wide text-secondary">
          STEP {i + 1} OF {STOPS.length}
        </p>
        <h2 className="mt-1.5 text-p1 font-semibold text-primary">{stop.title}</h2>
        <p className="mt-1 text-p2 leading-relaxed text-secondary">{stop.body(ctx)}</p>

        {stop.placeholder && !justDid && (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && perform()}
            placeholder={stop.placeholder}
            aria-label={stop.placeholder}
            autoFocus
            className="mt-3 w-full rounded border border-primary bg-primary px-2.5 py-1.5 text-p2 text-primary outline-none placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-bg-accent"
          />
        )}

        {stop.schedule && !justDid && (
          <div className="mt-3 flex flex-col gap-2">
            <span className="text-h6 font-semibold tracking-wide text-secondary">DAY</span>
            <div className="flex gap-1">
              {WEEK.slice(0, 5).map((d, n) => (
                <button
                  key={d.weekday}
                  type="button"
                  onClick={() => setDay(n)}
                  aria-pressed={day === n}
                  className={`flex-1 rounded px-1.5 py-1 text-p2 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                    day === n ? "bg-accent text-inverted" : "bg-secondary text-secondary hover:bg-secondary-hover"
                  }`}
                >
                  {d.weekday}
                </button>
              ))}
            </div>
            <span className="text-h6 font-semibold tracking-wide text-secondary">START</span>
            <div className="flex flex-wrap gap-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHour(h)}
                  aria-pressed={hour === h}
                  className={`rounded px-2 py-1 text-p2 font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                    hour === h ? "bg-accent text-inverted" : "bg-secondary text-secondary hover:bg-secondary-hover"
                  }`}
                >
                  {hhmm(h)}
                </button>
              ))}
            </div>
          </div>
        )}

        {justDid && (
          <p className="mt-3 flex items-start gap-1.5 rounded bg-muted px-2.5 py-2 text-p2 text-primary">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
            {justDid}
          </p>
        )}

        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={app.endTour}
            className="rounded px-2 py-1.5 text-p2 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={justDid ? advance : perform}
            className="ml-auto rounded bg-accent px-3 py-1.5 text-p2 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            {justDid ? (last ? "Got it" : "Next") : stop.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
