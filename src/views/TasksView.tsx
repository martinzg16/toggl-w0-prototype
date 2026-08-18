import { useState } from "react";
import { fmt } from "../week/data";
import type { App } from "../store";
import { CheckIcon, PlusIcon } from "../week/Icons";

export function TasksView({ app }: { app: App }) {
  const { s } = app;
  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    app.addTask(draft.trim());
    setDraft("");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 text-primary">Tasks</h1>
        <p className="text-p2 text-secondary">{s.projectName}</p>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task"
          className="min-w-0 flex-1 rounded border border-primary bg-primary px-3 py-2 text-p1 text-primary outline-none placeholder:text-secondary focus-visible:ring-2 focus-visible:ring-bg-accent"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded bg-accent px-3 py-2 text-p1 font-medium text-inverted outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
        >
          <PlusIcon className="size-3.5" /> Add
        </button>
      </form>

      {s.tasks.length === 0 && (
        <div className="flex flex-col gap-1 rounded border border-primary px-5 py-6">
          <p className="text-p1 text-primary">No tasks yet.</p>
          <p className="max-w-[52ch] text-p2 text-secondary">
            Break {s.projectName} into the pieces you will actually bill for. Each one can carry its own
            estimate, so by the end of the week you learn which kind of work you underprice.
          </p>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-primary border-y border-primary empty:hidden">
        {s.tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5">
            <button
              type="button"
              onClick={() => app.toggleTask(t.id)}
              aria-pressed={t.done}
              aria-label={`Mark ${t.name} ${t.done ? "not done" : "done"}`}
              className={`flex size-5 shrink-0 flex-center rounded-sm border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bg-accent ${
                t.done ? "border-accent bg-accent text-inverted" : "border-primary hover:bg-primary-hover"
              }`}
            >
              {t.done && <CheckIcon className="size-3" />}
            </button>
            <span
              className={`min-w-0 flex-1 truncate text-p1 ${t.done ? "text-secondary line-through" : "text-primary"}`}
            >
              {t.name}
            </span>
            {t.estimate != null && (
              <span className="shrink-0 text-p2 text-secondary tabular-nums">est. {fmt(t.estimate)}</span>
            )}
            <button
              type="button"
              onClick={() => {
                app.startTimer(t.name);
                app.setView("timer");
              }}
              className="shrink-0 rounded bg-secondary px-2 py-1 text-h6 font-semibold tracking-wide text-secondary outline-none transition-colors hover:bg-secondary-hover focus-visible:ring-2 focus-visible:ring-bg-accent"
            >
              START
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
