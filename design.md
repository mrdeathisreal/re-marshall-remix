# Design System — Resident Evil: Requiem Menu

A cinematic, single-screen main menu in the spirit of **Resident Evil: Requiem**.
Typewriter monospaced wordmark on a torn-paint vertical spine, drag-droppable
backdrop (image or looping video), and a minimal text-only menu where the
active row gets a stamped black highlight.

The stage is a fixed `1920×1080` canvas, scaled uniformly to fit any viewport
with letterbox bars. All chrome sits at absolute pixel positions inside the
stage; nothing reflows.

---

## Layering

| z-index | Layer                | Notes                                                              |
| ------- | -------------------- | ------------------------------------------------------------------ |
| 0       | `.bg-slot`           | User-supplied image or looping video, `inset:0`.                   |
| 2       | `.left-darken`       | Two stacked linear gradients (lighter than RE4 era, ~78% at left). |
| 5       | `.title-img`         | Static PNG logo, `mix-blend-mode: screen` to drop the black bg.    |
| 6       | `.menu`, `.footer-left`, `.watermark` | All UI chrome (text + keycap).                          |
| 7       | `.grain`             | Dual radial-gradient noise, `mix-blend-mode: overlay`, opacity 0.07. |
| 8       | `.flash`             | 380ms white pulse on confirm (peak 0.08 alpha).                    |

---

## Color tokens

| Token                 | Value                          | Usage                          |
| --------------------- | ------------------------------ | ------------------------------ |
| `--ink-primary`       | `#f1ece0`                      | Keycap border / logo highlight |
| `--ink-body`          | `#e9ecef`                      | Body baseline                  |
| `--ink-muted`         | `rgba(225, 222, 215, 0.78)`    | Idle menu items                |
| `--ink-faint`         | `rgba(240, 236, 224, 0.75)`    | Watermark                      |
| `--bg-base`           | `#05070a`                      | Stage base behind media        |
| `--overlay-shadow`    | `rgba(0, 0, 0, 0.9)`           | Text shadows everywhere        |

Tokens live in `src/styles/global.css` as CSS custom properties.

The accent red is **not used** in this direction — the loading bar was removed
to keep the Requiem screen quiet.

---

## Typography

Typewriter pairing — the entire UI uses a single distressed monospace family so
the menu reads like pages of an investigator's file.

| Family            | Where                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `Special Elite`   | Title image is pre-rendered; this is the family for everything else: menu items, description, keycap label, watermark, empty-state hint, reset button. |
| `Cutive Mono`     | Fallback when Special Elite hasn't loaded yet.                       |
| `Courier New`     | System fallback.                                                     |

Loaded via Google Fonts in `index.html`. No serif and no condensed-sans fallback
— the typewriter look is non-negotiable.

### Typographic scale (px @ 1920×1080)

| Element             | Family         | Size | Weight | Letter-spacing | Transform |
| ------------------- | -------------- | ---- | ------ | -------------- | --------- |
| Menu item (idle)    | Special Elite  | 24   | 400    | 0.02em         | —         |
| Menu item (active)  | Special Elite  | 24   | 400    | 0.02em         | —         |
| Description         | Special Elite  | 22   | 400    | 0.01em         | —         |
| Key row label       | Special Elite  | 20   | 400    | 0.02em         | —         |
| Keycap glyph (`F`)  | Special Elite  | 16   | 400    | —              | —         |
| Watermark           | Special Elite  | 22   | 400    | 0.06em         | —         |
| Empty-state hint    | Special Elite  | 20   | 400    | 0.10em         | UPPER     |
| Reset Media button  | Special Elite  | 11   | 400    | 0.10em         | UPPER     |

The title is delivered as a static **PNG image** (`public/assets/requiem-logo.png`)
rendered with `mix-blend-mode: screen`. The image already contains:

- "RESIDENT EVIL" word-mark (typewriter, letter-spaced)
- "requiem" headline with grunge paint streak behind it
- The vertical white painted spine that runs down the left edge

The vertical spine is therefore not a separate DOM element.

---

## Spacing & geometry

- Stage: `1920 × 1080` design canvas.
- Title image: `left: 110px`, `top: 200px`, `width: 720px` (height auto).
- Menu: `left: 190px`, `top: 660px`, `width: 460px`, vertical gap `8px`.
- Menu item padding: `4px 22px 5px 14px` (extra right padding so the active
  black highlight has breathing room at the end of the word).
- Footer-left: `left: 190px`, `bottom: 70px`, vertical gap `12px` between
  description and key row.
- Watermark: `right: 60px`, `bottom: 44px`.
- Keycap: `28×28px` square with `1.6px` border, no radius.

Radii: only `4px` on the reset button. Keycap and active highlight are sharp.

---

## Shadows & glows

- Text shadow (everything readable): `0 2px 10px rgba(0, 0, 0, 0.9)`.
- Title image: `drop-shadow(0 6px 26px rgba(0, 0, 0, 0.9))` lifts the white
  paint off the backdrop without softening the torn edges.
- Keycap: `0 2px 8px rgba(0, 0, 0, 0.7)` so the cap reads as embossed.
- Active menu item: solid `rgba(0, 0, 0, 0.85)` highlight, no glow.

---

## Motion

| Name      | Duration | Easing                          | What it does                                                  |
| --------- | -------- | ------------------------------- | ------------------------------------------------------------- |
| `flash`   | 380ms    | ease-out                        | White pulse (0 → 0.08 → 0 alpha) over the stage on confirm.   |
| Menu hover| 220ms    | ease                            | `color` + `background-color` transitions.                     |
| Menu nudge| 260ms    | `cubic-bezier(0.2, 0.7, 0.2, 1)`| `translateX(4px)` slide on active.                            |

No background loops, no breathing vignette, no ECG loading bar — the
Requiem direction is **dead still** by design.

---

## Interaction

### Mouse
- Hovering any menu item activates it (no debounce — instant).
- Clicking confirms (pulses the flash overlay + fires `onConfirm`).

### Keyboard
- `ArrowDown` / `ArrowUp` — move selection. Wraps at edges.
- `F` / `f` / `Enter` / `Space` — confirm current selection.

### Media drop zone
- `dragenter` / `dragover` — slot gets `.drag-over` class (white outline + "DROP TO REPLACE" overlay).
- `drop` — if first file is `image/*` or `video/*`, render and persist to IndexedDB.
- Click anywhere on the slot to open the native file picker.

### Default backdrop
- On first load (no IndexedDB entry), the slot fetches `/assets/test-bg.png`
  and uses it as a temporary backdrop. The default is **not written to
  IndexedDB** — clicking Reset Media restores it.

### Media defaults
- Video: `autoplay`, `loop`, `muted`, `playsInline`, `preload="auto"`.
- Image: `<img>` with `object-fit: cover`.

### Resize
- Stage transform recomputed on every `resize` to `scale(min(vw/1920, vh/1080))`.

### Reset
- Dev-only "RESET MEDIA" button (top-left, opacity 0.35 → 1 on hover) clears
  the IndexedDB store and reloads.

---

## State

Client-only, minimal.

| Key            | Type            | Where                                    | Notes                                  |
| -------------- | --------------- | ---------------------------------------- | -------------------------------------- |
| `activeIndex`  | `number`        | `App` state, passed to `Menu` (controlled) | Default `0` (Main Story). Drives both the highlighted menu row and the description shown in `FooterLeft`. |
| `mediaBlob`    | `Blob \| null`  | IndexedDB `re-menu-media / slots / bg`   | User-dropped image/video, survives reload. |

No remote data. No async fetches except the default backdrop on first load.

---

## Component map

| Component            | Path                                       | Owns                                                       |
| -------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `App`                | `src/App.tsx`                              | Composition, `activeIndex` state, flash wiring             |
| `Stage`              | `src/components/Stage.tsx`                 | Scale-to-fit viewport                                      |
| `MediaSlot`          | `src/components/MediaSlot.tsx`             | Drop/click/drag overlay, render media                      |
| `TitleImage`         | `src/components/TitleImage.tsx`            | `<img>` with `mix-blend-mode: screen`                      |
| `Menu`               | `src/components/Menu.tsx`                  | Item list, hover/keyboard nav, confirm (controlled)        |
| `FooterLeft`         | `src/components/FooterLeft.tsx`            | Description line + `[F] Confirm` keycap                    |
| `Watermark`          | `src/components/Watermark.tsx`             | Bottom-right "mrdeathisreal"                               |
| `Chrome` (LeftDarken / Grain) | `src/components/Chrome.tsx`       | Cinematic gradients + film grain                           |
| `FlashOverlay`       | `src/components/FlashOverlay.tsx`          | Imperative `.pulse()`                                      |
| `ResetMediaButton`   | `src/components/ResetMediaButton.tsx`      | Dev affordance: wipe IndexedDB                             |
| `useStageScale`      | `src/hooks/useStageScale.ts`               | window-resize → scale factor                               |
| `usePersistedMedia`  | `src/hooks/usePersistedMedia.ts`           | Load saved media on mount with optional default URL        |
| `media-db`           | `src/lib/media-db.ts`                      | `idb`-backed persistence                                   |

---

## Menu data

Authoritative list in `src/components/menu-items.ts`:

| Key       | Label         | Description                                         |
| --------- | ------------- | --------------------------------------------------- |
| `main`    | Main Story    | Play through the main story and face the past.     |
| `bonuses` | Bonuses       | View unlockable content and extras.                |
| `options` | Options       | Adjust audio, video, and controls.                 |
| `store`   | Online Store  | Browse additional content online.                  |
| `exit`    | Exit          | Return to the desktop.                             |

---

## Accessibility notes

- Stage chrome (left-darken, grain, title image, watermark) is `pointer-events: none`
  and either `aria-hidden` or alt-tagged. The title image has a proper `alt`.
- Menu is a real `<nav><ol>` with `aria-label="Main menu"`. Items are `<li>`
  and keyboard-controlled at the window level (Up/Down/Enter/Space/F).
- Media slot is a `role="button"` with `aria-label`. Click opens a file picker
  so keyboard users without drag-drop can still set media.

---

## Assets

| Path                              | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `public/assets/requiem-logo.png`  | The full Requiem wordmark (RESIDENT EVIL + requiem + spine).  |
| `public/assets/test-bg.png`       | 1920×1080 placeholder backdrop — used until the user drops their own. |

---

## What to swap when wiring into a real game

1. **Menu items currently no-op.** `onConfirm` receives the keyed item; route from
   there into your scene loader / state machine.
2. **`test-bg.png` is a dev placeholder.** Replace with the production
   intro-video / hero image, or remove the default entirely once you ship.
3. **`IndexedDB` persistence** is overkill for production. Drop it once the
   backdrop is a bundled default or part of the build.
4. **Scale-to-fit** can be replaced by CSS `aspect-ratio: 16/9` if you don't
   need fixed-pixel coordinates inside the stage.
