# Agent Notes

## Project Basics

- Frontend: React, TypeScript, Vite.
- API: Node handler bundled with esbuild from `api/src/handler.ts`.
- Generated Pokemon data: `src/data/pokemon.ts` from `scripts/generate-pokemon-data.mjs`.
- Prefer small, targeted changes and verify with lint/build commands.

## Common Verification

Run relevant checks after code changes:

```sh
npm run lint
npm run build
npm --prefix api run build:handler
npm --prefix api run build:cron
```

For case generation changes, also run a regeneration smoke test:

```sh
npm --prefix api run cases:regenerate:today -- --date=YYYY-MM-DD --difficulty=easy
```

Use `--difficulty=hard` when touching hard-only clue behavior.

## Clue Rules

- Never introduce empty or generic clue fallbacks. Unknown or missing evidence previews should throw.
- `getClueCollectionKey(...)` controls duplicate disabling in the UI.
- Same exact clue collection key should disable after collection.
- Type clues share the player-facing label `Type clue`, but their subtitles make them different collectible clues:
  - `Residue`
  - `Ground marks`
  - `Entry marks`
  - `Witness report`
- Each location may contain at most one Type clue option. Keep `getLocationChoiceAxis(...)` grouping type evidence as `typeClue` for per-location choice validation.
- Stat clues share one collection key unless intentionally changed.
- Region clue is case-level single-use.
- Color clue is hard-only.
- Capture clue groups are:
  - `elusive`: `captureRate <= 45`
  - `guarded`: `captureRate <= 120`
  - `easygoing`: everything else

## Case Generation Safety

Case generation must guarantee no player-order deadlocks.

`areLocationEvidenceChoicesSolvable(...)` must model arbitrary player order, not fixed location order. At every recursive state:

- Every unopened location must have at least one enabled lead.
- Every possible next location and enabled clue choice must remain valid.
- Terminal states must still solve the case.

Do not reintroduce behavior that skips a location when all of its leads are disabled; that creates UX deadlocks.

## Admin Analytics

The admin clue usage tab shows:

- Overall generated clue usage by difficulty.
- Player-collected clue usage by difficulty.
- Average clue effectiveness as non-culprit suspects eliminated.

Keep the API response defensive around legacy/malformed evidence so admin pages do not 500 because one clue cannot be evaluated.

## Styling Notes

- The investigation corkboard is the card. Do not wrap `LocationsPanel` in an extra `notebook-card`.
- Capture clue badge color is defined by `.evidence-badge--clue-capture`.

- Do not use eyebrow labels (small labels above headings) anywhere in the UI. This is an explicit user design preference.
- Use handwritten fonts only for decorative document content, never game components such as clue badges. Keep game components in the standard UI font, including inside handwritten documents.
