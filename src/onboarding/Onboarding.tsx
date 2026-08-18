import { useState } from "react";
import { IMPORT_SUGGESTION, type Intent, type Origin } from "../store";
import { CalendarIcon, CheckIcon } from "../week/Icons";

/**
 * Toggl's real onboarding, reproduced from its production strings — welcome,
 * intent, calendar, first project — with one thing added at the step that
 * already exists: an estimate. That single field is the whole intervention.
 */
export function Onboarding({
  onDone,
}: {
  onDone: (o: {
    origin: Origin;
    intent: Intent;
    calendarConnected: boolean;
    projectName: string;
    projectEstimate: number;
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [calendar, setCalendar] = useState(false);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");

  const imported = origin === "imported";
  const suggested = Math.round(IMPORT_SUGGESTION.minutes / 60);
  const total = 5;
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-125 rounded-md border border-primary bg-primary px-8 py-10 shadow-raised-20">
        {step > 0 && (
          <p className="mb-6 text-h6 font-semibold tracking-wide text-secondary">
            STEP {step} OF {total}
          </p>
        )}

        {step === 0 && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="mb-2 flex size-12 flex-center rounded-full bg-brand-focus text-brand-toggl">
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M8 2.5v5" />
                <path d="M12.2 4.2a6 6 0 1 1-8.4 0" />
              </svg>
            </span>
            <h1 className="font-display text-h2 text-primary">Welcome to Toggl 2.0</h1>
            <p className="text-p1 text-secondary">Track, plan and manage your work in one place.</p>
            <Primary onClick={next} className="mt-4 w-full">Get started</Primary>
          </div>
        )}

        {step === 1 && (
          <Step
            title="What will you mainly use Toggl for?"
            sub="We'll tailor your first experience to help you get there."
            onBack={back}
            onNext={next}
            nextDisabled={!intent}
          >
            <div className="flex flex-col gap-2">
              {(
                [
                  ["track", "See where time goes", "Log hours and spot where they really go"],
                  ["plan", "Plan and assign work", "Map out tasks, then track against the plan"],
                  ["projects", "Keep projects on track", "Watch progress, profitability, and capacity in one place"],
                ] as const
              ).map(([id, t, d]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIntent(id)}
                  aria-pressed={intent === id}
                  className={`rounded border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                    intent === id
                      ? "border-accent bg-muted"
                      : "border-primary hover:bg-primary-hover"
                  }`}
                >
                  <span className="block text-p1 font-medium text-primary">{t}</span>
                  <span className="block text-p2 text-secondary">{d}</span>
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step
            title="Bring your existing data with you"
            sub="If you have been tracking in Toggl Track, your projects and history come across and this week starts with something behind it."
            onBack={back}
            onNext={next}
            nextDisabled={!origin}
          >
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrigin("imported");
                  setHours(String(suggested));
                }}
                aria-pressed={origin === "imported"}
                className={`rounded border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                  origin === "imported" ? "border-accent bg-muted" : "border-primary hover:bg-primary-hover"
                }`}
              >
                <span className="block text-p1 font-medium text-primary">Import from Toggl Track</span>
                <span className="block text-p2 text-secondary">
                  Projects, clients and time history come with you
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrigin("cold");
                  setHours("");
                }}
                aria-pressed={origin === "cold"}
                className={`rounded border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                  origin === "cold" ? "border-accent bg-muted" : "border-primary hover:bg-primary-hover"
                }`}
              >
                <span className="block text-p1 font-medium text-primary">I'm starting fresh</span>
                <span className="block text-p2 text-secondary">Nothing to bring across</span>
              </button>
            </div>
            {origin === "imported" && (
              <p className="flex items-center gap-2 text-p2 text-success">
                <CheckIcon className="size-3.5 shrink-0" />
                {IMPORT_SUGGESTION.basis} imported.
              </p>
            )}
          </Step>
        )}

        {step === 3 && (
          <Step
            title="Log time from your meetings and events"
            sub="Connect your calendar and your meetings and events are ready to track."
            onBack={back}
            onNext={next}
            nextLabel={calendar ? "Continue" : "Skip for now"}
          >
            <div className="flex flex-col gap-2">
              {["Google Calendar", "Outlook Calendar"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCalendar(true)}
                  className="flex items-center justify-between rounded border border-primary px-4 py-3 outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
                >
                  <span className="flex items-center gap-2 text-p1 text-primary">
                    <CalendarIcon className="text-secondary" />
                    {p}
                  </span>
                  {calendar && p === "Google Calendar" ? (
                    <span className="flex items-center gap-1 text-p2 font-medium text-success">
                      <CheckIcon className="size-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="text-p2 font-medium text-accent">Connect</span>
                  )}
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step
            title="Create your first project"
            sub="Projects keep your work and time logs organized."
            onBack={back}
            onNext={next}
            nextDisabled={!name.trim()}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-h6 font-semibold tracking-wide text-secondary">PROJECT NAME</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Client or piece of work"
                className="rounded border border-primary bg-primary px-3 py-2 text-p1 text-primary outline-none placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-bg-accent"
              />
            </label>
          </Step>
        )}

        {step === 5 && (
          <Step
            title={
              imported
                ? `${suggested} hours a week for ${name}?`
                : `How long do you think ${name} will take?`
            }
            sub={
              imported
                ? `Work like this took about ${suggested} hours a week across your ${IMPORT_SUGGESTION.basis}. Adjust it if this one is different.`
                : "A rough guess is enough. It gives your first week something to measure against — you can change it any time."
            }
            onBack={back}
            nextDisabled={!hours.trim()}
            onNext={() =>
              onDone({
                origin: origin ?? "cold",
                intent: intent ?? "track",
                calendarConnected: calendar,
                projectName: name.trim() || "My first project",
                projectEstimate: Math.max(1, Number(hours) || 1) * 60,
              })
            }
            nextLabel="Start tracking"
          >
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={hours}
                  autoFocus
                  placeholder="—"
                  onChange={(e) => setHours(e.target.value)}
                  className="w-24 rounded border border-primary bg-primary px-3 py-2 text-h3 text-primary tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-bg-accent"
                />
                <span className="text-p1 text-secondary">hours a week</span>
              </label>
              <div className="flex gap-1.5">
                {[5, 10, 20, 40].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(String(h))}
                    className={`rounded px-3 py-1.5 text-p2 font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                      hours === String(h)
                        ? "bg-accent text-inverted"
                        : "bg-secondary text-secondary hover:bg-secondary-hover"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </Step>
        )}
      </div>

      {step === 5 && (
        <p className="mt-4 max-w-125 text-p2 text-secondary">
          This step is the change. Everything above it is Toggl's onboarding as it ships today —
          {imported
            ? " and with a history imported, the number is suggested rather than asked."
            : " with nothing imported, a guess is the only baseline that can exist."}
        </p>
      )}
    </div>
  );
}

function Step({
  title, sub, children, onBack, onNext, nextLabel = "Continue", nextDisabled,
}: {
  title: string; sub: string; children: React.ReactNode;
  onBack: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-balance font-display text-h3 leading-tight text-primary">{title}</h1>
        <p className="text-p1 text-secondary">{sub}</p>
      </div>
      {children}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded px-3 py-2 text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          Back
        </button>
        <Primary onClick={onNext} disabled={nextDisabled} className="ml-auto">{nextLabel}</Primary>
      </div>
    </div>
  );
}

function Primary({
  children, className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`rounded bg-accent px-4 py-2 text-p1 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent disabled:cursor-not-allowed disabled:bg-accent-disabled ${className}`}
    >
      {children}
    </button>
  );
}
