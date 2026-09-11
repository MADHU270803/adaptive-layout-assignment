# Adaptive Layout Engine for Multi-Surface Ads

A constraint-based layout engine that takes a single declarative ad spec and adapts it across fundamentally different surfaces (mobile, broadcast, kiosk) using a priority-ordered resolution algorithm — not hardcoded per-surface layouts.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in your browser.

## Running the demo

- The page shows a row of buttons — one per surface profile (mobile-portrait, mobile-landscape, broadcast-lower-third, retail-kiosk).
- Click any button to instantly re-resolve the same ad spec for that surface. No code changes or page reload needed.
- The currently selected surface is shown in bold.

## Known limitations

- Layout direction is decided by aspect ratio: wide surfaces (ratio > 1.2) use a row layout, tall surfaces (ratio < 0.8) use a column layout, and roughly square surfaces (ratio 0.8–1.2) use a two-column grid, so that square surfaces like the kiosk are genuinely recomposed rather than a scaled copy of the portrait layout.
- Cross-axis element sizes are clamped to the surface's bounds, so a fixed-size element (e.g. the CTA button or logo) can never extend past the edge of an unusually small or narrow surface.
- Text elements use estimated sizes based on `minTextSize`/role, not actual measured text rendering (no text-measurement API is used).
- No animated transition when switching surfaces — layout changes are instant.
- Fixed set of five element types (headline, hero image, CTA, price, branding) — the engine isn't a general-purpose arbitrary-element system.

## Time spent

Approximately 4-5 hours total: core resolver algorithm, type system, and surface-adaptive demo, plus a self-directed adversarial audit against the assignment brief and two targeted correctness fixes (cross-axis bounds clamping, aspect-ratio-based composition for square surfaces).
## Layout algorithm

**Resolution flow:**

Ad Spec + Surface Profile → resolveLayout() → Resolved Layout (per-element x/y/width/height/visible) → React renders positioned boxes


**Step by step:**

1. **Sort by priority.** All elements are sorted so priority 1 (most important) is processed first, priority 3 (least important, e.g. branding) is processed last. This ordering is what makes degradation predictable — whatever runs out of room is always the least important thing left.

2. **Decide layout composition from aspect ratio.** The surface's aspect ratio (`width / height`) determines one of three compositions: surfaces wider than a 1.2 ratio arrange elements left-to-right in a row; surfaces narrower than a 0.8 ratio arrange elements top-to-bottom in a column; surfaces in between (roughly square, like the kiosk) use a two-column grid — primary content (headline, hero image) on the left, secondary content (CTA, price, branding) on the right. This is a numeric rule based on the surface's own dimensions, not a per-surface hardcoded branch — verified by testing an unseen 700×750 surface, which received the same grid treatment as the kiosk purely from its aspect ratio.

3. **Compute each element's natural size.** A `getNaturalSize()` function calculates how big an element wants to be, based on its `role` (headline, hero image, CTA, price, branding), the surface's constraints (`minTapTarget`, `minTextSize`), and the chosen layout direction. For example, a CTA button always sizes itself to at least the surface's `minTapTarget`, regardless of surface — this directly enforces the "hard constraint" requirement from the brief.

4.**Place or drop.** For row and column surfaces, the algorithm checks whether each element's natural size fits in the space remaining along the layout axis (width, if row; height, if column). For grid surfaces, the same fit-or-drop check runs independently within each column, against that column's own height budget. In every case: if it fits, the element is placed immediately after the previous one (no gaps, no overlaps) and the remaining space shrinks accordingly; if it doesn't fit, the element is marked `visible: false` and skipped — it is never shrunk into an overlapping or clipped state, and never silently dropped without being explicitly marked.

**Why this counts as a real algorithm, not a lookup table:** the same `resolveLayout()` function runs unmodified for every surface. Nothing in the resolver checks `if (surface.id === "mobile-portrait")` — the different outcomes come entirely from the surface's actual width/height/constraints being fed through the same priority-and-direction logic. This was verified directly: mobile-landscape (480×320, row mode) correctly drops the branding logo when space runs out, while mobile-portrait (320×480, column mode) has enough room to keep all five elements — same function, same input spec, different real constraints, different real outcome.

## TypeScript design

- **Union types restrict valid values.** `ElementType` (`"text" | "image" | "button"`) and `ElementRole` (`"primary" | "hero" | "action" | "branding" | "secondary"`) can only ever hold one of their listed string values. Assigning anything else — e.g. `role: "featured"` — is a compile-time error, not a runtime surprise. This was verified directly during development: an invalid role value was flagged by TypeScript before the app ever ran.
- **Interfaces define required shapes.** `AdElement`, `AdSpec`, `SurfaceProfile`, and `ResolvedElement` each describe exactly which fields are required and what type each one must be. It is not possible to construct, for example, an `AdElement` missing a `priority`, or with `priority` as a string instead of a number — TypeScript rejects it before compilation succeeds.
- **Optional fields model real per-surface variation.** `SurfaceProfile` fields like `minTapTarget`, `minTextSize`, and `touchOnly` are marked optional (`?`), since not every surface needs every constraint (e.g. a broadcast screen has no tap target, but does have a minimum text size). This lets each surface only declare what's actually relevant to it, while still being fully type-checked.
- **Function signatures enforce contracts end to end.** `resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedElement[]` guarantees, at compile time, that the resolver always receives valid input and always returns a fully-typed array a renderer can consume directly — no `any` types, no guessing what shape the output has.