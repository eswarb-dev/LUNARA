# Lunara UI Theme Guide

> A private moonlit emotional journal. The interface should feel like opening a personal diary at night under soft moonlight — calm, celestial, premium, and deeply private.

---

## 1. Product Identity

**Name:** Lunara  
**Display:** "LUNARA" as wordmark/logo only. All other contexts use "Lunara."  
**Full descriptor:** Lunara — Moonlit Emotional Journal  
**Short descriptor:** Private Moonlit Diary  
**Tagline:** "Reflect softly. Heal privately."  
**Personality:** Quiet, intimate, poetic, trustworthy. Lunara is not a social media platform — it is a personal sanctuary. Every visual and written element should reinforce privacy, calm, and emotional safety.

**Supporting microcopy (optional, not mandatory):**
- "Your thoughts, held under quiet stars."
- "A private diary beneath soft moonlight."
- "Write where the night feels safe."
- "Open your thoughts under moonlight."

**Product direction:** Private diaries, not public publishing. Users create private diaries, write inside them, continue editing, and share only with trusted users by Lunara user ID.

**Core concepts:**
- **Diary** — a private book the user owns, stored as one row in `diary_entries`. Has a title (name) and description. Never called "entry" or "post."
- **Page** — a visual page inside a diary. One diary has many visual pages, but remains one Supabase row. Page titles are stored in content metadata, not in the database.
- **Shared diary** — a diary the user has shared with a trusted person, or one shared with them. Managed through `diary_shares` table.

**Why "diary" not "entry":**  
The word "entry" suggests a public blog post or database record. "Diary" reinforces the private, emotional, book-like metaphor.

**Naming rules:**
- Use "Lunara" in normal UI text.
- Use "LUNARA" only where a logo/wordmark style is needed.
- Never rename the app to LUNAR.
- Never rename "Lunara ID" to "Lunar ID."
- Keep the existing user ID format as `LUNA-XXXXXX` unless a separate backend migration is explicitly requested.

---

## 2. Brand Voice

The voice of Lunara is **poetic, warm, and quietly encouraging**. It sounds like a thoughtful friend who respects your space.

### Writing tone
- calm
- private
- poetic
- safe
- minimal
- emotionally soft

### Good copy examples

| Context | Good copy |
|---|---|
| Tagline | "Reflect softly. Heal privately." |
| Tab label | "My diaries" |
| Empty state | "No shared diaries yet." |
| Shared state | "Diaries trusted with you." |
| New diary CTA | "Begin your first private book" |
| Privacy note | "Your words stay private unless you choose to share." |
| Save action | "Save diary" |
| Open action | "Open diary" |
| Share action | "Share with a trusted reader" |
| Loading | "Gathering your diaries..." |
| Error | "Could not load your diaries. Please try again." |
| Settings subtitle | "Customize your moonlit journal experience" |
| Rail footer | "Reflect softly. Heal privately." |
| Profile subtitle | "A quiet place for your thoughts" |
| Find People | "Find a trusted reader by Lunara ID." |
| Profile card | "Lunara profile · Trusted identity" |

### Words to avoid

| Never use | Why |
|---|---|
| Dashboard | This is a journal, not a control panel |
| Publish | Diaries are private by default |
| Public post | No public publishing exists |
| Feed | No social feed |
| Database | User-facing code must not expose storage terms |
| API failed | Use poetic error language instead |
| Admin | No admin panel |
| Submit form | Too corporate |
| Content management | Too CMS-like |
| Entry | Use "diary" instead |
| Post | Use "diary" instead |
| Workspace | Too SaaS-like |

---

## 3. Core Visual Theme

Lunara should feel like opening a private diary at night under soft moonlight. The interface combines a physical diary/book experience with subtle celestial details — crescent moons, faint constellations, pearl paper, silver-blue shadows, warm moon-gold highlights, and quiet star details.

**Keywords:** Moonlit, celestial, private, night-sky, soft stars, pearl paper, quiet moonlight, deep navy, silver ink, premium, emotional, minimal, personal sanctuary.

**Visual ingredients:**
- moonlit paper surfaces (pearl, not sepia)
- deep navy backgrounds and rails
- silver-blue dividers, icons, and borders
- ink-blue typography on paper surfaces
- soft moon-gold highlights (rare, gentle)
- faint constellation line accents (corners, dividers)
- crescent moon as brand emblem
- subtle star-speckle pattern at very low opacity
- subtle layered shadows with silver-blue tone
- restrained, barely-perceptible animation

---

## 4. Color Palette

### Core Palette

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Lunara Night | `#0B1020` | `lunara-primary` | Main brand dark, left rail, deep backgrounds |
| Deep Moon Navy | `#121A2E` | custom | Secondary dark surfaces, cover shadows, spine |
| Moon Paper | `#F7F0E6` | custom | Diary pages, cards, readable surfaces (moonlit paper, not sepia) |
| Pearl Mist | `#E8EDF7` | custom | Light text on dark backgrounds |
| Lunara Silver | `#D8E3F0` | `lunara-silver` | Dividers, icons, subtle borders on dark surfaces |
| Muted Stardust | `#A8A6C7` | custom | Secondary text, disabled details, placeholders on dark |
| Moon Gold | `#FDE68A` | `lunara-glow` | Gentle highlights, focus glow, tiny ornaments only |
| Soft Lavender | `#A78BFA` | `lunara-accent` | Rare accent only — never dominant |
| Ink Blue | `#2C3E50` | `text-ink-blue` | Main text on paper surfaces |
| Lunara Blue | `#60A5FA` | `lunara-blue` | Links, secondary actions on dark backgrounds |

### Legacy Colors (Reduced Usage)

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Muted Brown | `#8B7355` | `text-muted-brown` | Reduced — replace with Lunara Silver / Muted Stardust where possible. Retain for specific border accents. |
| Forest Green | `#2D5A27` | `text-forest-green` | Deprecated for primary CTA. Keep only if existing code references it. New actions use Lunara Night. |

### Error / Destructive

| Token | Hex | Usage |
|---|---|---|
| Error Rose | `#B91C1C` | Destructive buttons, error text, remove photo confirmation. Use sparingly. |
| `destructive` CSS var | `hsl(0 84.2% 60.2%)` | Reserved for system destructive states |

### Palette Rules
- **Primary app actions** use Lunara Night or Deep Moon Navy — not forest green.
- **Moon Gold** is only for highlights, not full button backgrounds.
- **Soft Lavender** should be rare and muted, never a dominant color.
- **Moon Paper** stays as the readable surface, but feels like moonlit paper — not old sepia paper.
- **Muted Brown** is reduced and replaced with Lunara Silver / Muted Stardust where possible.
- **Never use pure black** (`#000`) for text. Always use `ink-blue` (`#2C3E50`) or `lunara-primary` (`#0B1020`).
- **Never use pure white** (`#FFF`) for backgrounds. Always use `Moon Paper` or `cream`.

### Opacity Rules
- Main text on paper: full opacity (`text-ink-blue`)
- Main text on dark surfaces: `Pearl Mist` (`#E8EDF7`)
- Secondary text: `text-muted-brown` or `Muted Stardust`
- Placeholder text: `Muted Stardust/60` or `text-muted-brown/55` — soft but visible
- Disabled controls: `opacity-50` with `cursor-not-allowed`
- Decorative elements: `opacity-20` to `opacity-40`

---

## 5. Typography System

### Font Stack

| Role | Family | Tailwind | Fallback |
|---|---|---|---|
| Headings, diary writing, emotional copy, form inputs | EB Garamond | `font-garamond` | `serif` |
| Small utility labels, badges, metadata | Inter | `font-inter` | `sans-serif` |

### Usage Rules
- **EB Garamond** for: headings, body text, diary writing textarea, form inputs, buttons, dialog titles, quotes, taglines, card content, nav labels
- **Inter** for: small badges, metadata timestamps, word counts, system labels where Garamond would be too decorative
- **No monospace** for UI unless displaying code content intentionally
- **No all-caps** for headings — the tone is poetic, not corporate
- **Italic** (`font-style: italic`) reserved for quotes, taglines, and the "handwritten" feel

### Recommended Sizes

| Element | Size | Weight | Class |
|---|---|---|---|
| Page heading (section title) | `text-3xl` (1.875rem) | `font-medium` to `font-bold` | `font-garamond text-3xl font-medium text-ink-blue` |
| Section heading | `text-xl` to `text-2xl` | `font-medium` | `font-garamond text-xl font-medium text-ink-blue` |
| Diary cover title | `clamp(2.2rem, 5vw, 3rem)` | `font-medium` | `.diary-cover-title` |
| Diary page title input | `clamp(2rem, 3vw, 3.2rem)` | `font-medium` | `.diary-title-input` |
| Page title (reader) | `clamp(1.2rem, 2.5vw, 1.6rem)` | `font-medium` | inline style |
| Body text / diary writing | `clamp(1.15rem, 1.3vw, 1.32rem)` | `font-normal` | `.diary-writing-textarea` |
| Sidebar nav | `text-sm` (0.875rem) | `font-medium` | `font-garamond text-sm font-medium` |
| Card title | `text-xl` | `font-medium` | `font-garamond text-xl font-medium text-ink-blue` |
| Button text | `text-sm` to `text-base` | `font-medium` | `font-garamond` on buttons |
| Metadata / date | `text-xs` to `text-[10px]` | `font-normal` | `font-garamond text-xs text-muted-brown` |
| Error messages | `text-sm` | `font-normal italic` | `font-garamond text-sm text-red-600 italic` |
| Form labels | `text-sm` to `text-base` | `font-medium` | `font-garamond text-ink-blue font-medium` |
| Cover subtitle | `0.95rem` | `font-normal italic` | `.diary-cover-subtitle` |
| Privacy note | `0.75rem` | `font-normal italic` | `.diary-cover-privacy` |

### Line-Height Rules
- **Diary writing textarea**: uses `--diary-line-height: 2.35rem` (desktop) or `2.1rem` (mobile)
- **Text baseline**: must align with diary ruled lines via `--diary-text-top-offset: 0.28rem`
- **Measurement div** (`.diary-page-measure`): must match textarea font, size, line-height, and padding exactly
- **Body paragraphs**: `line-height: 1.7` (set on `body` element)
- **Headings**: `line-height: 1.3`
- **Preview content**: matches textarea `line-height: var(--diary-line-height)`

### Text Alignment
- Body paragraphs: **justified** with `text-justify: inter-word` and auto hyphens
- Headings: **left-aligned** within diary pages, **center-aligned** in cover/status screens
- Card content: left-aligned
- Metadata: left-aligned or right-aligned (date in diary page)

### Mood Rule
- Headings should feel moonlit and elegant — EB Garamond on dark surfaces uses Pearl Mist, on paper surfaces uses Ink Blue
- Avoid overly pale text that reduces readability
- Readability is more important than faint aesthetic styling

---

## 5b. Background Design

### Workspace Background
- Right workspace uses `.lunara-celestial-workspace` with a full-bleed image layer behind all tab content.
- `.lunara-celestial-workspace` is the positioning context for the whole right pane: `position: relative`, `min-height: 100vh`, `width: 100%`, `min-width: 0`, and `overflow: hidden`.
- `LunaraCelestialBackground` must be mounted directly inside the right workspace, never inside the `max-width` / `mx-auto` tab content wrapper.
- Primary background asset should be `public/assets/lunara-moon-bg.webp`; fallback is `public/assets/lunara-moon-bg.jpg`, then the old low-resolution `public/assets/lunar lumina.jpg`.
- Recommended background resolution is 1920x1080 minimum, with 2560x1440 preferred.
- The old `lunar lumina.jpg` asset is fallback only because it is 639x360 and must not be stretched into a large wallpaper.
- High-quality moon artwork such as `lunara-moon-bg.webp` / `lunara-moon-bg.jpg` fills the right workspace with `object-fit: cover`.
- Use `object-fit: contain` only for the old low-resolution fallback if needed, so it does not become a visibly stretched wallpaper.
- Do not cap the high-quality image wrapper to the source dimensions; the image layer must be `position: absolute; inset: 0` and fill the workspace.
- The background image, overlays, and falling-star layer all span the full right pane with absolute full-inset sizing.
- Avoid visible image rectangles, letterboxing, centered poster blocks, or empty margins around the background.
- The image is scoped only to the right workspace; the left rail remains a separate deep navy navigation surface and must not receive this background.
- Use deep navy vignettes and dark radial overlays for readability; avoid heavy cream fog that washes out the artwork.
- Use dark overlay/vignette for readability instead of cream haze, and do not blur or heavily fade the main image.
- Do not use watermarked, copyrighted stock-watermarked, text-embedded, or protected stock images for the workspace background.
- Bare headings and subtitles over the image use Pearl Mist / Lunara Silver with subtle navy text shadow. Text inside moon-paper cards remains Ink Blue.
- The old fake `.lunara-moon-watermark` circle is disabled so it does not compete with the image moon. Any moon enhancement must be a subtle overlay glow only.
- Falling stars live only behind right workspace content through `.lunara-falling-stars` and `.lunara-falling-star`; they are lightweight CSS streaks adapted from the Uiverse falling-star idea.
- Falling stars are layered above the moon image/readability overlays and below all actual tab content, cards, forms, diary books, dialogs, and dropdowns.
- Tab content uses a relative z-index above the background system; ambient controls sit above content, and dialogs remain highest.
- Desktop uses 45-70 deterministic star streaks distributed across the full right workspace. Tablet keeps 28-40, and mobile keeps 16-24.
- Star starts vary from the top edge through the visible workspace so motion does not cluster only near the moon.
- Do not use the Uiverse card, button, wobble text, hover moon, galaxy button, body-level `:has()` effects, or other unrelated design pieces.
- Right workspace cards use reusable glass-moonpaper surfaces so the moon image remains visible while text stays readable.
- Use `.lunara-glass-card` for profile/stat tiles, `.lunara-panel-card` for larger settings/search/dialog panels, `.lunara-diary-card` for diary list items, `.lunara-field` for small ID/input display boxes, and `.lunara-page-heading-on-bg` / `.lunara-subtitle-on-bg` for text placed directly over the moon image.
- Diary list cards must feel like private moonlit diary covers or journal slips. They should use a responsive grid and must not stretch into full-width cream slabs when only one diary exists.
- Headings over the moon image need Pearl Mist contrast and a subtle navy text shadow; subtitles use readable Lunara Silver / Muted Stardust opacity.
- Diary writing pages stay clean moon-paper surfaces with no background animation inside the writing body.
- Ambient audio is optional, local-only, and manual-play only through `/audio/lunara-lofi.mp3`; the file must be user-provided or royalty-free.
- No full-screen galaxy wallpaper
- No galaxy poster, neon, external audio stream, canvas, video background, or heavy particle system
- Reduced-motion users keep the static moon atmosphere while falling-star movement is disabled and stars remain faint.

### Left Rail Background
- Deep Lunara Night gradient: `linear-gradient(180deg, #0B1020 0%, #0D1321 100%)`
- Subtle star speckles at very low opacity (0.03) are acceptable
- No galaxy or nebula effects

### Cover Background
- Moon-paper surface with optional moon-gold radial glow above
- Constellation corner lines are decorative, not animated
- Star dust pattern: `opacity: 0.03–0.06` — barely perceptible

### Writing Surface Background
- Pure moon-paper white — no star pattern inside writing area
- Ruled lines use Lunara Silver / Muted Stardust tone (not brown)
- Left page may show faint moon phase watermark at `opacity: 0.03`

### Rules
- Subtle star speckles are okay if opacity is very low (0.02–0.06)
- No animated backgrounds anywhere
- No gradient animations on surfaces
- Background depth comes from color contrast, not motion

---

## 5c. Iconography

### Celestial Icons (preferred)
- Moon / crescent — brand identity, header accents
- Stars — decorative, dividers, empty states
- Book — diary metaphor
- Feather / pen — writing action
- Lock — privacy/security
- Users — trusted sharing
- Compass / orbit — subtle navigation hints (use sparingly)

### Avoid
- Random flowers as main brand motif (floral elements deprecated)
- Dashboard icons (gauge, bar-chart, etc.)
- Loud social icons (heart, thumbs-up, share-arrow)
- Sci-fi symbols (circuits, hexagons, grids)

### Icon Style
- Lucide icons preferred (`lucide-react`)
- Size: `w-4 h-4` to `w-6 h-6`
- Color: `text-ink-blue` on paper, `text-lunara-silver` on dark surfaces
- Stroke width: default (1.5–2px)

---

## 6. Spacing and Layout Rules

### Global Dimensions

| Element | Value |
|---|---|
| Container max-width (write tab) | `max-w-[1400px]` |
| Container max-width (other tabs) | `max-w-5xl` (64rem / 1024px) |
| Container padding | `px-6 py-8 lg:px-12` |
| Left rail width | `w-56` (14rem / 224px) |
| Diary book max-width | `max-width: 1100px` |
| Diary book min-height | `min-height: 72vh` |
| Side controls width | ~280px (flex column beside diary) |
| Gap between diary and side controls | `gap-6` to `gap-8` |
| Card padding | `p-5` to `p-8` depending on card type |
| Dialog padding | `p-6` (via Radix DialogContent) |
| Mobile page padding | `px-4` to `px-6` |

### Layout Rules
- **Writing space must be dominant** — side controls must not squeeze the diary book
- **No horizontal overflow** — all content must contain within viewport
- **No huge blank top areas** — profile header must not appear above writing space
- **No congested UI** — let the design breathe with generous whitespace
- **Single focal point** — the diary page is always the visual center
- **Safe-area padding** on mobile: `env(safe-area-inset-bottom)` for bottom nav

---

## 7. Main App Layout

The app uses a **two-column layout on desktop**, **single-column on mobile**.

```
┌──────────────────────────────────────────────┐
│ Left Rail (Lunara Night)  │  Right Workspace  │
│ ┌──────────────────┐    │  ┌───────────────┐ │
│ │ LUNARA           │    │  │ Tab Content   │ │
│ │ ─────────────── │    │  │               │ │
│ │ Journal          │    │  │               │ │
│ │ My diaries       │    │  │               │ │
│ │ New diary        │    │  │               │ │
│ │ Shared           │    │  │               │ │
│ │ Settings         │    │  │               │ │
│ │                  │    │  │               │ │
│ │ ─────────────── │    │  │               │ │
│ │ Reflect softly.  │    │  └───────────────┘ │
└──────────────────────────────────────────────┘
```

### Tabs

| Tab ID | Label | Purpose | Content |
|---|---|---|---|
| `journal` | Journal | Profile overview, avatar, stats, recent diaries | `JournalOverview` |
| `diaries` | My diaries | Private diary list, search, open/share | `MyDiaries` |
| `write` | New diary | Cover screen → writing editor | `DiaryCoverStart` → `WriteEditor` |
| `shared` | Shared | Shared diaries list, Find People | `SharedDiaries` |
| `settings` | Settings | Profile info, preferences, export, logout | `ProfileSettings` |

### Tab Rules
- "New diary" tab always starts at the cover screen
- Opening an existing diary from "My diaries" navigates to `?tab=write&diaryId={id}` which loads `WriteEditor` directly (skips cover)
- Tab state managed in `Profile.tsx` via `activeTab` state
- Mobile: bottom navigation bar with 5 tab buttons

---

## 8. Journal Index Rail

**Component:** `JournalIndexRail.tsx`  
**Class:** `.journal-rail`

A fixed left navigation rail visible only on desktop (`hidden lg:flex`).

### Structure
- **Header:** "LUNARA" wordmark + "your private journal" subtitle
- **Ornamental divider:** silver gradient line with faint constellation accent
- **Nav items:** 5 buttons with icons (BookOpen, BookMarked, PenLine, Users, Settings)
- **Footer:** silver gradient divider + tagline "Reflect softly. Heal privately."

### Visual Style
- Width: `w-56` (224px)
- Background: `bg-lunara-primary` (deep navy gradient) — `linear-gradient(180deg, #0B1020 0%, #0D1321 100%)`
- Border-right: `border-lunara-silver/10`
- Sticky: `position: sticky; top: 0; height: 100vh`
- Hidden scrollbar: `scrollbar-width: none`
- Padding: `py-8 px-4`

### Active State
- Background: `bg-lunara-silver/10`
- Text: `Pearl Mist` (`#E8EDF7`)
- Border: `border-lunara-silver/20`
- Icon: `Pearl Mist`

### Inactive State
- Text: `text-lunara-silver/60`
- Hover: `hover:bg-lunara-silver/5 hover:text-pearl-mist`
- Icon: `text-lunara-silver/40`

### Mobile Behavior
- Hidden on mobile (`hidden lg:flex`)
- Replaced by bottom navigation bar: `fixed bottom-0 left-0 right-0 z-50`
- Bottom nav: `bg-lunara-primary/95 backdrop-blur-sm border-t border-lunara-silver/10`
- Tab buttons: `text-xs font-garamond` with active state `bg-lunara-silver/10 text-pearl-mist`

---

## 9. Journal Overview Page

**Component:** `JournalOverview.tsx`

The landing page when the Journal tab is active.

### Layout
- Centered heading: "Your journal space"
- Subtitle: "A quiet place for your thoughts"
- Ornamental divider with faint crescent accent
- Profile card with avatar, name, bio, Lunara ID, member date, diary count
- Stats grid (4 cards): Private diaries, Words written, Touched today, Moods tracked
- Recent diaries list (last 5)

### Profile Avatar
- Size: `w-28 h-28` (112px) circular
- Border: `border-2 border-lunara-silver/30`
- Camera button: `absolute -bottom-1 -right-1` (lunara-primary bg, moon-gold on hover)
- Remove button: `absolute -bottom-1 -left-1` (lunara-silver, error-rose on hover, only shown if avatar exists)
- Upload flow: choose image → crop dialog → Save photo → upload → update `avatar_url`
- **Never upload immediately** — always go through crop dialog first

### Remove Photo Flow
1. Click trash icon → opens confirmation `Dialog`
2. Title: "Remove profile photo?"
3. Message: "Your journal will return to the default avatar."
4. Buttons: Cancel (outline) | Remove photo (red)
5. Loading state: "Removing..." with disabled buttons
6. Error: "Could not remove your photo." shown in dialog

### Lunara User ID Display
- Format: `LUNA-XXXXXX` (6-char hex)
- Displayed with copy button (Check icon on copy)
- `text-sm font-garamond text-ink-blue font-medium`
- Background: `bg-moon-paper/80 border border-lunara-silver/20 rounded-lg`

### Safe Stats
- Total diaries count (not content)
- Total words (computed from `content.split(/\s+/).length`)
- Diaries touched today
- Moods tracked count
- **Never expose:** email, phone, private diary count in a sensitive way, mood details

---

## 10. New Diary Cover Flow

**Component:** `DiaryCoverStart.tsx`

When the user clicks "New diary" tab, they see the cover screen first.

### Cover Screen Elements
- **Shell:** `.diary-cover-shell` — moonlit paper card, max-width 420px, subtle silver-blue shadow
- **Crescent moon emblem:** centered above brand title, subtle moon-gold glow
- **Constellation corner accents:** 4 faint constellation line elements at corners (replaces floral SVGs)
- **Star dust pattern:** extremely faint star speckles on cover surface (opacity 0.03–0.06)
- **Moon glow:** radial gradient above cover (`.diary-cover-glow`) — moonlight effect, not warm candlelight
- **Brand:** "LUNARA" wordmark (`.diary-cover-title`), "Moonlit Emotional Journal" subtitle
- **Divider:** ornamental line with `☽` crescent character (replaces `❀` floral)
- **Tagline:** "Begin a new chapter"
- **Form fields:**
  - Diary name (required) — `.diary-cover-input`
  - Description (optional) — `.diary-cover-textarea`
- **Button:** "Open diary" — `.diary-cover-button` (Lunara Night gradient, not forest-green)
- **Privacy note:** "Your words stay private unless you choose to share."
- **Optional:** moon phase strip on spine edge

### Cover Visual Direction
- Deep navy or moon-paper cover variant
- Silver-blue shadows instead of brown
- Moon-gold ornamental highlights (rare, not dominant)
- Constellation line corners — geometric, faint, silver
- No flower-heavy corner SVGs
- No green-first action styling
- No brown/sepia dominance

### Cover Opening Animation
1. User fills name + description, clicks "Open diary"
2. Button shows spinner: "Opening..."
3. Cover gets `.diary-cover-opening` class → `scale(1.03)` + fade out (800ms)
4. `onComplete` fires with `(diaryId, title, description)`
5. Profile.tsx sets `newDiaryStep = 'transition'`
6. 600ms fade-in transition (`.diary-transition-fade-in`)
7. `WriteEditor` loads with the new diary

### Rules
- **Diary name is the book identity** — it names the whole diary, stored in `diary_entries.title`
- **Diary name must not become page title** — page titles are per-page, stored in content metadata
- **Description is diary metadata** — stored in `diary_entries.description`
- **Cover must fit within diary size** — no separate dashboard-like form card

---

## 11. Diary Title vs Page Title

This is a critical distinction.

### Diary Title
- **What:** The name of the entire diary/book
- **Stored in:** `diary_entries.title` (database column)
- **Appears in:** My diaries list, cover screen, side panel
- **Edited through:** Diary details dialog or cover edit
- **Example:** "College Memories", "Letters to Myself", "Travel Journal"

### Page Title
- **What:** A heading for a specific visual page inside the diary
- **Stored in:** Content metadata (`<!-- lunara-page-meta: {"pageTitles":[...]} -->`)
- **Appears in:** Above page content in both writer and reader
- **Never overwrites diary title**
- **Max length:** 80 characters
- **Example:** "Day one", "A quiet evening", "The beginning"

### Example
```
Diary title: College Memories
├── Page 1 title: "Day one"
├── Page 2 title: "A quiet evening"
├── Page 3 title: (untitled)
```

### Serialization
- Managed by `src/lib/diaryContent.ts`
- `serializeDiaryContent(pages, pageTitles)` — writes metadata comment into content
- `parseDiaryContent(rawContent)` — extracts page titles and pages from content
- `normalizePageTitles(prev, targetLength)` — syncs title array length with page count

---

## 12. Diary Book Writer

**Component:** `WriteEditor.tsx`

The core writing experience. An open-book visual with left and right pages.

### Visual Structure
```
┌─────────────────────────────────────────┐
│  [Write] [Preview]  ← bookmark tabs     │
├────────────────────┬────┬───────────────┤
│                    │    │               │
│   Left Page        │Spine│  Right Page   │
│   (previous page   │    │  (current     │
│    faded preview)  │    │   writing)    │
│                    │    │               │
├────────────────────┴────┴───────────────┤
│         Page Navigation (arrows)        │
├─────────────────────────────────────────┤
│  Side Controls (mood, tags, image...)   │
└─────────────────────────────────────────┘
```

### Book Components
- **`.diary-book-perspective`** — perspective container (1800px)
- **`.diary-book`** — flex container, max-width 1100px, centered
- **`.diary-book-stack`** — layered page edges behind main pages (z-index: 0), silver-blue tone
- **`.diary-spread`** — two pages side by side (z-index: 1)
- **`.diary-page-left`** — left page, `rotateY(1.5deg)`, shows previous page content faded
- **`.diary-page-right`** — right page, `rotateY(-1.5deg)`, current writing area
- **`.diary-spine`** — center gutter shadow, silver-blue tone
- **`.diary-page-curl`** — bottom-right corner curl hint with moonlight highlight

### Page Surface — Translucent Moon-Paper
Diary pages use translucent moon-paper, not bright white or dark glass:
```css
.diary-page-surface {
  background:
    linear-gradient(
      145deg,
      rgba(247, 240, 230, 0.68),
      rgba(232, 237, 247, 0.48)
    );
  backdrop-filter: blur(8px) saturate(1.02);
  border: 1px solid rgba(216, 227, 240, 0.22);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.30),
    inset 0 1px 0 rgba(232, 237, 247, 0.22);
}
```

### Title Input — Integrated with Page
Title input blends into the diary page, no dark block:
```css
.diary-title-input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(139, 115, 85, 0.18);
  color: #2C3E50;
}
.diary-title-input:focus {
  border-bottom-color: rgba(253, 230, 138, 0.5);
  box-shadow: 0 1px 0 0 rgba(253, 230, 138, 0.2);
}
```

### Global Input Override Exclusion
Diary page inputs/textareas are excluded from the global dark input style:
```css
.lunara-celestial-workspace .diary-page-surface input,
.lunara-celestial-workspace .diary-page-surface textarea,
.lunara-celestial-workspace .diary-writing-textarea,
.lunara-celestial-workspace .diary-title-input {
  background-color: transparent;
  border-color: transparent;
  color: #2C3E50;
}
```

### Left Page (Previous Content)
- Shows previous page content at 30% opacity, italic
- Includes previous page title if present
- Used for context while writing on the right page
- Hidden on mobile

### Right Page (Writing Area)
- **Date zone** (`.diary-page-date`) — top-right, formatted date
- **Title zone** (`.diary-title-zone`) — page title input (80 char max)
- **Toolbar zone** (`.diary-toolbar-zone`) — writing tools toggle
- **Page body** (`.diary-page-body`) — ruled writing surface with textarea
- **Footer** (`.diary-page-footer`) — page count, side controls toggle

### Write/Preview Tabs
- Styled as small moonlit paper tabs above the book (`.diary-tab-bookmark-strip`)
- **Write tab:** editing textarea
- **Preview tab:** ReactMarkdown rendered content
- Tab switch triggers page-turn animation (600ms, `rotateY(±8deg)`)

### Writing Rules
- **Textarea must not feel like Google Docs** — it's a ruled diary page
- **Ruled lines only inside writing body** — via CSS `repeating-linear-gradient`
- **Placeholder must align with first diary line** — via `--diary-text-top-offset`
- **Typed text must align with lines** — same font, size, line-height as lines
- **Measurement div must match textarea** — for overflow detection
- **No endless document scroll** — visual page capacity controls page splitting
- **Text selection must work** — explicit `user-select: text` on textarea and preview

### Ruled Line Variables
```css
--diary-line-height: 2.35rem;      /* desktop */
--diary-text-top-offset: 0.28rem;  /* baseline alignment */
--diary-margin-line-x: 3rem;       /* left margin line position */
```

Mobile overrides:
```css
--diary-line-height: 2.1rem;
--diary-text-top-offset: 0.5rem;
--diary-margin-line-x: 2.3rem;
```

---

## 13. Diary Page Pagination

### Architecture
- **Visual pages are UI-only** — one diary remains one `diary_entries` row
- **Page breaks** stored as `<!-- lunara-page-break -->` in content
- **Page metadata** stored as `<!-- lunara-page-meta: {"pageTitles":[...]} -->` prepended to content
- **Parser/serializer** lives in `src/lib/diaryContent.ts`

### Page Navigation
- **Desktop:** Previous/Next arrows (`.diary-page-arrow`) below the book
- **Desktop:** Bookmark tabs (`.diary-bookmark-tab`) on right edge
- **Mobile:** Previous/Next arrows + dot indicators (`.diary-page-dots`)
- Page count shown as "Page X of Y" (`.diary-page-count`)

### Navigation Behavior
- Click left page → go to previous page
- Click right page → go to next page
- Arrow buttons for explicit navigation
- Bookmark tabs for direct page access
- Page turn animation: 700ms, max 12° rotateY, respects `prefers-reduced-motion`

### Add Page
- "Add page" button appends empty page to `pages` array
- Page titles auto-synced via `normalizePageTitles`

---

## 14. Diary Side Controls

Side controls appear beside the diary book (desktop) or below it (mobile).

### Control Items
1. **Mood** — select dropdown for current mood
2. **Tags** — input for adding tags, displayed as badges
3. **Diary note / Description** — textarea for diary-level description
4. **Attach image** — file input for diary images (`.diary-image-slip`)
5. **Save diary** — Lunara Night primary button
6. **Share diary** — opens share dialog
7. **Diary details** — opens details/edit dialog

### Visual Style
- Each control is a `.diary-side-slip` — paper slip appearance
- Background: `linear-gradient(160deg, #F7F0E6 0%, #EDE5D8 100%)` (moonlit paper, not sepia)
- Left border accent: `3px` Lunara Silver gradient
- Border: `border-lunara-silver/10`
- Shadow: subtle `0 1px 4px rgba(11, 16, 32, 0.04)`

### Rules
- Side controls must look like paper slips, not dashboard widgets
- Must not overlap page arrows
- Image upload must not appear beside page navigation
- Save button uses Lunara Night primary style (not forest green)
- Side controls width: ~280px on desktop

---

## 15. Image Upload Design

### Profile Avatar Upload
1. User clicks camera button on avatar
2. File picker opens (accept: PNG, JPEG, WebP)
3. Validation: file type, max 5MB
4. `ProfileImageCropDialog` opens with selected file
5. User adjusts crop (circular shape), zoom, rotate
6. Clicks "Save photo"
7. Cropped to 512×512 WebP at 0.9 quality
8. Uploaded to `avatars` bucket: `{userId}/avatar.webp` (upsert)
9. `avatar_url` updated in `profiles` table
10. User state refreshed

**Cancel must not upload.**

### Diary Image Upload
1. User clicks "Attach image" in side controls
2. File picker opens
3. Image uploaded to `diary-images` bucket: `{userId}/{diaryId}/{timestamp}.{ext}`
4. Markdown reference inserted: `![filename](storage://path)`
5. Content saved with `storage://` reference
6. At render time, `useResolvedImages` hook resolves to signed URLs
7. `diary-images` bucket is **private** in production

### Storage Paths
```
avatars:        {userId}/avatar.webp
diary-images:   {userId}/{diaryId}/{timestamp}.{ext}
```

### Signed URL Resolution
- `diaryImageService.ts` — `resolveDiaryImageUrls()` extracts `storage://` markers
- Checks access via `diary_entries` + `diary_shares` tables
- Generates signed URLs (1 hour expiry)
- `useResolvedImages` hook — React hook that resolves content before rendering

---

## 16. Dialog Boxes and Modals

All dialogs use Radix UI `Dialog` primitive with custom Lunara styling.

### Common Dialog Styling
- **Overlay:** `bg-lunara-primary/80` with fade animation
- **Content:** moonlit paper card, `border-2 border-lunara-silver/20 bg-moon-paper max-w-sm` to `max-w-lg`
- **Title:** `font-garamond text-xl text-ink-blue`
- **Description:** `font-garamond text-muted-brown italic`
- **Buttons:** Lunara Night primary, Lunara Silver outline secondary
- **Close button:** top-right X icon, `opacity-70`

### Dialogs in the App

| Dialog | Trigger | Purpose |
|---|---|---|
| Profile Image Crop | Camera button | Crop before upload |
| Remove Photo Confirm | Trash icon | Confirm avatar removal |
| Diary Details | "Diary details" side control | Edit diary title/description |
| Share Diary | "Share diary" side control | Share with Lunara user |
| Find People Result | Search in Shared tab | Profile preview card |

### Rules
- Focus trapped within dialog
- Escape key closes dialog
- Overlay click closes dialog
- Destructive actions require confirmation
- Loading states disable all buttons

---

## 17. Buttons and Controls

### Button Types

| Type | Class | Style |
|---|---|---|
| Primary | `.lunara-button` | Lunara Night gradient, Pearl Mist text, moon-gold hover glow |
| Secondary | Shadcn `variant="outline"` | Lunara Silver border, Ink Blue text |
| Destructive | `bg-error-rose hover:bg-error-rose/90` | Error Rose background, white text |
| Ghost | Shadcn `variant="ghost"` | No border, muted text |
| Icon | `size="sm" rounded-full` | Circular, Lunara Silver border |
| Page Arrow | `.diary-page-arrow` | Circular, Moon Paper bg, Lunara Silver border |

### Lunara Primary Button Details
- Background: `linear-gradient(135deg, #121A2E 0%, #0B1020 100%)`
- Text: `#E8EDF7` (Pearl Mist)
- Border: `1px solid rgba(216, 227, 240, 0.25)`
- Shadow: `0 2px 4px rgba(11, 16, 32, 0.15)`
- Hover: `translateY(-1px)` + shadow deepens + subtle moon-gold edge glow
- Focus: soft moon-gold ring
- Disabled: `opacity-50 cursor-not-allowed`

### States
- **Default:** full color
- **Hover:** gentle lift (translateY -1px) + shadow deepen + moon-gold edge hint
- **Focus-visible:** `outline: 2px solid rgba(253, 230, 138, 0.4)` + `outline-offset: 2px`
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Loading:** spinner in button text, button disabled

---

## 18. Forms and Inputs

### Input Styling
- Background: `bg-moon-paper/80`
- Border: `border-2 border-lunara-silver/25`
- Border-radius: `rounded-xl` (Shadcn) or `rounded-lg` (cover inputs)
- Focus: `border-ink-blue` with `ring-lunara-silver/20`
- Font: `font-garamond` — even inputs feel like moonlit journal surfaces
- Height: `h-12` to `h-14` (responsive)

### Cover Input Styling
- Background: `rgba(247, 240, 230, 0.6)` (Moon Paper translucent)
- Border: `1px solid rgba(216, 227, 240, 0.2)` (Lunara Silver)
- Focus: `border-color: rgba(44, 62, 80, 0.3)` + `box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.06)`
- Font: `font-garamond text-ink-blue`

### Max Lengths

| Field | Max Length |
|---|---|
| Diary name | No hard limit (but reasonable, ~100 chars) |
| Diary description | No hard limit (but reasonable, ~500 chars) |
| Page title | 80 characters (enforced with `maxLength` + `.slice()`) |
| Lunara user ID | Format: `LUNA-[A-Z0-9]{6}` (auto-generated, not user-editable) |
| Search input | No limit (auto-uppercased) |

### Validation Messages
- Invalid format: "This looks like an invalid Lunara ID."
- Not found: "No Lunara profile found."
- Empty input: "Enter a Lunara ID."
- Network error: "Could not search right now."

---

## 19. My Diaries Page

**Component:** `MyDiaries.tsx`

### Layout
- Heading: "My diaries"
- Subtitle: "Your private books"
- Search input (optional)
- Diary cards list
- Empty state with ornamental divider

### Diary Card
- Title: `font-garamond font-medium text-ink-blue`
- Description or content excerpt (160 chars max, metadata stripped)
- Updated date
- Mood badge if present
- Word count
- Actions: open, share

### Empty State
- Ornamental divider
- BookMarked icon
- "No diaries yet."
- "Begin your first private book."

### Rules
- **No public/publish language**
- **No feed-style layout**
- Cards should feel like private diary covers or journal slips
- Excerpt uses `stripMetadataForDisplay()` to hide `<!-- lunara-page-meta -->` comments

---

## 20. Shared Diaries Page

**Component:** `SharedDiaries.tsx`

### Layout
Two sections:

1. **Find People** — search by Lunara ID (at top)
2. **Shared diaries** — list of diaries shared with the user

### Find People Section
- Card: `border-2 border-lunara-silver/20 bg-moon-paper p-6 md:p-8`
- Heading: "Find people" with UserPlus icon
- Subtitle: "Find a trusted reader by Lunara ID."
- Input: auto-uppercased, placeholder "LUNA-FF6A23"
- Button: "Find" (Lunara Night primary)
- States: idle, searching, found, not-found, invalid, error, self

### Profile Result Card
When found, shows:
- Avatar (circular)
- Full name
- Lunara user ID with copy button
- "Member since {date}"
- "Diaries shared with you: {count}"
- "Your shared diaries with them: {count}"
- Label: "Lunara profile · Trusted identity"

### Shared Diary Cards
- Title: diary title
- Owner name (from `share.owner.full_name`)
- Permission badge: "Can edit" (Lunara Night) or "Read only" (ink-blue)
- Excerpt with metadata stripped
- Word count, share date
- Click to open diary

### Empty State
- Users icon
- "No shared diaries yet."
- "When someone trusts you with their words, they will appear here."

### Privacy Rules
- **Never show email**
- **Never show phone**
- **Never show private diary count**
- **Never show diary content from search**
- **Never allow broad public user browsing**
- **Exact Lunara ID search only**
- **Never rename Lunara ID to Lunar ID**
- **Never change LUNA-XXXXXX format during UI work**

---

## 21. Diary Reader

**Component:** `DiaryBookReader.tsx`

A read-only view of diary content, using the same visual book system as the writer.

### Features
- Same diary book visual (left page + spine + right page)
- Markdown rendered safely using `ReactMarkdown` + `rehype-sanitize`
- Page titles shown if present (from metadata)
- **No diary title fallback as page title** — diary title is never shown as a page title
- Previous/next navigation
- Bookmark tabs
- Mobile dots
- Image resolution via `useResolvedImages` hook

### Access Behavior
- **Owner:** can view own diaries
- **Shared user:** can view diaries shared with them (via `diary_shares` table)
- **Unrelated user:** no access (RLS enforced)

---

## 22. Settings Page

**Component:** `ProfileSettings.tsx`

### Sections
1. **Lunara User ID** — display + copy button
2. **Profile Information** — display name, email (disabled), bio
3. **Preferences** — accent color, language, daily reminder toggle
4. **Export Data** — download JSON
5. **Logout** — red outline button

### Styling
- Max-width: `max-w-4xl`
- Each section: `border-2 border-lunara-silver/20 bg-moon-paper p-8`
- Section icons: `w-6 h-6 text-ink-blue`
- Section headings: `text-2xl font-garamond font-bold text-ink-blue`

---

## 23. Animation Rules

### Allowed Animations

| Effect | Class/Keyframe | Duration | Notes |
|---|---|---|---|
| Cover fade-in | `.diary-cover-fade` | 700ms | opacity + translateY |
| Cover opening | `.diary-cover-opening` | 800ms | scale + fade out |
| Cover-to-book transition | `.diary-transition-fade-in` | 600ms | scale + translateY |
| Book opening | `.diary-book-open` | 800ms | scale 0.96→1 |
| Page turn forward exit | `.page-turn-forward-exit` | 700ms | rotateY(0→-12deg) |
| Page turn forward enter | `.page-turn-forward-enter` | 700ms | rotateY(12deg→0) |
| Page turn backward exit | `.page-turn-backward-exit` | 700ms | rotateY(0→12deg) |
| Page turn backward enter | `.page-turn-backward-enter` | 700ms | rotateY(-12deg→0) |
| Tab turn exit | `.diary-tab-turn-exit` | 600ms | rotateY(0→-8deg) |
| Tab turn enter | `.diary-tab-turn-enter` | 600ms | rotateY(8deg→0) |
| Star dust drift | `starDustDrift` | 8s loop | translateY + opacity oscillation |
| Moon glow pulse | `moonGlow` | 6s loop | opacity + scale |
| Button hover lift | `translateY(-1px)` | 200-300ms | shadow deepen + moon-gold hint |
| Button shimmer | `.lunara-button::before` | 500ms | left -100%→100% |
| Fade in (general) | `fade-in` | 800ms | opacity + translateY |
| Gentle float | `gentle-float` | 6s loop | translateY oscillation |

### Strictly Avoid
- confetti
- particles
- bounce / elastic / spring physics
- neon glow / pulsing colors / flashing
- full 3D flipbook
- fast motion
- gaming-style transitions (spins, zooms)
- loading spinners that look like sci-fi scanners
- animation duration longer than 1 second for UI transitions

### Reduced Motion
All animations respect `prefers-reduced-motion: reduce`:
- Page turn animations: `animation: none !important`
- Cover fade: transform disabled, opacity-only transition (300ms)
- Cover opening: reduced to 400ms opacity-only
- Star dust drift / moon glow: `animation: none`
- Button hover: transition reduced to `opacity 0.15s ease`

---

## 24. Responsive Design

### Desktop (≥1024px)
- Fixed left rail (`w-56`) with deep navy gradient + right workspace
- Open book spread (left page + spine + right page)
- Side controls beside diary
- Bookmark tabs on right edge
- Full cursor hints (w-resize / e-resize)

### Tablet (768px–1023px)
- Left rail hidden
- Bottom navigation bar
- Book scales proportionally
- Side controls may stack below
- Toolbar scrollable if needed

### Mobile (<768px)
- Single page diary mode (left page hidden)
- Bottom arrows/dots navigation
- Side controls below the diary
- No fixed elements covering input
- No horizontal overflow
- Safe-area padding for bottom nav
- Ruled lines tighter: `--diary-line-height: 2.1rem`
- Bookmark tabs hidden
- Spine hidden
- Cover shell: full-width with `margin: 0 1rem`

### Mobile Breakpoints
- `lg` (1024px): rail shows, spread shows
- `md` (768px): general responsive adjustments
- `sm` (640px): cover shell adjustments

---

## 25. Accessibility Rules

- **Keyboard navigation:** all interactive elements must be focusable
- **Focus-visible styles:** `outline: 2px solid rgba(253, 230, 138, 0.4)` + `outline-offset: 2px`
- **ARIA labels:** icon buttons must have `aria-label` (e.g., "Change profile photo", "Remove profile photo")
- **Dialog focus management:** focus trapped within dialog, returned to trigger on close
- **Text selection:** explicitly enabled via `user-select: text` on textarea, preview, inputs
- **Reduced motion:** all animations respect `prefers-reduced-motion: reduce`
- **Readable contrast:** ink-blue (`#2C3E50`) on cream (`#FBF4EA`) = contrast ratio ~7:1
- **Form labels:** all inputs have associated labels or placeholders
- **Button disabled states:** `opacity-50 cursor-not-allowed` + `disabled` attribute

---

## 26. Supabase-Aware UI Rules

### Data Model Implications
- `profiles.avatar_url` — displayed in JournalOverview, SharedDiaries profile cards
- `profiles.lunara_user_id` — displayed in profile, used for sharing and Find People
- `diary_entries` — each row is one private diary (not one page)
- `diary_shares` — controls who can view/edit which diaries
- `diary-images` bucket — **private**, images accessed via signed URLs
- `avatars` bucket — **public**, direct URL access

### RLS Implications
- Users can only see their own diaries (via `user_id = auth.uid()`)
- Shared users can see diaries where `diary_shares.shared_with_user_id = auth.uid()`
- Profile search uses `find_lunara_profile()` RPC (security definer)
- Storage SELECT on `diary-images` requires owner match or share record

### No Public Publishing
- `is_public` field exists on `diary_entries` but is not used in UI
- No public diary views
- No public profile pages
- No social features

---

## 27. Auth Password Reset

### Auth Field Styling

- Login/register/reset password inputs use `.lunara-auth-field`, not the workspace `.lunara-field`.
- Auth fields are dark moon-glass surfaces with Pearl Mist text, Lunara Silver placeholders, subtle Lunara Silver borders, and a soft Moon Gold focus glow.
- Chrome autofill must keep the dark moon-glass look. Do not allow autofill to create a bright gray, white, or yellow password field.
- Labels stay readable and calm: Garamond, Lunara Silver, medium weight, not oversized.

### Forgot Password Flow

- Login includes a keyboard-accessible "Forgot password?" action near the password label.
- The reset request is an in-card mode, not a browser alert and not a separate unthemed popup.
- Reset request copy must be generic and must not reveal whether an account exists for an email.
- Success message: "If an account exists for this email, a reset link has been sent."
- Supabase call: `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })`.

### Reset Password Page

- Public route: `/reset-password`.
- Page: `src/pages/ResetPassword.tsx`.
- Uses the same moon background/card language as Login.
- Requires a Supabase reset-link session before calling `supabase.auth.updateUser({ password })`.
- If no session is present, show: "Your reset link may have expired. Please request a new one."
- Validate required password, minimum 8 characters, and matching confirmation before update.

### Supabase Redirect URLs

In Supabase Dashboard, open **Authentication -> URL Configuration -> Redirect URLs** and add:

- Local: `http://localhost:8080/reset-password`
- Production: `https://YOUR-VERCEL-DOMAIN/reset-password`

Do not hardcode a production redirect domain unless the deployed domain is known.

---

## 28. Full-Page Moon Loader

The full-page loading screen uses a moonlit celestial theme with a centered eclipse animation.

### Component

`src/components/common/LunaraPageLoader.tsx`

- Full viewport overlay (`position: fixed; inset: 0`)
- Background: `/assets/lunara-moon-bg.webp` with fallbacks to `.jpg` then `lunar lumina.jpg`
- Background fit: `object-fit: cover` — fills entire viewport, no letterboxing
- Overlay: dark navy gradient with subtle moon-gold radial glow
- Content: centered eclipse loader + "Loading..." text + optional subtitle
- Uses `role="status"` and `aria-live="polite"` for screen readers

### Eclipse Animation

- `.lunara-eclipse-loader`: 96px moon circle (Pearl Mist gradient, silver border, moon-gold glow)
- `.lunara-eclipse-shadow`: dark navy circle (120px) sweeps across moon
- Animation: `lunara-eclipse-pass` — 3s ease-in-out infinite loop
- Shadow moves from right to left, creating eclipse effect

### CSS Classes

| Class | Purpose |
|---|---|
| `.lunara-page-loader` | Full viewport container, z-index 9999, `position: fixed` |
| `.lunara-page-loader-bg` | Absolute-positioned image wrapper |
| `.lunara-page-loader-overlay` | Navy gradient overlay for text readability |
| `.lunara-page-loader-content` | Centered flex container for loader + text |
| `.lunara-eclipse-loader` | Moon circle with gradient and glow |
| `.lunara-eclipse-shadow` | Sweeping shadow element |
| `.lunara-page-loader-text` | "Loading..." text (Garamond, Pearl Mist) |
| `.lunara-page-loader-subtitle` | Optional italic subtitle |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .lunara-eclipse-shadow {
    animation: none !important;
    transform: translateX(-8px);
  }
}
```

Moon stays static. No flashing. Background remains visible.

### Mobile

- Eclipse loader: 76px (down from 96px)
- Text: 1.05rem (down from 1.15rem)
- Full viewport coverage maintained

### Usage

```tsx
import { LunaraPageLoader } from '@/components/common/LunaraPageLoader';

// Full-page loading
<LunaraPageLoader />

// With custom subtitle
<LunaraPageLoader subtitle="Syncing your diaries..." />
```

### Where It Renders

- `PrivateRoute.tsx` — while auth session is loading
- This is the **only** full-page loading state in the app

### What It Does NOT Replace

- Button loading spinners (e.g., "Saving...", "Sharing...")
- Inline loading states inside cards (e.g., MyDiaries, SharedDiaries)
- Image upload progress indicators
- Find People search states
- Small `animate-spin` spinners in buttons

### Background Image Priority

1. `/assets/lunara-moon-bg.webp` (preferred)
2. `/assets/lunara-moon-bg.jpg`
3. `/assets/lunar lumina.jpg` (fallback)

### Uiverse Inspiration

The eclipse animation is inspired by Uiverse moon loader snippets. Only the moon-shadow passing idea was used. No generic class names (`.container`, `.loader`, `.shadow`) were introduced. All classes are scoped with `lunara-` prefix.

---

## 28. File/Class Reference

### Components

| File | UI Responsibility |
|---|---|
| `LunaraPageLoader.tsx` | Full-page moon-themed loading screen with eclipse animation |
| `Profile.tsx` | Main layout, tab routing, cover→writing flow |
| `JournalIndexRail.tsx` | Left navigation rail (desktop) |
| `JournalOverview.tsx` | Profile card, avatar, stats, recent diaries |
| `DiaryCoverStart.tsx` | New diary cover screen with animation |
| `WriteEditor.tsx` | Diary book writer, page management, toolbar, autosave |
| `MyDiaries.tsx` | Private diary list, search, open/share |
| `SharedDiaries.tsx` | Shared diaries list, Find People search |
| `DiaryBookReader.tsx` | Read-only diary book view |
| `DiaryPageNavigation.tsx` | Page arrows, dots, bookmark tabs |
| `ProfileImageCropDialog.tsx` | Crop dialog with zoom/rotate |
| `ProfileSettings.tsx` | Settings page |
| `ShareDiaryDialog.tsx` | Share with Lunara user dialog |

### Utilities

| File | Responsibility |
|---|---|
| `diaryContent.ts` | Page metadata parsing, serialization, `PAGE_TITLE_MAX_LENGTH` |
| `diaryImageService.ts` | Signed URL generation, access verification, image resolution |
| `useResolvedImages.ts` | React hook for resolving `storage://` paths to signed URLs |
| `storage.ts` | Upload/delete diary images, returns `storage://` paths |
| `profileService.ts` | Profile CRUD, avatar upload, `findProfileByLunaraId()` RPC |
| `diaryService.ts` | Diary CRUD, `createDiaryShell()` |
| `shareService.ts` | Share management, `getSharedDiaries()`, `shareDiary()` |

### Styles

| File | Responsibility |
|---|---|
| `index.css` | All custom CSS: diary book, cover, ruled lines, animations, responsive, `.lunara-button`, `.diary-cover-constellation`, card system |
| `tailwind.config.ts` | Color tokens (lunara-primary, lunara-silver, moon-paper, etc.), font families, animations, custom keyframes |

---

## 29. Card System

All profile/diary workspace cards use **dark moon-glass** surfaces so the moon background remains visible and cards feel like soft night-paper panels, not pasted white rectangles. Inputs and diary writing pages remain light for readability.

### Card Classes

| Class | Purpose | Visual |
|---|---|---|
| `.lunara-glass-card` | Profile card, stats tiles, profile result cards, auth glass cards | Dark translucent moon-glass (`rgba(18,26,46,0.70)` → `rgba(11,16,32,0.58)`), deep black shadows, Pearl Mist text, moon-gold radial glow top-left |
| `.lunara-panel-card` | Settings panels, search panels, dialogs, larger form areas | Dark panel (`rgba(232,237,247,0.18)` → `rgba(18,26,46,0.68)` → `rgba(11,16,32,0.72)`), Pearl Mist text |
| `.lunara-diary-card` | Diary list items (My Diaries, Shared Diaries) | Dark moonlit diary cover (`rgba(18,26,46,0.78)` → `rgba(11,16,32,0.68)`), inner left spine, crescent `☽` accent, Pearl Mist text, hover lift |
| `.lunara-dark-empty-card` | Empty states | Dark glass panel (`rgba(11,16,32,0.62)` → `rgba(18,26,46,0.48)`), Pearl Mist text, silver border |
| `.lunara-field` | Lunara ID boxes, search inputs, form inputs, display-only info boxes | Dark translucent field (`rgba(232,237,247,0.16)` → `rgba(18,26,46,0.52)`), Pearl Mist text, silver border, for dark card surfaces |
| `.vintage-card` | Backward-compatible alias to `.lunara-glass-card` | Same as glass card (deprecated — use `.lunara-glass-card` directly) |

### Card Usage by Component

| Component | Card Class |
|---|---|
| JournalOverview profile card | `.lunara-glass-card` |
| JournalOverview stats cards | `.lunara-glass-card` |
| JournalOverview recent diaries | `.lunara-panel-card` |
| MyDiaries search bar | `.lunara-field` |
| MyDiaries diary cards | `.lunara-diary-card` |
| MyDiaries empty state | `.lunara-dark-empty-card` |
| SharedDiaries Find People panel | `.lunara-panel-card` |
| SharedDiaries Find People input | `.lunara-field` |
| SharedDiaries profile result | `.lunara-glass-card` |
| SharedDiaries diary cards | `.lunara-diary-card` |
| SharedDiaries empty state | `.lunara-dark-empty-card` |
| ProfileSettings all sections | `.lunara-panel-card` |
| ProfileSettings Lunara ID field | `.lunara-field` |
| ProfileSettings form inputs | `.lunara-field` |
| ShareDiaryDialog | `.lunara-panel-card` |
| ShareDiaryDialog input | `.lunara-field` |
| ProfileImageCropDialog | `.lunara-panel-card` |
| DiaryCoverStart cover | `.diary-cover-shell` (dark moon-glass variant) |
| WriteEditor diary details dialog | `.lunara-panel-card` |

### Card Styling Rules

- **Background:** Dark translucent moon-glass gradients, never pure cream or pure white
- **Border:** Silver-blue tone (`rgba(216, 227, 240, 0.22-0.26)`)
- **Shadow:** Deep black depth (`0 24-30px 60-80px rgba(0, 0, 0, 0.32-0.44)`)
- **Backdrop:** Blur 12-16px + saturate for glass effect
- **Text:** Pearl Mist (`#E8EDF7`) headings, Lunara Silver / Muted Stardust for secondary
- **Border radius:** 1.5rem–1.65rem for cards, 0.8rem for fields
- **Hover:** Subtle lift for diary cards (`translateY(-3px)`) + moon-gold border hint
- **Inputs:** Dark translucent `.lunara-field` surfaces for dark card consistency; diary writing pages remain light

### Diary Card Specifics

- Crescent moon accent (`☽`) in top-right corner, moon-gold at 55% opacity
- Inner left spine line (`inset 8px 0 0 rgba(216, 227, 240, 0.10)`)
- `min-height: 220px`, `max-width: 420px`
- Grid: `repeat(auto-fit, minmax(280px, 1fr))`
- Single card max-width: `420px`
- Hover: `translateY(-3px)` + moon-gold border hint + deeper shadow

### Empty State Styling

- Dark glass panel (`.lunara-dark-empty-card` or `.lunara-empty-state`)
- Pearl Mist text on dark background
- Silver borders
- Visible but not overwhelming

### Text Contrast Rules (Dark Cards)

- **Headings on dark cards:** Pearl Mist (`#E8EDF7`)
- **Secondary text on dark cards:** Lunara Silver (`rgba(216, 227, 240, 0.75)`) or Muted Stardust (`#A8A6C7`)
- **Metadata on dark cards:** Muted Stardust at 65-70% opacity
- **Icons on dark cards:** Lunara Silver, Lunara Blue, or Moon Gold (decorative)
- **Links/actions on dark cards:** Lunara Blue or Lunara Silver
- **Destructive actions:** Error Rose
- **Text inside inputs on dark cards:** Pearl Mist (`#E8EDF7`)
- **Input placeholders on dark cards:** Lunara Silver at 55% opacity
- **Labels outside inputs on dark cards:** Pearl Mist or Lunara Silver
- **Text on image background:** Pearl Mist / Lunara Silver + subtle navy shadow
- **Diary writing pages:** Remain clean moon-paper (light) for readability
- **Placeholders:** Readable, not below 50-60% opacity
- **Empty states:** Pearl Mist on dark glass, not ghosted

---

## 30. Do and Don't Summary

### Do
- Use moon, stars, constellation, crescent, Lunara Silver as visual motifs
- Keep diary/book metaphor throughout
- Keep private-first language
- Keep text readable — Ink Blue on paper, Pearl Mist on dark
- Keep celestial details subtle — never dominant
- Use "Lunara" as the brand identity in all text
- Use "LUNARA" only as a wordmark/logo
- Keep `moon-paper` as the readable surface color
- Keep `lunara-primary` for deep navy backgrounds and rails
- Keep `lunara-silver` / `muted-stardust` for dividers and secondary elements
- Keep `moon-gold` for rare gentle highlights only
- Keep animations restrained (500-900ms, barely perceptible)
- Keep page title separate from diary title
- Keep image uploads confirmed/cropped/private
- Keep `font-garamond` for all content-facing text
- Keep ornamental dividers between sections (use crescent `☽` not floral `❀`)
- Keep the diary book as the visual centerpiece
- Keep side controls as paper slips with silver-blue tone
- Keep dialogs moon-paper styled (Moon Paper bg, Lunara Night primary buttons)
- Keep reduced-motion support on all animations
- Keep text selection enabled on all content areas
- Keep `LUNA-XXXXXX` as the user ID format

### Don't
- Don't rename the app to LUNAR
- Don't rename Lunara ID to Lunar ID
- Don't change LUNA-XXXXXX ID format during UI work
- Don't use flower-heavy branding as the main visual identity
- Don't use forest green as the main CTA color (deprecated — use Lunara Night)
- Don't use public/publish/feed language
- Don't turn the UI into a galaxy poster
- Don't add animated star particles
- Don't use neon purple or electric blue
- Don't use gaming-style animations (bounces, spins, particles)
- Don't make content too faint — readability first
- Don't use dashboard layout language
- Don't expose private data (email, phone, diary content via search)
- Don't make diary-images public in production
- Don't reintroduce direct avatar upload (always crop first)
- Don't place image upload near page arrows
- Don't make the writer feel like Google Docs
- Don't add a galaxy background inside the writing page
- Don't duplicate diary content parsing logic (use `diaryContent.ts`)
- Don't use pure black or pure white
- Don't add neon, glowing, or electric effects
- Don't use sans-serif for headings or body text
- Don't use all-caps for headings
- Don't add metallic, glossy, or futuristic gradients
- Don't use drop shadows larger than 12px
- Don't clutter — every element should earn its place
- Don't use emoji as decorative UI elements (emoji in user content is fine)
- Don't use the word "dashboard"
- Don't call diaries "entries" or "posts"
- Don't show page titles as diary titles or vice versa
- Don't skip the crop dialog for profile images
- Don't add animations longer than 1 second

---

## 31. Lunara Mood Player

A bottom-right ambient music player with a moonlit aesthetic. Replaces the legacy `LunaraAmbientPlayer`.

### Component

`src/components/profile/LunaraAmbientPlayer.tsx`

### Audio Assets

| Track | File | Path |
|---|---|---|
| Moonlit Lofi | `Lofi Beats with Sailor Moon.mp3` | `/assets/audio/Lofi%20Beats%20with%20Sailor%20Moon.mp3` |
| Rain at Midnight | `Lofi Rain Sound.mp3` | `/assets/audio/Lofi%20Rain%20Sound.mp3` |

- Both files live in `public/assets/audio/`
- File names contain spaces — use URL-encoded paths in `src` attributes
- **Never** use Windows absolute paths (`D:\...`) in browser source URLs

### Behavior

- **No autoplay.** Audio starts only after user clicks play
- Tracks play sequentially by default; loop and shuffle are optional toggles
- When a track ends:
  - Loop enabled → replay same track
  - Shuffle enabled → play a random different track
  - Otherwise → play next track
- If a file fails to load: displays "This moonlit track could not be found."

### Persistence (localStorage)

| Key | Value | Default |
|---|---|---|
| `lunaraAmbientTrackIndex` | Track index (0-based) | `0` |
| `lunaraAmbientVolume` | Volume (0–1) | `0.25` |
| `lunaraAmbientLoop` | Loop enabled (`true`/`false`) | `false` |
| `lunaraAmbientShuffle` | Shuffle enabled (`true`/`false`) | `false` |

### Positioning

- Desktop: fixed bottom-right (`right: 1.25rem; bottom: 1.25rem`)
- Tablet: adjusted right/bottom for safe area
- Mobile (<640px): full-width with side padding, positioned above bottom nav
- z-index: 30 (above content, below dialogs)

### Desktop Layout

- **Collapsed:** compact top row — music orb + track info + play/prev/next controls (~280px wide)
- **Expanded:** shows progress bar, time display, volume slider, loop/shuffle toggles (~380px wide)
- Expands on hover or focus; collapses on mouse leave

### Music Orb / Disc

- Circular SVG disc with moon/stars/night landscape silhouette inside
- Silver-blue border, dark navy interior
- Center pin/dot (moon-gold glow)
- When playing: disc rotates slowly (6s linear infinite)
- When paused: static
- `prefers-reduced-motion: reduce` disables rotation

### Scoped CSS Classes

| Class | Purpose |
|---|---|
| `.lunara-mood-player` | Main container (fixed, dark glass) |
| `.lunara-mood-player-expanded` | Expanded state width |
| `.lunara-mood-player-top` | Top row: orb + info + controls |
| `.lunara-mood-player-body` | Expandable body (progress, volume, toggles) |
| `.lunara-mood-player-info` | Track title + mood label |
| `.lunara-music-orb` | Orb button wrapper |
| `.lunara-music-orb-disc` | Spinning disc SVG container |
| `.lunara-music-orb-disc.is-playing` | Active rotation state |
| `.lunara-music-orb-pin` | Center pin dot |
| `.lunara-mood-controls` | Play/skip button group |
| `.lunara-mood-btn` | Base control button |
| `.lunara-mood-btn-play` | Primary play/pause button |
| `.lunara-track-progress` | Progress range slider |
| `.lunara-volume-slider` | Volume range slider |
| `.lunara-mood-toggle` | Loop/shuffle toggle button |
| `.lunara-mood-toggle.is-active` | Active toggle state |
| `.lunara-mood-time` | Time display text |
| `.lunara-mood-error` | Missing-audio message |
| `.lunara-mood-volume` | Volume control group |
| `.lunara-mood-library-toggle` | Library expand/collapse button |
| `.lunara-mood-library-loading` | Loading indicator for signed URLs |
| `.lunara-mood-library` | Scrollable library panel container |
| `.lunara-mood-library-list` | Track list wrapper |
| `.lunara-mood-library-item` | Individual track row |
| `.lunara-mood-library-item.is-active` | Currently playing track |
| `.lunara-mood-library-item-play` | Play button per track |
| `.lunara-mood-library-item-info` | Track title + mood wrapper |
| `.lunara-mood-library-item-title` | Track title text |
| `.lunara-mood-library-item-mood` | Track mood/subtitle text |
| `.lunara-mood-library-item-delete` | Delete button (appears on hover) |
| `.lunara-mood-library-upload` | Upload form container |
| `.lunara-mood-upload-input` | Title/mood text inputs |
| `.lunara-mood-upload-btn` | Upload button |
| `.lunara-mood-upload-spinner` | Upload loading spinner |
| `.lunara-mood-library-limit` | Max tracks reached message |

### Visual Direction

- Dark moon-glass card: `rgba(11, 16, 32, 0.88)` + `backdrop-filter: blur(12px)`
- Silver-blue border: `rgba(216, 227, 240, 0.18)`
- Pearl Mist text (`#E8EDF7`)
- Muted Stardust secondary text (`rgba(168, 166, 199, 0.75)`)
- Moon Gold accents on play button and active toggles (`#FDE68A`)
- No harsh white card, no bright purple, no cartoon look

### User Audio Library

Default Lunara playlist tracks load from the `default_audio_tracks` table and public Supabase Storage bucket `lunara-default-audio`. User songs load from the private `user_audio_tracks` table and `user-audio` bucket. Users can upload up to 10 custom audio tracks (MP3, WAV, OGG, WebM; max 50MB each). User audio files are stored under `{user_id}/{uuid}.{ext}` and signed URLs are generated client-side with a 1-hour TTL. Default tracks (`Moonlit Lofi`, `Rain at Midnight`) always appear first and display the `Lunara` badge. Uploaded tracks display the `Private` badge. Delete button appears on hover for uploaded tracks only.

Audio caching is browser-local. Supabase Storage remains the source of truth, while IndexedDB stores fully downloaded audio Blobs in `lunara-audio-cache` / `audio-blobs`. The cache key is the stable track id, not a signed URL, public URL, or filename. Default tracks initially load from Supabase public URL, then cache as IndexedDB audio Blobs after full download. Future playback should prefer the cached Blob URL. User uploaded audio uses signed URLs only as temporary playback/download URLs. Once fully downloaded, cache the Blob in IndexedDB and prefer the cached Blob URL on later playback.

Cache status labels are `Cached`, `Streaming`, `Not cached`, `Caching...`, and `Cache failed`. Users can choose `Cache song`, `Remove cache`, or `Clear cached songs` in the player library. Removing cache never deletes a Supabase song. Deleting a user song deletes the Supabase object, database row, and cached Blob. The cache is per browser/device and targets a 300 MB limit; localStorage stores only player preferences, never audio Blobs. No autoplay.

### Accessibility

- All buttons have `aria-label`
- `aria-pressed` on loop/shuffle toggles
- `focus-visible` outlines: `2px solid rgba(253, 230, 138, 0.4)`
- Keyboard-navigable — no hover-only functionality
- `type="button"` on all buttons

### Uiverse Inspiration

The music disc/orb and compact player card structure were inspired by Uiverse music player snippets. Only the visual idea of a circular rotating disc with an inner icon and a compact expandable card was used. No generic class names (`.container`, `.loader`, `.shadow`) were introduced. All classes are scoped with `lunara-mood-` or `lunara-music-` prefix.

### What It Does NOT Replace

- Full-page moon loader (`LunaraPageLoader.tsx`)
- Button loading spinners
- Inline loading states

---

## 32. Default Audio Storage

Default Lunara playlist MP3 files are stored outside GitHub in Supabase Storage. The default bucket is `lunara-default-audio` and is public in this phase. Default playlist metadata lives in `default_audio_tracks`, and the player initially resolves audio with Supabase `getPublicUrl`. After full download, default tracks cache as IndexedDB audio Blobs and future playback should prefer the cached Blob URL.

User songs remain private. Uploaded user tracks are stored in the `user-audio` bucket, indexed by `user_audio_tracks`, and played through signed URLs only as temporary playback/download URLs. Once fully downloaded, the player caches the Blob in IndexedDB and prefers the cached Blob URL on later playback. This keeps private audio separate from public default audio.

GitHub should not store MP3 binaries for the default playlist. `.gitignore` excludes `public/assets/audio/*.mp3` while keeping `public/assets/audio/.gitkeep` so the folder can remain in the project.

Audio cache is per browser/device. A song cached on one browser is not automatically cached on another device. Supabase keeps the original file so each browser can cache it after first playback.

No YouTube Music, Spotify, external streaming integration, or autoplay is part of this phase.

---

*This document reflects the Lunara moonlit celestial design system. Colors, tokens, classes, and components referenced here exist in `src/index.css`, `tailwind.config.ts`, and the component files listed above. Backend ID format remains `LUNA-XXXXXX` — no schema changes required.*
