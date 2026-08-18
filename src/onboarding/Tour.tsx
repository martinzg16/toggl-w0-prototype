import { useEffect, useLayoutEffect, useState } from "react";
import type { App, View } from "../store";
import { CheckIcon } from "../week/Icons";

/**
 * The walkthrough Toggl ships after onboarding, made hands-on. Every stop
 * performs the real action against the real store, and the spotlight keeps the
 * affected element visible so the user watches their own change land. A tour
 * you can only read teaches where buttons are; this one teaches what they do.
 */
type Ctx = { project: string; imported: boolean };

interface Stop {
  id: string;
  target: string;
  view: View;
  title: string;
  body: (c: Ctx) => string;
  place?: "below" | "right";
  /** the label on the control that performs this stop's action */
  cta: string;
  /** placeholder when the action needs typing; omit for a one-tap action */
  placeholder?: string;
  prefill?: (c: Ctx) => string;
  run: (app: App, value: string) => void;
  done: (app: App) => boolean;
  confirm: (value: string) => string;
}

const STOPS: Stop[] = [
  {
    id: "timer",
    target: "[data-tour='timer']",
    view: "timer",
    title: "Say what you're working on",
    body: () => "A couple of words is enough. Name it here and the timer starts running on it.",
    place: "below",
    cta: "Start the timer",
    placeholder: "What are you working on?",
    prefill: ({ project }) => `${project} — first pass`,
    run: (app, v) => app.startTimer(v.trim() || "Untitled"),
    done: (app) => Boolean(app.s.runningSince),
    confirm: (v) => `Tracking “${v}”. The clock is running above.`,
  },
  {
    id: "calendar",
    target: "[data-tour='calendar']",
    view: "timer",
    title: "Log work you already did",
    body: () =>
      "Not everything gets tracked live. Drop a block on any day — the open band is your working hours, the shaded ones are not.",
    place: "below",
    cta: "Log an hour on Monday",
    placeholder: "What did you do?",
    prefill: () => "Kickoff notes",
    run: (app, v) => app.addEntry(0, 13 * 60, 14 * 60, v.trim() || "Untitled"),
    done: (app) => app.s.week[0].segments.some((sg) => sg.id.startsWith("cal-")),
    confirm: (v) => `“${v}” is on Monday at 13:00.`,
  },
  {
    id: "tasks",
    target: "[data-tour-nav='tasks']",
    view: "tasks",
    title: "Break the project into tasks",
    body: ({ project, imported }) =>
      imported
        ? `Your imported projects came across with none. Add the pieces of ${project} you actually bill for.`
        : `Add the pieces of ${project} you actually bill for — each can carry its own estimate.`,
    place: "right",
    cta: "Add this task",
    placeholder: "Add a task",
    prefill: () => "Wordmark exploration",
    run: (app, v) => app.addTask(v.trim() || "Untitled task"),
    done: (app) => app.s.tasks.length > 0,
    confirm: (v) => `“${v}” is in your task list.`,
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
    done: () => false,
    confirm: () => "",
  },
];

export function Tour({ app }: { app: App }) {
  const { s } = app;
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [value, setValue] = useState("");
  const [justDid, setJustDid] = useState<string | null>(null);
  const stop = STOPS[i];
  const ctx: Ctx = { project: s.projectName, imported: s.origin === "imported" };

  useEffect(() => {
    if (stop && app.view !== stop.view) app.setView(stop.view);
  }, [stop, app]);

  // reset the field for each stop, prefilled with something usable
  useEffect(() => {
    setValue(stop?.prefill ? stop.prefill(ctx) : "");
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
    if (stop.done(app) && !justDid) return advance();
    stop.run(app, value);
    if (last) return;
    setJustDid(stop.confirm(value));
  };

  const pad = 6;
  const tip: React.CSSProperties = box
    ? stop.place === "right"
      ? { top: Math.max(12, Math.min(box.top - 8, innerHeight - 300)), left: box.right + 14 }
      : { top: Math.min(box.bottom + 12, innerHeight - 280), left: Math.max(12, box.left) }
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
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && perform()}
            placeholder={stop.placeholder}
            aria-label={stop.placeholder}
            autoFocus
            className="mt-3 w-full rounded border border-primary bg-primary px-2.5 py-1.5 text-p2 text-primary outline-none placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-bg-accent"
          />
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
          {!justDid && !last && (
            <button
              type="button"
              onClick={advance}
              className="rounded px-2 py-1.5 text-p2 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
            >
              Not now
            </button>
          )}
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
