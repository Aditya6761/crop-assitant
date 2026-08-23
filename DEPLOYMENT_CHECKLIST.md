# Deployment Checklist

Fill in each box as you actually complete it — don't check anything you
haven't verified yourself. Sign off at the bottom.

## Build & code
- [ ] `npm run build` completes with no errors
- [ ] `npm run lint` has no critical errors
- [ ] No `console.log` debug statements left in committed code
- [ ] `.env.local` is **not** committed (verify with `git status`)

## AI integration
- [ ] `ANTHROPIC_API_KEY` is read only inside `app/api/recommend/route.ts`
      (server-side) — confirm it never appears in any client component or
      in browser devtools → Network tab response
- [ ] Model responses are validated against `RecommendationResponseSchema`
      before being sent to the client
- [ ] A deliberately malformed/failed model call was tested locally
      (e.g. temporarily rename the env var) and produces the error state,
      not a crash

## UI states
- [ ] Empty state implemented and shown before first submit
- [ ] Loading state implemented, uses `aria-live`
- [ ] Validation error state implemented per field
- [ ] API error state implemented with retry + fallback guidance
- [ ] Success state implemented and matches the schema's shape

## Accessibility
- [ ] Keyboard-only pass: can complete the whole form and submit using only
      Tab / Shift+Tab / Enter / Space
- [ ] Visible focus indicator on every interactive element
- [ ] All form fields have associated `<label>` elements
- [ ] axe or WAVE run against the deployed URL with zero WCAG AA violations
- [ ] Color contrast checked for body text and buttons

## Testing
- [ ] `npm test` passes locally
- [ ] Coverage ≥ 50% of components (`npm run test:coverage`)

## Performance
- [ ] Lighthouse run on the deployed URL (mobile **and** desktop)
- [ ] Score ≥ 85 on Performance and Accessibility (target 90+)

## Production deployment
- [ ] Deployed to: __________________ (Vercel / Netlify / other)
- [ ] `ANTHROPIC_API_KEY` set in the host's environment variable dashboard
      (not in code)
- [ ] Production URL tested end-to-end on a real mobile device
- [ ] Production URL tested end-to-end on desktop

## Rollback / monitoring
- [ ] Rollback method confirmed: redeploy last known-good commit from
      `main` (Vercel: Deployments → previous deployment → Promote to
      Production)
- [ ] Know where to check logs after a deploy (host's function/log
      dashboard) to catch a spike in 5xx responses

---

**Signed off by:** ______________________
**Date:** ______________________
