import { BAND_END, BAND_START, WEEK, fmt, minutesOf, type Segment } from "./data";
import type { WeekState } from "./logic";

const span = BAND_END - BAND_START;
const pct = (mins: number) => ((mins - BAND_START) / span) * 100;

interface Props {
  state: WeekState;
  onClaim: (id: string) => void;
  focused: string | null;
  onFocus: (id: string | null) => void;
}

export function Ribbon({ state, onClaim, focused, onFocus }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <div className="w-16 shrink-0" />
        <div className="relative h-4 flex-1">
          {[9, 12, 15, 18].map((hr) => {
            const last = hr === 18;
            return (
              <span
                key={hr}
                className={`absolute text-h6 font-semibold tracking-wide text-tertiary tabular-nums ${
                  last ? "-translate-x-full" : "-translate-x-1/2"
                } ${hr === 12 || last ? "" : "hidden sm:inline"}`}
                style={{ left: `${pct(hr * 60)}%` }}
              >
                {hr}:00
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        {WEEK.map((day, i) => {
          const isPast = i <= state.today;
          const isToday = i === state.today;
          const workLeft = pct(day.workStart);
          const workRight = pct(day.workEnd);

          return (
            <div key={day.weekday} className="flex items-stretch">
              <div className="flex w-16 shrink-0 items-center gap-1.5 py-1">
                <span
                  className={`text-p2 font-medium tabular-nums ${
                    isToday ? "text-primary" : isPast ? "text-secondary" : "text-tertiary"
                  }`}
                >
                  {day.weekday}
                </span>
                <span className={`text-p2 tabular-nums ${isToday ? "text-primary" : "text-tertiary"}`}>
                  {day.date}
                </span>
              </div>

              <div className="relative flex-1 py-1">
                {/* the working window: the denominator, drawn as ground */}
                <div
                  className={`absolute inset-y-1 rounded-sm ${
                    isPast ? "bg-secondary-hover" : "bg-secondary"
                  }`}
                  style={{ left: `${workLeft}%`, width: `${workRight - workLeft}%` }}
                />

                {isPast &&
                  day.segments.map((seg) => (
                    <Block
                      key={seg.id}
                      seg={seg}
                      claimed={state.claimed.has(seg.id)}
                      focused={focused === seg.id}
                      onClaim={onClaim}
                      onFocus={onFocus}
                    />
                  ))}

                {isToday && <div className="absolute inset-y-0 w-px bg-accent" style={{ left: `${workRight}%` }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Block({
  seg,
  claimed,
  focused,
  onClaim,
  onFocus,
}: {
  seg: Segment;
  claimed: boolean;
  focused: boolean;
  onClaim: (id: string) => void;
  onFocus: (id: string | null) => void;
}) {
  const solid = seg.kind === "tracked" || claimed;
  const left = pct(seg.start);
  const width = pct(seg.end) - pct(BAND_START) - (pct(seg.start) - pct(BAND_START));

  const shared = "absolute inset-y-1 rounded-sm transition-all duration-150";
  const style = { left: `${left}%`, width: `${width}%` };

  if (solid) {
    return (
      <div
        className={`${shared} bg-data ${claimed ? "ring-2 ring-accent" : ""}`}
        style={style}
        title={`${seg.label} · ${fmt(minutesOf(seg))}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClaim(seg.id)}
      onMouseEnter={() => onFocus(seg.id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(seg.id)}
      onBlur={() => onFocus(null)}
      aria-label={`Log ${seg.label}, ${fmt(minutesOf(seg))}, from ${seg.source}`}
      className={`${shared} cursor-pointer border border-dashed border-data-secondary outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-accent ${
        focused ? "brightness-95" : ""
      }`}
      style={{
        ...style,
        backgroundImage:
          "repeating-linear-gradient(135deg, rgb(var(--background-data) / 22%) 0 3px, transparent 3px 7px)",
      }}
    />
  );
}
