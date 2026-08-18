# Declared Pace — product spec

**Surface:** Toggl Focus, individual user, week one.
**Status:** working prototype at `prototype/`, ready to fold into a larger build.
**Audience for this document:** an engineer or agent implementing this without
having been in the conversation that produced it.

Read section 1 before section 4. The specification is easy to build and easy to
build *wrong*, and every wrong version comes from skipping the reasoning.

---

## 1. Why this exists

### 1.1 The constraint

The brief asks for one improvement to the individual user experience whose value
lands inside **week one** (W0 retention: a new user comes back and gets value
within seven days of signing up). It is an explicit hard constraint, not a theme.
Pain points that only materialise months into a client relationship are out of
scope unless the solution demonstrably reaches week one.

### 1.2 The wound, verified in the product

Toggl Focus's value proposition is **retrospective**. Almost every surface that
produces insight is gated on accumulated history. This is not an inference — it
is written in the product's own strings (production bundle `index-FbQ6MDcP.js`,
plus a cold signup recording):

| Surface | What it says today |
|---|---|
| Reports empty state | *"Get insights from day one!"* |
| Estimates | *"No history yet. We'll suggest an estimate **after a few periods**."* |
| Estimate vs actual | *"**After a few periods**, we'll check this estimate against your tracked time."* |
| Margin | *"Margin trend will populate once **periods accumulate**…"* |
| Periods | *"Periods will appear here as time is logged"* |
| Profitability | *"Nothing to chart yet"* |
| KPIs | *"no complete weeks yet"* · *"no complete days yet"* |
| Workload (solo user) | *"One person's bars can't show balance"* |
| Utilization (solo user) | *"Utilization is measured per person"* |
| Projects footer | *"Once **your team** tracks, **or you import history**, this dashboard shows real progress, budget…"* |

The first row contradicts every row beneath it. And when a solo user reaches the
surfaces that admit the gap, the two escapes the product offers — *invite your
team*, *import history* — are both unavailable to a freelancer starting from zero.

The trial modal shown immediately after onboarding compounds it. It celebrates
unlocking: (1) billable rates, labour cost and profitability, (2) timeline,
milestones and **unlimited teammates**, (3) **utilization and workload reports**.
For a freelancer who has just signed up alone and tracked nothing, (2) and (3)
are team features and (1) needs configured cost rates *plus* history.

**Therefore:**

> The product only knows how to talk about accumulated value, and in week zero
> there is no accumulation. Week one is currently all cost and a promise.

### 1.3 The move

If the product has accumulated nothing, the first insight must come from a number
the user **declares**, not one the product **accumulates**.

At project creation we ask two things — what kind of work this is, and how many
hours a week it should get. That declaration is a **substitute for history**. It
makes day one comparable, and it makes a verdict exist on Friday of week one that
no competitor can show without months of data, because none of them ask.

### 1.4 The corollary that most implementations get wrong

**The day-zero number will be wrong. That is the mechanism, not a defect.**

A freelancer does not know on Monday how long a new job will take. The job of
week one is not to *hit* the estimate — it is to **calibrate** it. Every design
decision downstream follows from this:

- The Friday screen's primary action is *update the number*, not *do better*.
- Being over is information, not failure.
- A deviation the user has looked at and consciously kept is **closed**, and must
  not be raised again in the same view.

Get this wrong and the feature becomes a nagging productivity scold. Time-tracking
products that make people feel behind teach them to stop opening the app — which
is churn wearing a different name, and it lands inside the same seven days we are
trying to survive.

---

## 2. What was deliberately rejected

An implementer will be tempted back toward these. Each was considered and cut for
a stated reason.

| Rejected | Why |
|---|---|
| **"Review your day" / categorise logged time** | The saturated answer. The hiring page warns that several candidates converged on it. Worse, Toggl already ships **Activity timeline**, **Auto tracker**, **Smart suggestions** and **Idle detection** — this competes with shipped features. |
| **Redesigning onboarding itself** | A minute-one problem. It improves activation, not return. This spec *inserts into* onboarding; it does not fix onboarding. |
| **Invoicing / billable reports** | Value lands at month end. Fails the W0 constraint. |
| **Profitability or rate analysis** | Needs months of data. Fails the W0 constraint. |
| **Scope-creep alerts for contractors** | Needs a baseline. Reinstated *only* because this spec creates the baseline on day zero. |
| **Mobile quick-start / widgets** | Still depends on remembering. Does not address why the log decays. |
| **A week-one dashboard** | Charts are how you make a no-history week look empty. See §4.2 — the total is deliberately demoted. |

**Positioning in one line:** this does not improve *capture*. It creates the
reference against which captured time means something.

---

## 3. Users and the scene

Two personas from the brief, both solo, both **on web** (the recon found Toggl's
friction-detection engine, *Navigator*, is fed by desktop-client signals and its
resolutions are all "turn on a desktop feature" — so the web user in week one is
the underserved case).

- **Freelancer** — several clients, rates and deadlines at once; context-switches
  all day. Fails at: forgetting to track, reconstructing the day, estimating
  without history, not knowing which client is profitable, overcommitting.
- **Independent contractor** — embedded in a client org, longer engagements.
  Needs to demonstrate value, protect contractual boundaries, justify rate and
  renewal. Fails at: scope creep, untracked collaboration time, proving output
  remotely.

**Physical scene:** desktop browser, mid-workday, attention elsewhere, wanting to
get past onboarding into the product. **Every field added is paid for in
abandonment.** This is the single largest risk in the spec and drives §4.1.

---

## 4. Specification

Two surfaces. They are one feature: the second is the first one's payoff, and
neither is worth building alone.

### 4.1 Surface A — the commitment step

**Where:** inside the existing onboarding, immediately after *"Create your first
project"*, before the closing step. Real flow order confirmed by recording:
Signup → Welcome/Intent → Calendar → **Create your first project** → *[new step]*
→ "You're all set" → trial modal → guided tour.

**Ask exactly two things:**

1. **Kind of work** — `fixed` | `retainer` | `personal`. Pre-selected to `fixed`.
2. **Hours a week** — presets `5 / 10 / 20 / 40`, plus a free numeric input
   (1–80). No default.

Hours per week, not a total budget and not money. Rationale: a *pace* can be read
on every day of week one ("6 of 10 so far"); a total budget reads as 5% consumed
and says nothing until the job is nearly done. Money (quoted fee + hourly rate)
is strictly more powerful — it yields margin on day one — but it is two more
fields, it is sensitive, and the rate is already collected elsewhere in Toggl.
**Money is the correct v2**, once this step has earned its place.

**Non-negotiable interaction rules:**

- **The payoff is on the same screen.** A panel shows the Friday reading the
  chosen answer buys, updating live. This is the whole justification for adding a
  step to onboarding: the field demonstrates its value *in situ* rather than
  promising it. Do not move this to a later screen, a tooltip, or a help link.
- **On narrow viewports the payoff must render *above* the actions.** The card is
  a grid whose DOM order is question → payoff → actions specifically so the user
  cannot press Continue without having passed the reason. Getting this wrong
  silently destroys the step's justification on mobile.
- **Skip must work and must not be punished.** If the step cannot stand up
  without being compulsory, it does not stand up. The following screen
  acknowledges the skip neutrally and states the number can be set later.
- **Continue is disabled until hours are chosen.** Skip is the escape, not a
  half-filled submit.
- The preview panel is labelled **Example**. It is synthetic, and must say so.

**Preview scenarios.** Each kind previews the deviation *that actually threatens
that kind of work*, so the user sees the reading they will get, not a generic one:

| Kind | Preview ratio | Direction | Why this direction |
|---|---|---|---|
| `fixed` | ×1.6 | over | Overrun is what eats a fixed fee |
| `retainer` | ×0.65 | under | Under-delivery is what renewals die of |
| `personal` | ×1.25 | over | Shown as neutral — proves the product stays quiet when nothing is at stake |

### 4.2 Surface B — the Friday verdict

**Where:** a first-class destination in the app nav, labelled **"This week"**.

Deliberately **not** inside Reports. Reports is the surface that currently tells a
solo user *"One person's bars can't show balance"*. Week one needs a destination
that works with no history and no teammates; putting the verdict inside the
surface that apologises for having neither would inherit the problem.

**Composition, top to bottom:**

1. Date, then `Your first week`.
2. **A quiet total** — *"You planned 34h across 3 projects and tracked 38.5h."*
3. **A loud verdict that contradicts the total** — *"4.5h over in total — which is
   not the story. Acme Redesign is."*

   This inversion is the product thesis rendered as a sentence. The total is
   almost always unremarkable, and reading the total is exactly how a freelancer
   concludes a bad week was fine. The composition is the story. **Do not promote
   the total to a hero metric, and do not add charts.** When nothing is open, the
   line becomes *"Nothing left open. That's the whole report."*
4. **One row per project** — a list with hairline separators. **Not cards.** Each
   row carries: identity (colour dot, name, client, kind chip), two bars (planned
   / tracked, shared scale), the reading, and the calibration controls.
5. **An honest caveat** — *"Thursday only has 1.2h logged across everything. If
   that's a gap rather than a light day, two of these readings move."* Week-one
   tracking has holes; a verdict that pretends otherwise is lying. This line also
   marks the seam where a day-reconstruction flow would attach later.
6. **The thesis, stated once, small** — *"None of this needed history. It's the
   number you gave each project on day one, checked against what you actually
   tracked."*

**The calibration loop — the retention mechanic.** Every flagged project offers
two real actions:

- **`Make it {tracked}h a week`** — rewrites the plan. The row settles, the bars
  realign, and the week's arithmetic *and the headline* recompute live.
- **`Keep {planned}h`** — the user has looked and decided. The row settles muted,
  and the project is **removed from the headline's flagged set**.

The second is as important as the first. A deviation that has been consciously
kept is a closed question; repeating it is nagging. Implementations that only
offer "update" turn the screen into a scold.

Projects reading `neutral` get no action. Nothing is at stake, so nothing is asked.

**Continuity requirement.** Friday must deliver *exactly* the week the onboarding
step previewed: the user's own project, their own number, and the tracked figure
they were shown. The same function that previews the verdict computes the real
one. If a reviewer sets 10h/fixed-price in onboarding and Friday shows anything
other than 16h and the margin verdict, the feature has broken its own promise.

---

## 5. The domain model

Single source of truth: `prototype/src/lib/model.ts`. Keep the reading logic out
of the view — the same function previews and reads for real.

```ts
type Kind = 'fixed' | 'retainer' | 'personal'
type Tone = 'alarm' | 'watch' | 'good' | 'neutral'

readWeek(kind, planned, tracked): { tone, headline, detail }
```

**The whole point of asking is this table.** One number, three different meanings:

| Kind | Tracked > planned | Tracked < planned |
|---|---|---|
| `fixed` | **`alarm`** — *"This job is costing you {%} more than you priced."* Every hour over comes out of the margin. | `good` — *"You're {gap}h under what you priced."* Worth knowing before quoting the next one the same. |
| `retainer` | `watch` — *"You're {gap}h over the retainer."* Unbilled hours; the shape scope creep has before anyone names it. | **`alarm`** — *"You're {gap}h under the retainer."* The gap renewals get argued over. |
| `personal` | `neutral` — *"You gave it {%} more than you meant to."* | `neutral` — *"You gave it {gap}h less than you meant to."* |

`summarise(projects, dismissed)` returns totals plus the flagged set and the worst
offender for the headline. `dismissed` carries the ids the user chose to keep and
**must** be honoured.

**Tone → colour** (all from the production palette): `alarm` `#c95c5c` ·
`watch` `#cd9460` · `good` `#4b8a63` · `neutral` `#a84c9d` (brand).

---

## 6. Visual system

Inherited from the live product, **not invented** — extracted from the production
bundle. The prep guidance is explicit that this must be built into the existing
experience, not shipped as a disconnected standalone.

- Ink `#412a4c`, dark `#312537`
- Brand magenta `#a84c9d` (deep `#7d3775`), `#c66cba`, `#d788cb`, `#e5abdb`, tint `#f9eef7`
- Neutrals `#6b6072`, `#857b8c`, `#c0b8c3`, line `#e4dfe6`, sunken `#f4f1f5`
- Cream `#fff8e8`, `#fff2d3`, amber `#ffde91`, amber ink `#7a5410`
- Ground `#f7f5f7`
- Typeface **Inter** (`fontFamily:"Inter"` in the bundle)

The onboarding payoff panel is cream so it reads as a *different material* from
the white form — a preview, not a nested card. Motion is one authored moment: the
verdict re-enters (opacity + translate + blur, 420ms, exponential ease-out) and
bars re-scale via `transform: scaleX()` (620ms). Do not animate `width`.

---

## 7. Built vs. stubbed

**Built and working** (`prototype/`, React + Vite + Tailwind v4, ~1,020 LOC):

- `steps/ProjectStep.tsx` — Toggl's real project step, rebuilt so the insertion
  point is visible
- `steps/CommitmentStep.tsx` — Surface A, with the live preview
- `steps/ReadyStep.tsx` — closing step, handles the skipped and set paths
- `screens/Friday.tsx` — Surface B, with the calibration loop
- `lib/model.ts` — reading logic, shared by both surfaces
- `ui/AppShell.tsx`, `ui/Shell.tsx`, `ui/Bar.tsx`, `ui/icons.tsx`
- `#friday` deep-links to the payoff

**Stubbed, and labelled as such:**

- The two companion projects on Friday are fixtures (`COMPANIONS` in `App.tsx`).
- Tracked hours are derived from `previewTracked`, not from real time entries.
- "Start tracking" jumps five days forward rather than into the app.
- No persistence, auth, or backend. State is React state.

---

## 8. Integrating into the real product

**Data model.** Two new fields on project: `kind: 'fixed'|'retainer'|'personal'`
and `plannedHoursPerWeek: number | null`. Both nullable — every downstream surface
must degrade to today's behaviour when they are null, because Skip is real and
existing projects have neither.

**Where the number is editable.** Onboarding is the acquisition point, not the
only one. Project settings needs the same two fields, and the Friday screen writes
to them directly.

**Only ask on the first project.** If a user creates five projects in week one and
is asked five times, the step has become a tax. Subsequent projects get an
optional field in the normal creation form, not a dedicated step.

**Tracked hours** come from summing time entries for the project over the ISO week.
The `readWeek` contract is deliberately narrow — three primitives in, a reading
out — so the aggregation source can change without touching the copy.

**Week boundary.** Friday, not Sunday: the verdict has to arrive while there is
still a day left to act on it. A Sunday verdict is a post-mortem.

---

## 9. Measurement

| | Metric | Why this one |
|---|---|---|
| **Primary** | % of new users who **adjust an estimate at least once** in days 0–7 | The activation signal for *this* feature. It means the user entered the loop, not merely completed a field. Completion rate alone would look healthy while the feature did nothing. |
| **Primary** | W0 return: % returning on ≥3 distinct days in the first week | The brief's own definition. |
| **Health** | Step completion vs. skip rate | The friction the step costs. If skip is high, the preview is not earning the field. |
| **Health** | Friday-screen open rate, and repeat opens in week two | Whether the verdict became a reason to come back. |
| **Counter** | Onboarding drop-off at the new step vs. baseline | The step's direct cost. **This is the number that kills the feature if it moves.** |
| **Counter** | Share of projects where the estimate is set once and never revisited | Would suggest it degraded into a config field. |

**Assumption to state out loud:** no baseline figures were available, so no
targets are proposed. The instrumentation is the deliverable, not a forecast.

---

## 10. Risks

1. **Added onboarding friction.** The mitigation is entirely the on-screen
   payoff and a working Skip. If either is compromised, the step is a net loss.
2. **Guilt.** See §1.4. Watch for it in copy review: the verdict describes a
   number, never the person. *"This job is costing you 60% more than you priced"*
   is about the job. *"You're behind"* would be about them.
3. **Bad day-zero estimates producing noisy verdicts.** Intended — calibration is
   the mechanism — but if accept rates on *update* stay near 100% for weeks, the
   ask is producing a number nobody owns, and the presets should be reconsidered.
4. **Incomplete week-one tracking.** The verdict sits on top of a log with holes.
   Surface A of any future day-reconstruction work attaches at §4.2 item 5.
5. **Contract type is a simplification.** Real work is messier than three kinds.
   Three is the most that can be asked for without a second screen.

---

## 11. Open questions

- Should the ask move to money (quoted fee + rate) once validated? It yields
  margin on day one, which is strictly more valuable to a freelancer than hours.
- Should a deadline field derive the *required* pace, catching overcommitment
  before it happens rather than after?
- Should the Friday verdict also arrive as an email or notification, or does that
  break the "it's a destination" framing?
- What happens in week two when history *does* exist — does the declared number
  stay the reference, or does the product start proposing one?
