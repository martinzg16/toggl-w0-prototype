import { useEffect, useLayoutEffect, useState } from "react";
import type { App, View } from "../store";

/**
 * The guided tour Toggl ships after onboarding, rebuilt. It spotlights real
 * elements rather than describing them, and it moves the app to the view each
 * step is about — a tour that talks about a screen you cannot see is a leaflet.
 */
interface Stop {
  id: string;
  target: string;
  view: View;
  title: string;
  body: (ctx: { project: string; imported: boolean }) => string;
  place?: "below" | "right";
}

const STOPS: Stop[] = [
  {
    id: "timer",
    target: "[data-tour='timer']",
    view: "timer",
    title: "Type what you're focusing on",
    body: () => "A couple of words is enough, then press play. You can edit it any time.",
    place: "below",
  },
  {
    id: "calendar",
    target: "[data-tour='calendar']",
    view: "timer",
    title: "Or log it after the fact",
    body: () =>
      "Click any empty slot to drop a block on that day. The open band is your working hours; the shaded ones are not.",
    place: "below",
  },
  {
    id: "tasks",
    target: "[data-tour-nav='tasks']",
    view: "tasks",
    title: "Break the project into tasks",
    body: ({ project, imported }) =>
      imported
        ? `Your imported projects came with none. Add the pieces of ${project} you actually bill for — each can carry its own estimate.`
        : `Add the pieces of ${project} you actually bill for. Each can carry its own estimate, so you learn which kind of work you underprice.`,
    place: "right",
  },
  {
    id: "week",
    target: "[data-tour-nav='week']",
    view: "week",
    title: "Friday, your number gets checked",
    body: ({ project }) =>
      `This is where the pace you set for ${project} meets what you actually tracked — and where you correct it.`,
    place: "right",
  },
];

export function Tour({ app }: { app: App }) {
  const { s } = app;
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const stop = STOPS[i];

  // move the app to the view this stop is about, before measuring
  useEffect(() => {
    if (stop && app.view !== stop.view) app.setView(stop.view);
  }, [stop, app]);

  useLayoutEffect(() => {
    if (!stop) return;
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(stop.target);
      setBox(el ? el.getBoundingClientRect() : null);
    };
    // the view may have just switched; measure after paint, then keep in sync
    raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [stop, app.view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") app.endTour();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!stop) return null;
  const next = () => (i + 1 < STOPS.length ? setI(i + 1) : app.endTour());

  const pad = 6;
  const ctx = { project: s.projectName, imported: s.origin === "imported" };

  const tip: React.CSSProperties = box
    ? stop.place === "right"
      ? { top: Math.max(12, box.top - 8), left: box.right + 14 }
      : { top: box.bottom + 12, left: Math.max(12, box.left) }
    : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product tour">
      {/* the spotlight: one box, dimming everything outside it */}
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
            outlineOffset: 0,
          }}
        />
      )}

      <div
        className="absolute w-[min(21rem,calc(100vw-1.5rem))] rounded border border-primary bg-primary p-4 shadow-raised-50"
        style={tip}
      >
        <p className="text-h6 font-semibold tracking-wide text-secondary">
          STEP {i + 1} OF {STOPS.length}
        </p>
        <h2 className="mt-1.5 text-p1 font-semibold text-primary">{stop.title}</h2>
        <p className="mt-1 text-p2 leading-relaxed text-secondary">{stop.body(ctx)}</p>

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
            onClick={next}
            autoFocus
            className="ml-auto rounded bg-accent px-3 py-1.5 text-p2 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            {i + 1 === STOPS.length ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
