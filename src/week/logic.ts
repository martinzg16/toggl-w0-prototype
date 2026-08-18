import { WEEK, PROJECT, minutesOf, fmt, type Day } from "./data";

export interface WeekState {
  /** 0-indexed day the user is currently living in */
  today: number;
  /** ids of calendar segments the user has confirmed into tracked time */
  claimed: Set<string>;
}

const upTo = (today: number) => WEEK.slice(0, today + 1);

export const trackedMinutes = (s: WeekState) =>
  upTo(s.today)
    .flatMap((d) => d.segments)
    .filter((seg) => seg.kind === "tracked" || s.claimed.has(seg.id))
    .reduce((t, seg) => t + minutesOf(seg), 0);

/** Time the calendar knows about but that was never logged. The hole. */
export const unclaimedMinutes = (s: WeekState) =>
  upTo(s.today)
    .flatMap((d) => d.segments)
    .filter((seg) => seg.kind === "calendar" && !s.claimed.has(seg.id))
    .reduce((t, seg) => t + minutesOf(seg), 0);

export const unclaimedSegments = (s: WeekState) =>
  upTo(s.today)
    .flatMap((d, i) => d.segments.map((seg) => ({ seg, dayIndex: i })))
    .filter(({ seg }) => seg.kind === "calendar" && !s.claimed.has(seg.id));

const workingMinutes = (d: Day) => d.workEnd - d.workStart;

/** Elapsed working time so far this week — the denominator for coverage. */
export const elapsedWorkingMinutes = (s: WeekState) =>
  upTo(s.today).reduce((t, d) => t + workingMinutes(d), 0);

/** Straight-line projection of where the project lands by Sunday. */
export function projectedMinutes(s: WeekState) {
  const daysSoFar = s.today + 1;
  const weekdaysSoFar = Math.min(daysSoFar, 5);
  if (weekdaysSoFar === 0) return 0;
  const rate = (trackedMinutes(s) + unclaimedMinutes(s)) / weekdaysSoFar;
  return Math.round(rate * 5);
}

export interface Statement {
  /** the sentence itself — plain, quantified, in Toggl's dry register */
  line: string;
  /** the one thing worth doing about it, when there is one */
  action?: "repair" | "expand";
}

/**
 * The line that changes every day. This is the return hook: the surface says
 * something different tomorrow, and it is about the user, not the team.
 */
export function statement(s: WeekState): Statement {
  const tracked = trackedMinutes(s);
  const missing = unclaimedMinutes(s);
  const est = PROJECT.estimateMinutes;

  if (s.today >= 4) {
    const total = tracked + missing;
    const delta = total - est;
    if (missing > 0) {
      return {
        line: `${fmt(missing)} still isn't accounted for. Settle it and ${PROJECT.name} closes the week at ${fmt(total)}.`,
        action: "repair",
      };
    }
    if (delta > 30) {
      return {
        line: `${PROJECT.name} took ${fmt(tracked)}. You estimated ${fmt(est)}. Start from ${fmt(Math.round(tracked / 60) * 60)} next time.`,
        action: "expand",
      };
    }
    return {
      line: `${PROJECT.name} took ${fmt(tracked)} against an estimate of ${fmt(est)}. Your first estimate held.`,
      action: "expand",
    };
  }

  if (missing >= 120) {
    return {
      line: `${fmt(missing)} of your week is unaccounted for. Your calendar knows what it was.`,
      action: "repair",
    };
  }

  if (missing > 0) {
    return {
      line: `${fmt(tracked)} tracked. ${fmt(missing)} more sits in your calendar, unlogged.`,
      action: "repair",
    };
  }

  const projected = projectedMinutes(s);
  if (s.today >= 1 && projected > est + 60) {
    return { line: `At this pace ${PROJECT.name} lands at ${fmt(projected)} — over your ${fmt(est)} estimate.` };
  }

  return { line: `${fmt(tracked)} of your ${fmt(est)} estimate for ${PROJECT.name}.` };
}
