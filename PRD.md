# Declared Pace — PRD

**Product:** Toggl Focus · individual user · week one
**Author:** Martín Zulueta · 18 August 2026
**Status:** working prototype, deployed
**Prototype:** https://martinzg16.github.io/toggl-w0-prototype/
**Source:** https://github.com/martinzg16/toggl-w0-prototype
**Functional spec:** [SPEC.md](./SPEC.md)

---

## 1. Summary

Toggl Focus asks a new user to name a project and then never asks how long
they think it will take. So week one has no denominator: the product has
nothing to measure the user's time against, and every surface that produces
insight is gated on history the user does not have yet.

**Declared Pace** adds one step to onboarding — kind of work, and hours a week
— and turns that declaration into a verdict on Friday of week one. It
substitutes a *declared* number for *accumulated* history, which is the only
way a no-history week can say anything at all.

The bet: a new user comes back because something they can only get here
arrived within seven days.

---

## 2. The problem

### 2.1 The constraint

W0 retention — a new user returns and gets value within their first week — is
a **hard constraint**, not a theme. A pain that only materialises months into
a client relationship is out of scope unless the solution demonstrably reaches
week one.

### 2.2 The wound, in Toggl's own words

This is not inferred. It is read out of the production bundle
(`index-FbQ6MDcP.js`) and a recorded cold signup.

| Surface | Today's copy |
|---|---|
| Reports empty state | **"Get insights from day one!"** |
| Estimates | *"No history yet. We'll suggest an estimate **after a few periods**."* |
| Estimate vs actual | *"**After a few periods**, we'll check this estimate against your tracked time."* |
| Margin | *"Margin trend will populate once **periods accumulate**…"* |
| KPIs | *"no complete weeks yet"* · *"no complete days yet"* |
| Workload, solo user | **"One person's bars can't show balance"** |
| Utilization, solo user | *"Utilization is measured per person"* |
| Projects footer | *"Once **your team** tracks, **or you import history**…"* |

The first row contradicts every row beneath it. And the two escapes the product
offers a solo user — *invite your team*, *import history* — are exactly the two
things a freelancer starting from zero does not have.

The trial modal shown seconds after onboarding compounds it. It celebrates
unlocking billable rates and profitability (needs cost rates **and** history),
timeline and **unlimited teammates**, and **utilization and workload reports**.
Two of three are team features, offered to someone who just signed up alone.

**In one line:** the product only knows how to talk about accumulated value,
and in week zero there is no accumulation. Week one is all cost and a promise.

### 2.3 Who this is for

Both personas from the brief, both solo, both **on web**. The recon found
Toggl's friction-detection engine (*Navigator*) is fed by desktop-client
signals and every one of its resolutions is "turn on a desktop feature" — so
the web user in week one is the underserved case.

- **Freelancer** — several clients, rates and deadlines at once. Fails at:
  forgetting to track, reconstructing the day, estimating without history, not
  knowing which client is profitable, overcommitting.
- **Independent contractor** — embedded in a client org, longer engagements.
  Fails at: scope creep, untracked collaboration time, justifying rate and
  renewal.

---

## 3. The solution

### 3.1 The move

If the product has accumulated nothing, the first insight must come from a
number the user **declares**, not one the product **accumulates**.

At project creation we ask two things: what kind of work this is, and how many
hours a week it should get. That declaration is a **substitute for history**.
It makes day one comparable, and it makes a verdict exist on Friday that no
competitor can show without months of data — because none of them ask.

### 3.2 The corollary most implementations get wrong

**The day-zero number will be wrong. That is the mechanism, not a defect.**

The job of week one is not to *hit* the estimate. It is to **calibrate** it.
Everything downstream follows:

- The Friday screen's primary action is *update the number*, not *do better*.
- Being over is information, not failure.
- A deviation the user has looked at and consciously kept is **closed**, and is
  not raised again in the same view.

Get this wrong and the feature becomes a productivity scold. Time-tracking
products that make people feel behind teach them to stop opening the app —
churn wearing a different name, landing inside the same seven days.

### 3.3 Why *kind of work* and not just hours

One number reads three different ways. This table is the entire reason for
asking:

| Kind | Tracked > planned | Tracked < planned |
|---|---|---|
| **Fixed price** | **alarm** — *"This job is costing you 60% more than you priced."* Every hour over comes out of the margin. | good — *"You're 7h under what you priced."* Worth knowing before quoting the next one the same. |
| **Retainer** | watch — *"You're 3.5h over the retainer."* Unbilled hours; the shape scope creep has before anyone names it. | **alarm** — *"You're 1.5h under the retainer."* The gap renewals get argued over. |
| **Personal** | neutral | neutral — the product stays quiet when nothing is at stake |

Without `kind`, "you went over" is a number. With it, it is a finding.

### 3.4 The two surfaces

**A · The commitment step.** Inside onboarding, immediately after *Create your
first project*. Two fields, and — critically — **the payoff is on the same
screen**: a live panel shows the Friday reading the chosen answer buys. That
panel is the entire justification for adding a step to onboarding; the field
demonstrates its value in situ rather than promising it later.

Skip works and is not punished. If the step cannot stand up without being
compulsory, it does not stand up.

**B · The Friday verdict.** A first-class destination called **This week** —
deliberately *not* inside Reports, which is the surface that currently tells a
solo user "One person's bars can't show balance". Composition:

1. A **quiet total** — *"You planned 17h across 3 projects and tracked 7h."*
2. A **loud verdict that contradicts it** — *"10h under in total — which is not
   the story. Contra newsletter is."*
3. **One row per project** — hairline separators, not cards. Planned and
   tracked bars on a shared scale, the reading, and the calibration controls.
4. An **honest caveat** — *"Thursday only has 1.2h logged across everything. If
   that's a gap rather than a light day, two of these readings move."*
5. **The thesis, once, small** — *"None of this needed history."*

The inversion in (1)→(2) is the thesis rendered as a sentence. The total is
almost always unremarkable, and reading the total is exactly how a freelancer
concludes a bad week was fine.

**The calibration loop** is the retention mechanic. Every flagged project
offers two real actions: **Make it {tracked}h a week** rewrites the plan and
the week's arithmetic recomputes live; **Keep {planned}h** closes the question
and removes the project from the headline. The second matters as much as the
first.

---

## 4. What was rejected, and why

| Rejected | Why |
|---|---|
| **Bulk-importing every client and project** | Not on build cost — on product grounds. Front-loading setup is precisely what breaks week one: the user pays before receiving. **The product must earn the right to ask for the second client.** |
| **"Review your day" / categorise logged time** | The saturated answer; the hiring page warns candidates converge on it. Worse, Toggl already ships Activity timeline, Auto tracker, Smart suggestions and Idle detection — it competes with shipped features. |
| **Redesigning onboarding itself** | A minute-one problem. Improves activation, not return. This inserts into onboarding; it does not fix it. |
| **Invoicing / billable reports** | Value lands at month end. Fails W0. |
| **Profitability or rate analysis** | Needs months. Fails W0. |
| **Mobile quick-start / widgets** | Still depends on remembering. Does not address why the log decays. |
| **A week-one dashboard** | Charts are how you make a no-history week look empty. The total is deliberately demoted instead. |

**Positioning:** this does not improve *capture*. It creates the reference
against which captured time means something.

---

## 5. Scope

**In:** the commitment step; the This week verdict; the calibration loop; the
two entry paths (import a Toggl Track history, or start cold); per-project
`kind` and `plannedHoursPerWeek`, editable after onboarding.

**Out:** bulk import, connectors, invoicing, client sharing, profitability,
anything team, desktop features, AI categorisation of entries.

**Two entry paths.** A returning Track user already has projects, so they pick
one and the pace is **suggested from that project's own history**
(*"That is what Northwind identity actually averaged over 5 weeks"*). A cold
user types a name and the pace is **asked**, because a guess is the only
baseline that can exist. Same field, same design, sourced from whichever the
user actually has.

---

## 6. Measurement

| | Metric | Why this one |
|---|---|---|
| **Primary** | % of new users who **adjust an estimate at least once** in days 0–7 | The activation signal for *this* feature: the user entered the loop rather than merely completing a field. Completion rate alone would look healthy while the feature did nothing. |
| **Primary** | W0 return: % returning on ≥3 distinct days in week one | The brief's own definition. |
| **Health** | Step completion vs. skip rate | The friction the step costs. High skip means the preview is not earning the field. |
| **Health** | This week open rate, and repeat opens in week two | Whether the verdict became a reason to come back. |
| **Counter** | Onboarding drop-off at the new step vs. baseline | The step's direct cost. **This is the number that kills the feature if it moves.** |
| **Counter** | Share of projects where the pace is set once and never revisited | Would mean it degraded into a config field. |

**Stated assumption:** no baseline figures were available, so no targets are
proposed. The instrumentation is the deliverable, not a forecast.

---

## 7. Risks

1. **Added onboarding friction.** Mitigated entirely by the on-screen payoff and
   a working Skip. If either is compromised, the step is a net loss.
2. **Guilt.** Watch for it in copy review: the verdict describes a number, never
   the person. *"This job is costing you 60% more than you priced"* is about the
   job. *"You're behind"* would be about them.
3. **Noisy verdicts from bad day-zero estimates.** Intended — calibration is the
   mechanism. But if accept rates on *update* stay near 100% for weeks, the ask
   is producing a number nobody owns and the presets need reconsidering.
4. **Incomplete week-one tracking.** The verdict sits on a log with holes. The
   caveat line is where a day-reconstruction flow attaches later.
5. **Three contract kinds is a simplification.** Real work is messier. Three is
   the most that can be asked without a second screen.

---

## 8. Open questions

- Should the ask move to money (quoted fee + rate) once validated? It yields
  margin on day one, which is strictly more valuable than hours — but it is two
  more fields and the rate is already collected elsewhere.
- Should a deadline field derive the *required* pace, catching overcommitment
  before it happens rather than after?
- Should the verdict also arrive as an email, or does that break the
  "it's a destination" framing?
- In week two, when history does exist, does the declared number stay the
  reference or does the product start proposing one?

---

## 9. Implementation notes

Two nullable fields on project: `kind` and `plannedHoursPerWeek`. Every
downstream surface degrades to today's behaviour when they are null, because
Skip is real and existing projects have neither. Only ask on the **first**
project — five projects in week one must not mean five interrogations.

Week boundary is **Friday, not Sunday**: the verdict has to arrive while there
is still a day left to act on it. A Sunday verdict is a post-mortem.

`readWeek(kind, planned, tracked)` is deliberately narrow — three primitives
in, a reading out — so the same function previews during onboarding and reads
for real on Friday, and the aggregation source can change without touching the
copy.

### What is real and what is synthetic

**Real:** the whole onboarding flow, both entry paths, the live timer, the week
calendar with click-to-log, task creation, the repair of unlogged calendar
events, and the calibration loop. Your own project's tracked hours come from
what you actually log in the prototype.

**Synthetic, and labelled in the UI:** the two companion projects on This week,
the imported Track history, and the calendar events. There is no backend; state
is React state.
