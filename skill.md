# Implementation skills — Resident Evil: Requiem Menu

This is the implementation companion to `design.md`. It captures the *why*
behind each non-obvious technical choice so future maintainers can change
behavior without re-deriving the constraints.

---

## 1. Fixed 1920×1080 stage, scaled to fit

**Why.** All chrome (title image, menu, footer, watermark) lives at absolute
pixel offsets. Reflowing them to viewport units would shift everything off-axis
and break the cinematic composition. The handoff is a "stage", not a
responsive layout.

**How.**
- `useStageScale` returns `min(vw/1920, vh/1080)` and re-computes on `resize`.
- `Stage` applies `transform: translate(-50%, -50%) scale(${scale})` via a
  CSS variable. The translate-then-scale pattern keeps the stage centered in
  the viewport regardless of size, instead of relying on
  `display: grid; place-items: center` (which expands the implicit grid
  track to the stage's intrinsic 1920×1080 and pushes the scaled box off-screen
  on smaller windows — the prototype's bug we already fixed).

**Edge cases.**
- We do NOT use `vw/vh` units inside the stage — every dimension stays in px so
  the scale factor handles all sizing.
- Subpixel rounding can leave a 1px black seam at the edge; the viewport
  parent stays `#000` to mask it.

---

## 2. Title as a static PNG with `mix-blend-mode: screen`

**Why.** The Requiem wordmark is hand-painted: torn-paint streaks, irregular
edges, dripping speckles. Faking that in SVG/CSS costs days and never quite
nails the texture. The prototype iterated through three SVG attempts before
the designer dropped in the raw image — that is the source of truth.

**How.**
- `requiem-logo.png` sits at `public/assets/requiem-logo.png` and is rendered
  by `<TitleImage>` as a plain `<img>`.
- `mix-blend-mode: screen` makes black pixels of the PNG transparent so only
  the white paint shows on whatever backdrop the user has dropped.
- `filter: drop-shadow(...)` lifts the paint away from the backdrop without
  softening the torn edges (a regular `box-shadow` would clip to the
  rectangular box and look wrong).
- `pointer-events: none` so the click hits the media slot beneath, not the
  title.
- `draggable={false}` so users can't accidentally drag the title out of the
  page.

**Caveats.**
- The PNG must have a *true* black background (#000) for `screen` to render
  it as fully transparent. Off-black or anti-aliased fringes will print as
  faint ghosts. If you swap the asset, re-flatten against #000 first.
- This layer is at `z-index: 5`, between `.left-darken` (z:2) and the
  interactive chrome (z:6). The title sits "behind" the menu and watermark
  in the sense that they catch input.

---

## 3. Backdrop drop zone with default media

**Why.** The menu has to look good without forcing the user to drop a file on
the very first visit. So we ship a default backdrop, but we deliberately
**don't write the default to IndexedDB** — that way "Reset Media" returns to
the default, not to blank.

**How.**
- `usePersistedMedia(key, { defaultUrl })`:
  1. Check IDB for the key.
  2. If saved, render saved media. Done.
  3. Otherwise, if `defaultUrl` is set, `fetch(defaultUrl)` → render the
     resulting blob. **Do not** call `setMedia`.
- User drops a file → `accept(file)` writes to IDB → next reload IDB wins.
- User clicks Reset → IDB cleared → defaultUrl fetched again.

**Why fetch instead of a static `<img>` default?** Because the slot renders
the file through a Blob URL pipeline (the same one used for user drops). A
direct `<img src="/assets/test-bg.png">` would diverge from that path and
break the "video loops" guarantee (the default could be swapped for a video
later without changing call sites).

---

## 4. Menu is fully controlled

**Why.** The active row drives two things: which `<li>` lights up *and* which
description shows in `<FooterLeft>`. If `Menu` owned its state internally,
`App` couldn't read it for the footer without bidirectional callbacks.

**How.**
- `App` owns `activeIndex` state.
- `Menu` takes `activeIndex`, `onActiveChange`, `onConfirm` as props — fully
  controlled.
- `FooterLeft` receives `desc = MENU_ITEMS[activeIndex].desc`.
- The keyboard listener (still `window`-level inside `Menu`) reads
  `activeIndex` from props and calls `onActiveChange` with the next value.
  This means the effect's deps include `[activeIndex, onActiveChange,
  onConfirm]` — the listener re-binds on each move, but that's cheap and
  keeps state in sync.

**Default active is 0 (Main Story).** Per the design, the user always lands
on the option that always works.

---

## 5. Confirm keys are F / Enter / Space (not X)

The prototype iterated from PS5 ✕ (cross button) → keyboard `x` → keyboard
**`F`**. `F` is what the on-screen keycap shows, so it must be the canonical
key. We keep `Enter` and `Space` as ergonomic fallbacks. We accept both `F`
and `f` (lowercase via `e.key.toLowerCase()`).

---

## 6. Active highlight is a black rectangle, not a glow

**Why.** The Requiem direction's active state is a **stamped** ink rectangle
behind the typewriter text — like the option got marked with a redactor's
brush. Earlier attempts used a `clip-path: polygon(...)` to fake a torn edge
on the rectangle, but the polygon clipped the text descenders (`g`, `y`)
and made "Exit" disappear. We removed the polygon and accept a clean rect —
the typewriter font already carries enough grunge.

**How.**
- `.menu li.active` sets `background-color: rgba(0, 0, 0, 0.85)` + a 4px
  rightward nudge.
- Padding on every `<li>` (`4px 22px 5px 14px`) provides air around the text
  so the highlight doesn't hug it.
- `width: max-content` so the rectangle hugs the *word*, not the column.

---

## 7. Footer description has a fixed `min-height`

**Why.** The description string changes per menu item — different lengths.
If the line height collapses to 0 between selections, the `[F] Confirm` row
below jumps. `min-height: 1.2em` reserves the slot so the layout is stable.

---

## 8. Flash overlay uses an imperative handle

**Why.** A confirm pulse is a one-shot animation that needs to *restart* on
each confirm. Doing that with React state means flipping a boolean to true,
scheduling a timer, and flipping it back — and you have to remember to force
a reflow (reading `offsetWidth`) so CSS replays the keyframes.

**How.** `FlashOverlay` exposes `pulse()` via `useImperativeHandle`. The DOM
manipulation (`classList.remove → reflow → classList.add`) is one synchronous
sequence with no race conditions.

---

## 9. What I deliberately did NOT do

- **No loading bar.** The previous direction shipped a heartbeat ECG sweep at
  the bottom edge. The Requiem direction is intentionally quiet — the room
  doesn't have a heartbeat monitor. The CSS for the old bar has been
  removed entirely.
- **No breathing vignette.** Same reasoning — the frame is dead still by
  choice.
- **No left-stripe DOM element.** The painted vertical spine is part of
  `requiem-logo.png`, not a separate node. One fewer thing to position.
- **No state library.** Two pieces of state (active index + media blob) don't
  justify it.
- **No routing.** The menu is a single screen; `onConfirm(item)` is the seam
  for the integrator to wire their router or scene loader.
- **No tests.** Visual regression tooling (Percy / Chromatic) is the right
  harness for a pixel-pinned screen, not unit tests.

---

## 10. Known gotchas

- **Mix-blend-mode + arbitrary backdrops.** `screen` looks great over dark
  scenes (the default `test-bg.png` is a dim FBI-office scene). On a bright
  drop the white paint can wash into the backdrop. If the integrator's
  default is bright, swap to `mix-blend-mode: difference` or layer a 30%
  black wash behind the title.
- **Autoplay policy.** Most browsers only autoplay videos that are `muted`.
  The `<video>` element here is always muted. If you flip muted off, expect
  autoplay to silently fail.
- **iOS Safari + `playsInline`.** Without it, iOS forces video into a
  fullscreen native player and the menu chrome disappears.
- **Drag-drop on a slot with overlay children.** The `empty-hint` must stay
  `pointer-events: none` or the drop fires on the hint and
  `e.dataTransfer.files` is empty in some browsers.
- **`URL.createObjectURL` leaks.** Always revoke the previous URL before
  assigning a new one. `usePersistedMedia` does this via a ref.
- **React StrictMode double-mount.** `usePersistedMedia` runs its effect
  twice in dev. We guard with a `cancelled` flag so the first run's late
  resolution can't overwrite the second run's state.
- **Default media on Reset.** Reset clears IDB and reloads. The fetched
  default appears again because we never persist it.

---

## 11. Migration notes for the integrator

The handoff explicitly calls out these swap points:

1. Replace `usePersistedMedia` and IndexedDB with your save system. The
   contract is `getMedia(key)` / `setMedia(key, {blob, type})`.
2. Replace `useStageScale` with your engine's canvas scaler (Unity Canvas
   Scaler, `aspect-ratio` CSS, etc.) if you don't need fixed-pixel
   coordinates inside the stage.
3. Strip `ResetMediaButton` and `.empty-hint` for production once a real
   default backdrop ships.
4. Wire `onConfirm(item)` in `App.tsx` to your routing/scene-load logic.
   Keys are typed as `MenuKey` in `src/components/menu-items.ts`:
   `main | bonuses | options | store | exit`.
5. Re-export the Requiem PNG at the target resolution if you change the
   stage size. The current image is sized for the 1920×1080 stage at the
   logo's `720px` width.
