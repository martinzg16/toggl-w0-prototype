# PRODUCT.md — Toggl 2.0 (Focus) · W0 prototype

> Written from decisions already made in the working session (brief, product
> recon, and the user's own scoping call), not from a fresh init interview.

## What this is

A prototype of one improvement inside **Toggl 2.0 (Focus)**, Toggl's
consolidated "time intelligence" product. It is not a standalone app: it
extends the existing product surface.

## Who it's for

Two personas from the assignment brief, both **individual** users:

- **Individual Contributors** — independent contractors embedded in client
  orgs. Track to demonstrate value, protect contractual boundaries, justify
  rates. Pains: scope creep, untracked collaboration time, proving work.
- **Freelancers** — juggling multiple clients, rates, deadlines. Pains:
  **forgetting to track**, reconstructing the day, estimating without
  historical data, not knowing what's profitable.

Both are working **alone** in week one.

## The mechanism (one sentence)

Toggl's value is accumulated intelligence, so it manufactures a week-one
payoff instead from what the user supplies on day one — their own estimate —
and keeps that loop alive when they inevitably forget to track.

## The problem, evidenced

Verified in Toggl's production bundle and a recorded cold signup:

- Reports promises **"Get insights from day one!"** while every value surface
  says *"after a few periods"*, *"once periods accumulate"*, *"no complete
  weeks yet"*.
- The trial reward modal ("Tu prueba comienza ahora") offers a solo user:
  billable rates/profitability (needs history + cost rates), **timeline and
  unlimited teammates**, **utilization and workload reports**. Two of three
  are team features.
- Reports tells a solo user, in its own words: **"One person's bars can't
  show balance"** and *"Utilization is measured per person — invite your
  team"*. Its only escapes are *invite your team* or *import history*.
- Onboarding connects the user's calendar in step 3 and then never uses it
  for anything load-bearing.
- Toggl has a behavioural friction engine (Navigator: *"{{hours}}-hour gap in
  yesterday's logs"*) whose every resolution is "enable a desktop feature".

## The decision, and what it rejects

**One project. One loop. One week.**

The obvious answer is bulk-importing every client and project. Rejected — not
on build cost, but because front-loading setup is precisely what breaks week
one. The user pays before receiving. **The product must earn the right to ask
for the second client.**

## Scope

| Piece | What |
|---|---|
| Denominator | an estimate captured in the first-project step that already exists |
| Progress | that one project: tracked vs. estimated, plus day coverage; changes daily |
| Repair | gap detected → fill from the calendar already connected in onboarding |
| Expansion | "add your second client" appears around day 5–7, never day 1 |

**Explicitly out:** bulk import, connectors/MCP, invoicing, client sharing,
profitability, anything team, desktop features, AI categorization of entries.

## Brand commitments

- The visual world is **Toggl's own**, extracted from its production CSS: 329
  tokens + 288 dark overrides, GT Haptik display / Inter UI, 14px body,
  4/8/20/32 radii, 1px `border-primary` separation over shadow.
- Toggl's voice is dry and evidence-based ("Real data. Not spreadsheet
  guesses", "No bloat"). Sentence case for actions, ALL CAPS for field labels.
- **No gamification devices.** No streaks, badges, points, confetti. The user
  ruled these out explicitly; progression is shown by the picture completing
  itself, not by rewards. This is a professional tool for people billing
  clients.

## Success

D1→D7 return rate · tracking-days in week 2 · % of solo users with an
estimate set · % adding a second project **after** day 5 (the signal the loop
paid off).
