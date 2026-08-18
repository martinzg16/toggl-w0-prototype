/**
 * Scaffold smoke test. Replace with the real prototype in block 4.
 * Its only job: prove the Toggl token layer, fonts and Pages deploy work.
 */
export default function App() {
  return (
    <div className="flex h-screen">
      {/* icon rail — 48px, bg-tertiary */}
      <div className="flex w-12 shrink-0 flex-col items-center bg-tertiary py-4">
        <div className="size-6 rounded-full bg-brand-focus" />
      </div>

      {/* label column — 200px */}
      <aside className="flex w-50 shrink-0 flex-col gap-1 border-r border-primary bg-primary p-3">
        <div className="px-2 text-h6 font-semibold tracking-wide text-secondary">TRACK</div>
        <button className="flex items-center gap-1 rounded px-2 py-1.5 text-left text-p1 text-secondary transition-colors hover:bg-primary-hover hover:text-primary">
          Timer
        </button>
        <div className="mt-3 px-2 text-h6 font-semibold tracking-wide text-secondary">ANALYZE</div>
        <button className="flex items-center gap-1 rounded px-2 py-1.5 text-left text-p1 text-secondary transition-colors hover:bg-primary-hover hover:text-primary">
          Reports
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-primary">
        <div className="flex h-16 items-center justify-between border-b border-primary px-4">
          <span className="text-h3 font-semibold text-primary">Scaffold ready</span>
          <button className="rounded-full bg-accent px-4 py-2 text-p1 font-medium text-inverted">
            Start timer
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-primary bg-secondary px-4 py-2 text-p2 text-secondary">
          Toolbar strip · <code>bg-secondary</code>
        </div>

        <div className="grid gap-4 p-6">
          <div className="rounded border border-primary bg-primary p-4 shadow-raised-20">
            <div className="text-p1 text-primary">Card on background-primary</div>
            <div className="text-p2 text-secondary">Meta row, text-p2 / text-secondary</div>
          </div>

          <div className="rounded p-4" style={{ background: "rgb(var(--background-accent) / 10%)" }}>
            <span className="text-p1 text-accent">Accent tint at 10%</span>
          </div>

          <div className="font-display text-h2 text-primary">GT Haptik display</div>

          <div className="flex gap-2">
            {["sm 4px", "8px", "md 20px", "lg 32px"].map((label, i) => (
              <div
                key={label}
                className={`flex-center flex h-14 flex-1 bg-secondary text-p2 text-secondary ${
                  ["rounded-sm", "rounded", "rounded-md", "rounded-lg"][i]
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
