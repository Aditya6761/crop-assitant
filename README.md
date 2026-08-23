# Crop Recommendation Assistant

A small frontend app that turns a farmer's or student's location, season,
soil type, and water availability into a short, structured list of suitable
crops — with reasons, precautions, and an honest confidence level — using
the Claude API.

**Live app:** _add your deployed URL here_
**Repo:** _add your GitHub URL here_

---

## Problem, users, and why this idea

Farmers and agriculture students often have to guess at crop choice from
memory, word of mouth, or generic advice that ignores their actual soil and
water conditions. This app is a small decision aid, not a chatbot: it takes
four concrete inputs and returns a small set of recommendations, each tied
to a specific reason grounded in those inputs, plus precautions and an
honest confidence rating. It's aimed at smallholder farmers and agriculture
students in India who want a quick second opinion before deciding what to
plant this season — not a replacement for a local agricultural extension
officer.

---

## Quick start

Requires Node.js 18.18+ and an Anthropic API key
([console.anthropic.com](https://console.anthropic.com/)).

```bash
git clone <your-repo-url>
cd crop-assistant
cp .env.example .env.local   # then paste your ANTHROPIC_API_KEY into it
npm install
npm run dev
```

Open http://localhost:3000. That's it — one command to run once
dependencies are installed.

Run tests:

```bash
npm test              # run once
npm run test:coverage # with coverage report
```

Build for production:

```bash
npm run build && npm start
```

---

## Architecture overview

```
app/
  page.tsx              → top-level client component; owns form + request state
  layout.tsx             → fonts, metadata, skip-link
  globals.css             → design tokens, focus states, reduced-motion handling
  api/recommend/route.ts   → SERVER-ONLY route; the only place the API key is used

components/
  CropForm.tsx            → accessible input form with inline validation
  LoadingState.tsx         → aria-live loading indicator
  ErrorState.tsx           → retry button + non-AI fallback guidance
  EmptyState.tsx           → pre-submission placeholder
  RecommendationResults.tsx→ renders validated, structured AI output

lib/
  schema.ts               → Zod schemas for BOTH the form input and the AI's
                             JSON output; parseModelResponse() is the safety
                             net between the model and the UI
  prompt.ts               → system + user prompt construction, kept separate
                             so it's reviewable and unit-testable on its own
  types.ts                → shared client-side types
```

**Data flow:** the form collects and client-validates input → `POST
/api/recommend` → the API route re-validates with the same Zod schema
(never trust the client) → calls the Claude API with a system prompt that
demands JSON-only output → the raw text response is parsed and validated
against `RecommendationResponseSchema` → only a response that passes
validation is returned to the client → the client renders it, or renders an
error state if anything failed along the way.

The API key lives only in `ANTHROPIC_API_KEY`, read server-side inside the
route handler. It is never sent to, or readable from, the browser.

---

## AI integration: how and why

**What it does:** the model receives the user's location, season, soil
type, water availability, and optional free-text notes, and returns a
ranked list of 3–5 crops, each with concrete reasons tied to those specific
inputs, optional precautions, and a self-reported confidence level
(low/medium/high). This is meaningfully different from a chatbot because
the user never writes a prompt — the structured form *is* the interface,
and the model's only job is to transform structured input into structured
output.

**Why structured JSON, not free text:** free text from an LLM is
unpredictable to render safely and impossible to validate. Requiring a
strict JSON contract (defined once in `lib/schema.ts` and enforced by
`RecommendationResponseSchema`) means the UI never has to guess how to
parse a paragraph, and a malformed or hallucinated response fails loudly
and safely instead of rendering broken or misleading content.

**Prompt strategy** (see `lib/prompt.ts` for the exact text):
- A system prompt pins the model into a narrow role and forbids any
  markdown or prose outside the JSON object.
- The model is told to ground every reason in the *actual* inputs given,
  not generic crop trivia — this is what makes the AI's contribution real
  rather than decorative.
- The model is explicitly told to self-report low confidence when inputs
  are vague (e.g., soil type marked "not sure"), and to add an
  `uncertaintyNote` explaining the guess. This keeps the tool honest about
  its own limits instead of asserting confident answers from thin input.
- The model is told this is general guidance, not a guarantee of yield or
  price — an explicit disclaimer against overclaiming.

**Validation:** `parseModelResponse()` strips accidental markdown fences,
parses the JSON, and runs it through a Zod schema requiring 1–6 crops, 1–4
reasons per crop, and an enum-constrained confidence value. Any failure
throws a typed error (`MODEL_RESPONSE_NOT_JSON` /
`MODEL_RESPONSE_SCHEMA_MISMATCH`) that the API route turns into a `502`
with a plain-language message — never a raw stack trace, never a partial
render.

---

## Resilience & error handling

| State | Trigger | What the user sees |
|---|---|---|
| Empty | Before first submit | Placeholder inviting them to fill the form |
| Loading | Request in flight | `aria-live` spinner with status text |
| Validation error | Required field missing/invalid | Inline `role="alert"` message per field, focus stays put |
| API error | Network failure, 5xx, or invalid model output | `role="alert"` panel with a plain-language message, a **Try again** button that resubmits the last inputs, and a non-AI fallback tip (check your state agriculture department or nearest KVK) so the user is never left with literally nothing |
| Success | Valid, schema-passing response | Structured results grouped by crop, with confidence badges and precautions |

The app deliberately never invents a fallback recommendation when the AI
call fails — showing a plausible-looking crop list that isn't actually
grounded in the user's inputs would be worse than an honest error.

---

## Testing evidence

Run `npm run test:coverage` and see `coverage/index.html` for the full
report. Test files:

- `__tests__/CropForm.test.tsx` — required-field validation blocks submit,
  every field has an accessible label, a fully filled form submits with the
  correct values.
- `__tests__/RecommendationResults.test.tsx` — renders every crop and
  confidence badge, only renders a precautions block when precautions
  exist, renders the uncertainty note when present.
- `__tests__/ErrorState.test.tsx` — announces errors via `role="alert"`,
  retry button fires the callback, always shows the non-AI fallback tip.
- `__tests__/schema.test.ts` — the model-response validator: accepts
  well-formed JSON, strips markdown fences, and rejects unparsable text,
  missing required fields, and out-of-enum values (this is the test suite
  that actually protects against a hallucinating model).

> **Before submitting:** paste a screenshot of `npm test` passing and the
> coverage summary here.

---

## Performance & accessibility

- Semantic HTML throughout: `<form>`, `<fieldset>`/`<legend>` for the
  radio group, `<label>` tied to every input via `htmlFor`/`id`.
- Visible focus ring (`outline: 3px solid`) on every interactive element,
  plus a skip-to-content link as the first focusable element on the page.
- Errors are announced via `role="alert"`; loading state via
  `role="status"`/`aria-live="polite"`.
- `prefers-reduced-motion` is respected globally.
- Color choices (soil browns, leaf greens) were checked for 4.5:1 text
  contrast against their backgrounds.

> **Before submitting:** run Lighthouse (Performance/Accessibility/Best
> Practices/SEO, mobile + desktop) and WAVE or axe DevTools against your
> deployed URL, paste screenshots or scores here, and note the one specific
> change you made as a result — e.g. "axe flagged the radio group missing a
> group label, so I added the `<fieldset>`/`<legend>` now in CropForm.tsx."

---

## Known limitations & future improvements

**Limitations**
- Recommendations are general agronomic guidance from an LLM, not
  validated against real regional agricultural datasets — they should
  supplement, not replace, local expert advice.
- No persistence: recommendations aren't saved between sessions.
- English-only UI; many target users would benefit from Hindi/regional
  language support.
- No rate limiting on the API route yet — a production version serving
  real traffic should add per-IP throttling to control cost and abuse.

**Future improvements**
- Add a simple in-memory or edge rate limiter on `/api/recommend`.
- Localize the UI and prompt for regional languages.
- Let users save/compare recommendations across seasons.
- Cross-reference model output against a curated regional crop dataset as
  a second validation layer, not just schema shape.

---

## Deployment & operation

See `DEPLOYMENT_CHECKLIST.md` for the filled-out checklist.

**Environment variables required in production:** `ANTHROPIC_API_KEY`
(set in your hosting provider's dashboard — Vercel: Project Settings →
Environment Variables — never in a committed file).

**Failure mode in production:** if the API key is missing or invalid, the
route logs the error server-side and returns a generic `500` with a
user-safe message — it never leaks configuration details to the client.
If the model call fails or returns malformed JSON, the route returns a
`502` and the UI shows the retry + fallback-tip error state described
above.

**Rollback plan:** this app has no database or migrations, so rollback is
simple — redeploy the last known-good commit from `main` (on Vercel:
Deployments tab → find the last good deployment → "Promote to
Production"). Monitoring for this small project is manual: watch the
hosting provider's function logs for repeated `502`/`500` responses after
a deploy.

---

## Reflection

See `REFLECTION.md`.
