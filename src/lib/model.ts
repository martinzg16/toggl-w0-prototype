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
  /** hourly rate, when the project has one. Null means no revenue story. */
  rate?: number | null;
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

/* ── Proposing a duration when a booked slot gets logged ─────────────── */

export interface Proposal {
  /** minutes we think it actually took */
  minutes: number;
  /** the evidence, in the user's terms — never "our algorithm says" */
  reason: string;
  /** false when we are only echoing the slot back, which is not a finding */
  evidenced: boolean;
}

const words = (s: string) =>
  new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3));

const overlap = (a: string, b: string) => {
  const x = words(a);
  const y = words(b);
  if (!x.size || !y.size) return 0;
  let hit = 0;
  x.forEach((w) => y.has(w) && hit++);
  return hit / Math.min(x.size, y.size);
};

/**
 * A calendar slot records when something was booked, not how long it took.
 * Logging one silently launders an estimate into a fact, so we propose a
 * duration from whatever evidence exists and let the user settle it.
 *
 * Priority: something like it that was already logged, then this user's own
 * habit of trimming or overrunning, then the slot itself — said plainly as
 * the slot, because echoing an input back is not an insight.
 */
export function proposeDuration(
  target: { id: string; label: string; slotMinutes: number },
  history: { label: string; minutes: number; slotMinutes?: number }[],
): Proposal {
  const like = history
    .map((h) => ({ h, score: overlap(target.label, h.label) }))
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score)[0];

  if (like) {
    return {
      minutes: like.h.minutes,
      reason: `You logged “${like.h.label}” at ${fmtMins(like.h.minutes)}.`,
      evidenced: true,
    };
  }

  const adjusted = history.filter((h) => h.slotMinutes && h.slotMinutes !== h.minutes);
  if (adjusted.length >= 2) {
    const ratio =
      adjusted.reduce((t, h) => t + h.minutes / (h.slotMinutes as number), 0) / adjusted.length;
    const rounded = Math.max(15, Math.round((target.slotMinutes * ratio) / 5) * 5);
    if (rounded !== target.slotMinutes) {
      const dir = ratio < 1 ? "shorter" : "longer";
      const pctOff = Math.round(Math.abs(1 - ratio) * 100);
      return {
        minutes: rounded,
        reason: `Your logged meetings run about ${pctOff}% ${dir} than they're booked for.`,
        evidenced: true,
      };
    }
  }

  return {
    minutes: target.slotMinutes,
    reason: `Booked for ${fmtMins(target.slotMinutes)} — that's the slot, not the work.`,
    evidenced: false,
  };
}

const fmtMins = (m: number) => {
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
};

/* ── What the deviation costs ────────────────────────────────────────── */

export interface Money {
  /** absolute dollars at stake */
  amount: number;
  /** what those dollars are, in the user's terms */
  label: string;
  /** true when the money is working against the user */
  adverse: boolean;
}

export const money = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * Hours are the mechanism; money is why anyone cares. A rate turns "6h over"
 * into "$480 of margin gone", which is the sentence a freelancer acts on.
 *
 * Returns null without a rate rather than inventing one — an unpriced project
 * has no revenue story, and guessing would be worse than silence.
 */
export function revenueImpact(
  kind: Kind,
  planned: number,
  tracked: number,
  rate: number | null,
): Money | null {
  if (!rate || kind === "personal") return null;
  const gap = Math.round(Math.abs(tracked - planned) * 10) / 10;
  if (gap < NOISE_FLOOR_HOURS) return null;

  const over = tracked > planned;
  const amount = gap * rate;

  if (kind === "fixed") {
    return over
      ? { amount, label: `${money(amount)} of margin gone at ${money(rate)}/h`, adverse: true }
      : { amount, label: `${money(amount)} you priced for and didn't spend`, adverse: false };
  }

  return over
    ? { amount, label: `${money(amount)} of unbilled hours at ${money(rate)}/h`, adverse: true }
    : { amount, label: `${money(amount)} of capacity you carried unbilled`, adverse: true };
}

/** The week's net position, counting only what works against the user. */
export function revenueAtRisk(projects: WeekProject[], dismissed: Set<string> = new Set()) {
  return projects.reduce((total, p) => {
    if (dismissed.has(p.id)) return total;
    const m = revenueImpact(p.kind, p.planned, p.tracked, p.rate ?? null);
    return m?.adverse ? total + m.amount : total;
  }, 0);
}
