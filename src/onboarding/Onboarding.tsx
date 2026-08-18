import { useState } from "react";
import { IMPORTED_PROJECTS, type Intent, type Origin } from "../store";
import { HOUR_PRESETS, KINDS, previewTracked, readWeek, TONE_CLASS, type Kind } from "../lib/model";
import { PROJECT } from "../week/data";
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
    projectKind: Kind;
    paceSkipped: boolean;
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [calendar, setCalendar] = useState(false);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");

  const [pickedId, setPickedId] = useState<string | null>(null);
  /** explicit, so nothing is selected on arrival */
  const [wantsNew, setWantsNew] = useState(false);
  const [kind, setKind] = useState<Kind>("fixed");
  const imported = origin === "imported";
  const picked = IMPORTED_PROJECTS.find((x) => x.id === pickedId) ?? null;
  const suggested = picked ? Math.round(picked.avgMinutes / 60) : null;
  const total = 5;
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  /** Nothing here is the price of entry. Skipping lands in the app with the
   *  defaults Toggl's own copy promises you can set later from Settings. */
  const skipSetup = () =>
    onDone({
      origin: origin ?? "cold",
      intent: intent ?? "track",
      calendarConnected: calendar,
      projectName: name.trim() || "My first project",
      projectEstimate: hours.trim() ? Math.max(1, Number(hours)) * 60 : 0,
      projectKind: kind,
      paceSkipped: !hours.trim(),
    });

  return (
    <div
      className="flex min-h-dvh flex-col items-center bg-secondary px-4 py-6"
      style={PROJECT.colour as React.CSSProperties}
    >
      <div className="my-auto flex w-full max-w-125 flex-col gap-3">
      {/* capped so the actions are always reachable, however short the window */}
      <div className="flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-md border border-primary bg-primary shadow-raised-20">
        {step === 0 && (
          <div className="flex flex-col items-center gap-3 overflow-y-auto px-8 py-10 text-center">
            <span className="mb-2 flex size-12 flex-center rounded-full bg-brand-focus text-brand-toggl">
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M8 2.5v5" />
                <path d="M12.2 4.2a6 6 0 1 1-8.4 0" />
              </svg>
            </span>
            <h1 className="font-display text-h2 text-primary">Welcome to Toggl 2.0</h1>
            <p className="text-p1 text-secondary">Track, plan and manage your work in one place.</p>
            <Primary onClick={next} className="mt-4 w-full">Get started</Primary>
            <button
              type="button"
              onClick={skipSetup}
              className="rounded text-p2 text-tertiary underline-offset-2 outline-none transition-colors hover:text-secondary hover:underline focus-visible:ring-2 focus-visible:ring-bg-accent"
            >
              Skip setup
            </button>
          </div>
        )}

        {step === 1 && (
          <Step
            step={step}
            total={total}
            onSkipSetup={skipSetup}
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
            step={step}
            total={total}
            onSkipSetup={skipSetup}
            title="Bring your existing data with you"
            sub="If you have been tracking in Toggl Track, your projects and history come across and this week starts with something behind it."
            onBack={back}
            onNext={next}
            nextDisabled={!origin}
          >
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setOrigin("imported")}
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
                  setPickedId(null);
                  setWantsNew(false);
                  setName("");
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
                {IMPORTED_PROJECTS.length} projects and their history imported.
              </p>
            )}
          </Step>
        )}

        {step === 3 && (
          <Step
            step={step}
            total={total}
            onSkipSetup={skipSetup}
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

        {step === 4 && imported && (
          <Step
            step={step}
            total={total}
            onSkipSetup={skipSetup}
            title="Which project are you picking up?"
            sub="These came across from Toggl Track. Start with the one you are working on this week."
            onBack={back}
            onNext={next}
            nextDisabled={!name.trim()}
          >
            <div className="flex flex-col gap-2">
              {IMPORTED_PROJECTS.map((proj) => {
                const on = pickedId === proj.id;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      setPickedId(proj.id);
                      setWantsNew(false);
                      setName(proj.name);
                      setHours(String(Math.round(proj.avgMinutes / 60)));
                    }}
                    aria-pressed={on}
                    className={`flex items-center gap-3 rounded border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                      on ? "border-accent bg-muted" : "border-primary hover:bg-primary-hover"
                    }`}
                  >
                    <span className="size-2.5 shrink-0 rounded-full bg-data" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-p1 font-medium text-primary">{proj.name}</span>
                      <span className="block truncate text-p2 text-secondary">{proj.client}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-p2 font-medium text-primary tabular-nums">
                        {Math.round(proj.avgMinutes / 60)}h / week
                      </span>
                      <span className="block text-h6 font-semibold tracking-wide text-secondary">
                        OVER {proj.weeks} WEEKS
                      </span>
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setPickedId(null);
                  setWantsNew(true);
                  setName("");
                  setHours("");
                }}
                aria-pressed={wantsNew}
                className={`rounded border border-dashed px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                  wantsNew ? "border-accent bg-muted" : "border-primary hover:bg-primary-hover"
                }`}
              >
                <span className="block text-p1 font-medium text-primary">Something new</span>
                <span className="block text-p2 text-secondary">A project that is not in your history yet</span>
              </button>

              {wantsNew && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  placeholder="Client or piece of work"
                  className="rounded border border-primary bg-primary px-3 py-2 text-p1 text-primary outline-none placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-bg-accent"
                />
              )}
            </div>
          </Step>
        )}

        {step === 4 && !imported && (
          <Step
            step={step}
            total={total}
            onSkipSetup={skipSetup}
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
            step={step}
            total={total}
            onSkipSetup={skipSetup}
            title={picked ? `How much of your week is ${picked.name}?` : `How much of your week is ${name}?`}
            sub={
              picked
                ? `${picked.name} averaged ${suggested}h a week over ${picked.weeks} weeks in Toggl Track. Confirm it or change it.`
                : "Set the pace you intend to keep. It is what makes your first week readable — you can change it any time."
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
                projectKind: kind,
                paceSkipped: false,
              })
            }
            onSkip={() =>
              onDone({
                origin: origin ?? "cold",
                intent: intent ?? "track",
                calendarConnected: calendar,
                projectName: name.trim() || "My first project",
                projectEstimate: 0,
                projectKind: kind,
                paceSkipped: true,
              })
            }
            nextLabel="Start tracking"
          >
            {/* DOM order is question -> payoff -> actions on purpose: on a narrow
                viewport the reason must sit above Continue, not below it. */}
            <fieldset className="flex flex-col gap-2">
              <legend className="pb-1.5 text-h6 font-semibold tracking-wide text-secondary">
                WHAT KIND OF WORK IS THIS?
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {KINDS.map((k) => {
                  const on = kind === k.id;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKind(k.id)}
                      aria-pressed={on}
                      className={`rounded border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                        on ? "border-accent bg-muted" : "border-primary hover:bg-primary-hover"
                      }`}
                    >
                      <span className="block text-p1 font-medium text-primary">{k.label}</span>
                      <span className="block text-p2 leading-snug text-secondary">{k.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-h6 font-semibold tracking-wide text-secondary">HOURS A WEEK</span>
              <span className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={hours}
                  autoFocus
                  placeholder="—"
                  onChange={(e) => setHours(e.target.value)}
                  aria-label="Hours a week"
                  className="w-24 rounded border border-primary bg-primary px-3 py-2 text-h3 text-primary tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-bg-accent"
                />
                {HOUR_PRESETS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(String(h))}
                    className={`rounded px-3 py-1.5 text-p2 font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                      hours === String(h) ? "bg-accent text-inverted" : "bg-secondary text-secondary hover:bg-secondary-hover"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </span>
            </label>

            <Payoff kind={kind} hours={Number(hours) || 0} name={name.trim() || "your first project"} />
          </Step>
        )}
      </div>

      {step === 5 && (
        <p className="text-p2 text-secondary">
          This step is the change. Everything above it is Toggl's onboarding as it ships today —
          {picked
            ? ` and because ${picked.name} has ${picked.weeks} weeks behind it, the number is measured rather than guessed.`
            : " with no history behind this project, a guess is the only baseline that can exist."}
        </p>
      )}
      </div>
    </div>
  );
}

function Step({
  title, sub, children, onBack, onNext, onSkip, onSkipSetup,
  nextLabel = "Continue", nextDisabled, step, total,
}: {
  title: string; sub: string; children: React.ReactNode;
  onBack: () => void; onNext: () => void; onSkip?: () => void; onSkipSetup?: () => void;
  nextLabel?: string; nextDisabled?: boolean; step: number; total: number;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      {/* only this scrolls; the actions below never leave the viewport */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 pt-8 pb-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-h6 font-semibold tracking-wide text-secondary">
            STEP {step} OF {total}
          </p>
          <h1 className="text-balance font-display text-h3 leading-tight text-primary">{title}</h1>
          <p className="text-p1 text-secondary">{sub}</p>
        </div>
        {children}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-primary px-8 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded px-3 py-2 text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSkip ?? onNext}
          className="ml-auto rounded px-3 py-2 text-p1 text-secondary outline-none transition-colors hover:bg-primary-hover hover:text-primary focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          Skip for now
        </button>
        <Primary onClick={onNext} disabled={nextDisabled}>{nextLabel}</Primary>
        {onSkipSetup && (
          <button
            type="button"
            onClick={onSkipSetup}
            className="basis-full rounded text-left text-p2 text-tertiary underline-offset-2 outline-none transition-colors hover:text-secondary hover:underline focus-visible:ring-2 focus-visible:ring-bg-accent"
          >
            Skip setup — you can add all of this later from Settings
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The payoff, on the same screen as the question. This is the entire
 * justification for adding a step to onboarding: the field shows what it buys
 * in situ instead of promising it later.
 */
function Payoff({ kind, hours, name }: { kind: Kind; hours: number; name: string }) {
  if (!hours) {
    return (
      <div className="rounded border border-dashed border-primary bg-secondary px-4 py-3">
        <p className="text-p2 text-secondary">
          Pick a number and you will see the reading it buys you on Friday.
        </p>
      </div>
    );
  }
  const tracked = previewTracked(kind, hours);
  const reading = readWeek(kind, hours, tracked);
  const tone = TONE_CLASS[reading.tone];

  return (
    <div className="flex flex-col gap-2 rounded border border-primary bg-muted px-4 py-3">
      <p className="text-h6 font-semibold tracking-wide text-secondary">EXAMPLE · YOUR FRIDAY</p>
      <p className="text-p2 text-secondary tabular-nums">
        {name} · planned {hours}h · tracked {tracked}h
      </p>
      <p className={`text-p1 font-medium ${tone.text}`}>{reading.headline}</p>
      <p className="text-p2 leading-snug text-secondary">{reading.detail}</p>
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
