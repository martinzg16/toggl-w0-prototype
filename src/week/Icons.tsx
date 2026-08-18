/** Drawn icons, one stroke weight, matching Toggl's line character. */
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const CalendarIcon = (p: { className?: string }) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" />
    <path d="M2 6.5h12M5.5 2v3M10.5 2v3" />
  </svg>
);

export const CheckIcon = (p: { className?: string }) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M3 8.5 6.5 12 13 4.5" />
  </svg>
);

export const PlusIcon = (p: { className?: string }) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export const ArrowIcon = (p: { className?: string }) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
