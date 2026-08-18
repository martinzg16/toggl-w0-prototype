/**
 * Synthetic week-one data for a solo freelancer.
 * Mock, as the brief allows — no backend. Times are minutes from midnight.
 */

export type SegmentKind = "tracked" | "calendar";

export interface Segment {
  id: string;
  start: number;
  end: number;
  label: string;
  kind: SegmentKind;
  /** calendar segments carry where they came from */
  source?: string;
}

export interface Day {
  weekday: string;
  date: number;
  /** the user's stated working window, from Availability */
  workStart: number;
  workEnd: number;
  segments: Segment[];
}

export const PROJECT = {
  /** the project colour ramp, in Toggl's own --*-data-* contract */
  colour: {
    "--foreground-data-light": "138 20 138",
    "--foreground-data-dark": "238 191 238",
    "--background-data-light": "183 26 183",
    "--background-data-dark": "228 124 228",
    "--background-data-muted-light": "252 227 252",
    "--background-data-muted-dark": "80 11 80",
    "--stroke-data-light": "224 36 224",
    "--stroke-data-dark": "228 124 228",
  } as Record<string, string>,
};

const h = (hours: number, mins = 0) => hours * 60 + mins;

export const WEEK: Day[] = [
  {
    weekday: "Mon",
    date: 17,
    workStart: h(9),
    workEnd: h(18),
    segments: [
      { id: "m1", start: h(11), end: h(12), label: "Kickoff call", kind: "calendar", source: "Google Calendar" },
    ],
  },
  {
    weekday: "Tue",
    date: 18,
    workStart: h(9),
    workEnd: h(18),
    segments: [
      { id: "t1", start: h(11), end: h(12), label: "Weekly client sync", kind: "calendar", source: "Google Calendar" },
      { id: "t2", start: h(15), end: h(16, 30), label: "Design review with Priya", kind: "calendar", source: "Google Calendar" },
    ],
  },
  {
    weekday: "Wed",
    date: 19,
    workStart: h(9),
    workEnd: h(18),
    segments: [
      { id: "w1", start: h(10), end: h(12, 30), label: "Type system workshop", kind: "calendar", source: "Google Calendar" },
      { id: "w2", start: h(14), end: h(15, 30), label: "Stakeholder call", kind: "calendar", source: "Google Calendar" },
    ],
  },
  {
    weekday: "Thu",
    date: 20,
    workStart: h(9),
    workEnd: h(18),
    segments: [
      { id: "th1", start: h(9, 30), end: h(10, 30), label: "Client standup", kind: "calendar", source: "Google Calendar" },
      { id: "th2", start: h(16), end: h(17), label: "Colour system review", kind: "calendar", source: "Google Calendar" },
    ],
  },
  {
    weekday: "Fri",
    date: 21,
    workStart: h(9),
    workEnd: h(17),
    segments: [
      { id: "f1", start: h(10), end: h(11), label: "Handoff walkthrough", kind: "calendar", source: "Google Calendar" },
    ],
  },
  { weekday: "Sat", date: 22, workStart: 0, workEnd: 0, segments: [] },
  { weekday: "Sun", date: 23, workStart: 0, workEnd: 0, segments: [] },
];

/** The visible band of the ribbon — earliest work start to latest work end. */
export const BAND_START = h(9);
export const BAND_END = h(18);

/** The calendar grid shows more than the working band, so availability reads as a band. */
export const GRID_START = h(8);
export const GRID_END = h(20);

export const minutesOf = (s: Segment) => s.end - s.start;

/** What a segment counts for: the logged duration when the user settled on
 *  one, otherwise the slot it occupies. */
export const countedMinutes = (s: Segment, durations: Record<string, number> = {}) =>
  durations[s.id] ?? s.end - s.start;

export function fmt(mins: number) {
  const hrs = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (hrs === 0) return `${m}m`;
  if (m === 0) return `${hrs}h`;
  return `${hrs}h ${m}m`;
}
