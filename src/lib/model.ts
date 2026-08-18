/**
 * The product's brain, kept out of the view on purpose: the same function that
 * previews Friday during onboarding is the one that reads Friday for real.
 *
 * The whole point of asking is that ONE number reads differently depending on
 * what kind of work it is. Going over on a fixed-price job eats the margin.
 * Going under on a retainer is what renewals die of. On personal work neither
 * is a problem, so we say nothing.
 */

export type Kind = "fixed" | "retainer" | "personal";
export type Tone = "alarm" | "watch" | "good" | "neutral";

export interface KindDef {
  id: Kind;
  label: string;
  /** What the hours number MEANS for this kind of work. Functional, not marketing. */
  hint: string;
}

export const KINDS: KindDef[] = [
  { id: "fixed", label: "Fixed price", hint: "Going over eats your margin" },
  { id: "retainer", label: "Retainer", hint: "Under and over both cost you" },
  { id: "personal", label: "Personal", hint: "Just for your own reading" },
];

export interface Reading {
  tone: Tone;
  /** The verdict, in one sentence. */
  headline: string;
  /** Why it matters, in one more. */
  detail: string;
}

const pct = (planned: number, tracked: number) =>
  Math.round(Math.abs((tracked - planned) / planned) * 100);

/** Below this, a deviation is rounding, not a finding. */
export const NOISE_FLOOR_HOURS = 0.25;

export function readWeek(kind: Kind, planned: number, tracked: number): Reading {
  const gap = Math.round(Math.abs(tracked - planned) * 10) / 10;

  if (gap < NOISE_FLOOR_HOURS) {
    return {
      tone: kind === "personal" ? "neutral" : "good",
      headline: "Right on the number.",
      detail:
        kind === "personal"
          ? "Nothing to fix — personal work is here so it stops disappearing."
          : "Your estimate held. That is the number to quote the next one at.",
    };
  }

  const over = tracked > planned;
  const delta = pct(planned, tracked);

  if (kind === "personal") {
    return {
      tone: "neutral",
      headline: over
        ? `You gave it ${delta}% more than you meant to.`
        : `You gave it ${gap}h less than you meant to.`,
      detail: "Nothing to fix — personal work is here so it stops disappearing.",
    };
  }

  if (kind === "fixed") {
    return over
      ? {
          tone: "alarm",
          headline: `This job is costing you ${delta}% more than you priced.`,
          detail: `${gap}h over, and on a fixed price every one of them comes out of your margin.`,
        }
      : {
          tone: "good",
          headline: `You're ${gap}h under what you priced.`,
          detail: "Worth knowing before you quote the next one at the same number.",
        };
  }

  return over
    ? {
        tone: "watch",
        headline: `You're ${gap}h over the retainer.`,
        detail: "Unbilled hours. This is the shape scope creep has before anyone names it.",
      }
    : {
        tone: "alarm",
        headline: `You're ${gap}h under the retainer.`,
        detail: "Unbilled capacity you carried, and the gap renewals get argued over.",
      };
}

/**
 * The scenario each kind previews during onboarding. Deliberately different
 * directions: the risk that matters is not the same one on every contract.
 */
export const PREVIEW_RATIO: Record<Kind, number> = { fixed: 1.6, retainer: 0.65, personal: 1.25 };

export const previewTracked = (kind: Kind, planned: number) =>
  Math.round(planned * PREVIEW_RATIO[kind] * 2) / 2;

export const HOUR_PRESETS = [5, 10, 20, 40];

export interface WeekProject {
  id: string;
  name: string;
  client?: string;
  kind: Kind;
  planned: number;
  tracked: number;
  /** the --*-data-* ramp this project paints with */
  colour: Record<string, string>;
}

/**
 * The line that runs above the projects. It exists to refuse the dashboard
 * reflex: the weekly TOTAL is almost always unremarkable, and reading it is
 * how people conclude the week was fine. The composition is the story.
 */
export function summarise(projects: WeekProject[], dismissed: Set<string> = new Set()) {
  const planned = projects.reduce((n, p) => n + p.planned, 0);
  const tracked = projects.reduce((n, p) => n + p.tracked, 0);
  /* A deviation the user has looked at and chosen to keep is not an open
     question any more. Saying it again is nagging, and nagging is how a
     week-one product teaches people to stop opening it. */
  const flagged = projects.filter((p) => {
    if (dismissed.has(p.id)) return false;
    const t = readWeek(p.kind, p.planned, p.tracked).tone;
    return t === "alarm" || t === "watch";
  });
  const worst =
    flagged.find((p) => readWeek(p.kind, p.planned, p.tracked).tone === "alarm") ?? flagged[0];

  return { planned: round(planned), tracked: round(tracked), delta: round(Math.abs(tracked - planned)), over: tracked > planned, flagged, worst };
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Tone → Toggl's own semantic tokens, rather than the spec's loose hexes. */
export const TONE_CLASS: Record<Tone, { text: string; bar: string }> = {
  alarm: { text: "text-error", bar: "bg-error" },
  watch: { text: "text-warning", bar: "bg-warning" },
  good: { text: "text-success", bar: "bg-success" },
  neutral: { text: "text-accent", bar: "bg-accent" },
};
