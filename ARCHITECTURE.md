# Architecture

## File responsibilities

- **`src/spec.ts`** — defines what an ad *is*: element types, roles, priorities, and the `defineAd()` helper. Knows nothing about surfaces, sizing, or rendering.
- **`src/surfaces.ts`** — defines what a surface *is*: dimensions and physical constraints (tap target, text size, touch-only, viewing distance). Knows nothing about ad content or layout logic.
-**`src/resolver.ts`** — the engine. Takes one `AdSpec` and one `SurfaceProfile` and produces a `ResolvedElement[]`. Contains all layout decision-making: sizing, aspect-ratio-driven composition (row, column, or two-column grid), priority ordering, degradation. Knows nothing about React, DOM, or CSS.
- **`src/App.tsx`** — the renderer and demo UI. Takes the `ResolvedElement[]` output and draws it as positioned `<div>`s. Also owns the surface-picker state (`useState`). Contains no layout logic of its own — it only displays whatever the resolver decided.

## Why this separation matters

Each layer only depends on the one below it, and never on the one above:
spec.ts + surfaces.ts
↓
resolver.ts (pure logic — no rendering knowledge)
↓
App.tsx (rendering only — no layout knowledge)


This means:

- **A new surface profile can be added without touching `resolver.ts` at all** — just add another object matching the `SurfaceProfile` shape in `surfaces.ts`, and the existing algorithm handles it automatically. This was proven directly: the same `resolveLayout()` function correctly handled four different surfaces with no per-surface code branches.
- **A new renderer (e.g. a Canvas-based one instead of DOM) could be added without touching `resolver.ts`.** Since the resolver's output (`ResolvedElement[]`) is plain data — numbers and booleans, no JSX or DOM references — any renderer could consume the exact same resolved layout and draw it differently (Canvas, SVG, etc.) without the resolution logic changing at all.
- **The resolver is independently testable** — because it takes plain data in and returns plain data out, with no dependency on React or the browser, its correctness (no overlaps, correct degradation order) can be verified just by calling it directly and inspecting the result, which is exactly how it was verified during development.
- **A new surface automatically receives the correct composition, without any per-surface decision being made anywhere.** Because the resolver picks row/column/grid purely from the surface's own aspect ratio, adding a surface never requires deciding "what composition should this use?" — that decision is already generalized. This was verified directly: a 700×750 surface, never referenced anywhere else in the codebase, received the same two-column grid treatment as the kiosk purely because its aspect ratio fell in the same range.