/** Drawn icons, one 1.5 stroke weight, matching Toggl's line character. */
type P = { className?: string };
const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const Svg = ({ className, children }: P & { children: React.ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" className={className} {...s} aria-hidden>
    {children}
  </svg>
);

export const CalendarIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" />
    <path d="M2 6.5h12M5.5 2v3M10.5 2v3" />
  </Svg>
);
export const CheckIcon = (p: P) => <Svg {...p}><path d="M3 8.5 6.5 12 13 4.5" /></Svg>;
export const PlusIcon = (p: P) => <Svg {...p}><path d="M8 3v10M3 8h10" /></Svg>;
export const ArrowIcon = (p: P) => <Svg {...p}><path d="M3 8h10M9 4l4 4-4 4" /></Svg>;

export const ClockIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></Svg>
);
export const ReportIcon = (p: P) => (
  <Svg {...p}><rect x="3" y="2.5" width="10" height="11" rx="1.5" /><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" /></Svg>
);
export const FolderIcon = (p: P) => (
  <Svg {...p}><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.4l1.3 1.6h5.3A1.5 1.5 0 0 1 14 6.1v5.4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5z" /></Svg>
);
export const ListIcon = (p: P) => (
  <Svg {...p}><path d="M6 4.5h8M6 8h8M6 11.5h8M2.5 4.5h.01M2.5 8h.01M2.5 11.5h.01" /></Svg>
);
export const TimelineIcon = (p: P) => (
  <Svg {...p}><rect x="2" y="3" width="12" height="3" rx="1" /><rect x="5" y="9.5" width="9" height="3" rx="1" /></Svg>
);
export const PersonIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="5.5" r="2.5" /><path d="M3.5 13.5a4.5 4.5 0 0 1 9 0" /></Svg>
);
export const ApprovalIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="8" r="6" /><path d="M5.5 8.2 7.2 10l3.3-3.6" /></Svg>
);
export const PalmIcon = (p: P) => (
  <Svg {...p}><path d="M8 6.5V14" /><path d="M8 6.5C6.5 4.5 4 4.8 3 6.2M8 6.5c1.5-2 4-1.7 5 -.3M8 6.5c-.4-2.2 1-3.6 2.6-3.9M8 6.5c.4-2.2-1-3.6-2.6-3.9" /></Svg>
);
export const StarIcon = (p: P) => (
  <svg width="12" height="12" viewBox="0 0 16 16" className={p.className} fill="currentColor" aria-hidden>
    <path d="M8 1.8l1.85 3.9 4.15.6-3 3 .7 4.3L8 11.6 4.3 13.6l.7-4.3-3-3 4.15-.6z" />
  </svg>
);
export const ChevronDown = (p: P) => <Svg {...p}><path d="M4 6.5 8 10.5l4-4" /></Svg>;
export const ChevronLeft = (p: P) => <Svg {...p}><path d="M10 3.5 5.5 8l4.5 4.5" /></Svg>;
export const ChevronRight = (p: P) => <Svg {...p}><path d="M6 3.5 10.5 8 6 12.5" /></Svg>;
export const UpgradeIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="8" r="6" /><path d="M8 11V5M5.5 7.5 8 5l2.5 2.5" /></Svg>
);
export const DownloadIcon = (p: P) => (
  <Svg {...p}><path d="M8 2.5v7M5 7l3 3 3-3M3 13h10" /></Svg>
);
export const GearIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 2.2v1.3M8 12.5v1.3M13.8 8h-1.3M3.5 8H2.2M11.9 4.1l-.9.9M5 11l-.9.9M11.9 11.9l-.9-.9M5 5l-.9-.9" />
    <circle cx="8" cy="8" r="5" opacity=".35" />
  </Svg>
);
export const BellIcon = (p: P) => (
  <Svg {...p}><path d="M4.5 6.5a3.5 3.5 0 1 1 7 0c0 3 1 4 1 4h-9s1-1 1-4Z" /><path d="M6.8 13a1.4 1.4 0 0 0 2.4 0" /></Svg>
);
export const SendIcon = (p: P) => <Svg {...p}><path d="M14 2 7 9M14 2l-4.5 12L7 9 2 6.5z" /></Svg>;
export const HelpIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="8" r="6" /><path d="M6.4 6.3a1.7 1.7 0 1 1 1.9 1.9v1.1M8.3 11.6h.01" /></Svg>
);
export const CollapseIcon = (p: P) => (
  <Svg {...p}><path d="M2 4h12M2 8h7M2 12h12M13.5 6.5 11 8l2.5 1.5" /></Svg>
);
export const AtIcon = (p: P) => (
  <Svg {...p}><circle cx="8" cy="8" r="2.4" /><path d="M10.4 8v1.1a1.9 1.9 0 0 0 3.6-.9A6 6 0 1 0 11 13" /></Svg>
);
export const HashIcon = (p: P) => (
  <Svg {...p}><path d="M6.2 2.5 5 13.5M11 2.5 9.8 13.5M2.8 5.8h11M2.2 10.2h11" /></Svg>
);
export const DollarIcon = (p: P) => (
  <Svg {...p}><path d="M8 2v12M10.8 4.6H6.7a1.9 1.9 0 0 0 0 3.8h2.6a1.9 1.9 0 0 1 0 3.8H5" /></Svg>
);
export const BoardIcon = (p: P) => (
  <Svg {...p}><rect x="2" y="3" width="4.5" height="10" rx="1" /><rect x="9.5" y="3" width="4.5" height="6.5" rx="1" /></Svg>
);
export const GridIcon = (p: P) => (
  <Svg {...p}><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" /><path d="M2.5 6.5h11M6.5 6.5v7" /></Svg>
);
export const SearchIcon = (p: P) => (
  <Svg {...p}><circle cx="7.2" cy="7.2" r="4.4" /><path d="M10.5 10.5 13.5 13.5" /></Svg>
);
export const SparkleIcon = (p: P) => (
  <Svg {...p}><path d="M8 2.5 9.3 6l3.5 1.3L9.3 8.6 8 12.1 6.7 8.6 3.2 7.3 6.7 6z" /></Svg>
);
export const FilterIcon = (p: P) => <Svg {...p}><path d="M2.5 4h11L9.2 8.6v4.1L6.8 11.4V8.6z" /></Svg>;
export const SortIcon = (p: P) => (
  <Svg {...p}><path d="M4.5 3v10M2.5 11l2 2 2-2M11.5 13V3M9.5 5l2-2 2 2" /></Svg>
);
export const GroupIcon = (p: P) => (
  <Svg {...p}><rect x="2.5" y="3" width="11" height="3.2" rx="1" /><rect x="2.5" y="9.8" width="11" height="3.2" rx="1" /></Svg>
);
export const FlagIcon = (p: P) => (
  <Svg {...p}><path d="M4 14V2.8h8l-1.6 2.6L12 8H4" /></Svg>
);
export const BarsIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" className={p.className} fill="currentColor" aria-hidden>
    <rect x="2.5" y="9" width="2.4" height="4.5" rx=".6" />
    <rect x="6.8" y="6" width="2.4" height="7.5" rx=".6" />
    <rect x="11.1" y="3" width="2.4" height="10.5" rx=".6" />
  </svg>
);
