# Neo Metro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, responsive Neo Metro smart-city explorer that runs by opening `index.html` directly and lets users inspect four interactive districts.

**Architecture:** A single-page static experience will contain a semantic app shell, an inline SVG city map, and a responsive district detail panel. Tailwind CSS will provide layout and utility styling through its CDN script, while `styles.css` will hold the bespoke city visuals, map geometry, glass surfaces, and motion. `script.js` will own the local district data, selection state, panel rendering, animated metrics, theme control, and accessibility behavior.

**Tech Stack:** HTML5, Tailwind CSS CDN, vanilla JavaScript, inline SVG, CSS custom properties, Git.

## Global Constraints

- The project must work without a backend, database, bundler, or installation step.
- The entry point is `index.html` and must be directly openable in a browser.
- The interface must use HTML, Tailwind CSS, JavaScript, and the local `styles.css` companion stylesheet.
- The city must expose four selectable districts: Innovation Hub, Creative Quarter, Green Grid, and Motion District.
- Metrics are illustrative local data; no external data calls are permitted.
- The visual language is a premium night city with graphite, cyan, violet, and electric-green accents.
- Responsive behavior must convert the desktop side panel into a bottom card on small screens.
- Motion must be subtle and respect `prefers-reduced-motion`.
- Every interactive district must be usable with mouse, keyboard focus, and Enter/Space activation.

---

### Task 1: Scaffold the static application shell

**Files:**
- Create: `index.html`
- Create: `styles.css`

**Interfaces:**
- Produces the DOM hooks consumed by `script.js`: `#district-map`, `[data-district]`, `#district-panel`, `#panel-content`, `#panel-close`, `#theme-toggle`, `#live-clock`, and the metric elements `[data-metric="activity"]`, `[data-metric="flow"]`, `[data-metric="impact"]`.

- [ ] **Step 1: Create the document shell and load Tailwind.**

  Add the HTML document with a viewport tag, a descriptive title, the Tailwind CDN script, the local stylesheet, and the JavaScript module at the end of the body:

  ```html
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Neo Metro — an interactive smart city explorer." />
    <title>Neo Metro — Smart City Explorer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app" class="min-h-screen overflow-hidden bg-neo-950 text-white">
      <!-- top bar, city map, panel, and status dock are added here -->
    </main>
    <script src="script.js" defer></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Add the semantic top bar.**

  Include the `NEO METRO` wordmark, an online status indicator, the `#live-clock` element, and a `#theme-toggle` button with an accessible label. Use Tailwind classes for the grid/flex layout and utility spacing; keep visual-specific class names such as `glass-panel`, `status-pulse`, and `brand-mark` for `styles.css`.

- [ ] **Step 3: Add the city-map region and district hooks.**

  Create a labelled `<section aria-labelledby="map-title">` with a responsive two-column desktop layout. Add an inline `<svg id="district-map" viewBox="0 0 960 680" role="img" aria-label="Interactive map of Neo Metro">` containing decorative avenues and four grouped district buttons. Each district group must have `data-district` set to one of `innovation`, `creative`, `green`, or `motion`, `tabindex="0"`, `role="button"`, and an `aria-label` naming the district. Add a visible legend for district color accents.

- [ ] **Step 4: Add the district panel and mobile status dock.**

  Add `<aside id="district-panel" aria-live="polite" aria-labelledby="panel-title">` containing `#panel-content` and `#panel-close`. The initial content must explain that a district can be selected. Include the metric elements with empty values, a progress bar, a call-to-action button, and a small live status dock showing the city health summary. Ensure the panel close button is keyboard reachable.

- [ ] **Step 5: Add the base bespoke styles.**

  In `styles.css`, define the `--neo-*` color variables, the `bg-neo-950` fallback class, body background layers, focus-visible treatment, glass surface, brand mark, status pulse, city grid, map glow, panel entrance, and mobile panel positioning. Include this reduced-motion override:

  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

- [ ] **Step 6: Open the file directly and verify the shell.**

  Run: `Start-Process -FilePath (Join-Path (Get-Location) 'index.html')`

  Expected: the browser opens the Neo Metro shell with a top bar, a map placeholder, a visible panel, and no missing-file errors in the page.

- [ ] **Step 7: Commit the scaffold.**

  ```bash
  git add index.html styles.css
  git commit -m "feat: scaffold Neo Metro app shell"
  ```

### Task 2: Add the local district model and interaction controller

**Files:**
- Create: `script.js`
- Modify: `index.html` only if a required data hook is missing

**Interfaces:**
- Consumes: the DOM hooks from Task 1 and district IDs `innovation`, `creative`, `green`, `motion`.
- Produces: `districts`, `selectDistrict(id)`, `renderDistrict(district)`, `animateMetric(selector, target)`, and `closeDistrictPanel()` for the page runtime.

- [ ] **Step 1: Define the local district data.**

  Create a `districts` object with this shape and concrete values:

  ```js
  const districts = {
    innovation: {
      name: 'Innovation Hub',
      kicker: 'District 01 · Future systems',
      description: 'The engine room of Neo Metro, where ideas become useful infrastructure.',
      accent: 'cyan',
      activity: 92,
      flow: 78,
      impact: 86,
      pulse: 'High creative output',
      action: 'Explore the lab network'
    },
    creative: {
      name: 'Creative Quarter',
      kicker: 'District 02 · Culture & design',
      description: 'A luminous district where artists, makers, and storytellers shape the city’s identity.',
      accent: 'violet',
      activity: 84,
      flow: 91,
      impact: 79,
      pulse: '92 studios active',
      action: 'View creative signals'
    },
    green: {
      name: 'Green Grid',
      kicker: 'District 03 · Climate systems',
      description: 'A living network of clean energy, urban gardens, and resilient public spaces.',
      accent: 'lime',
      activity: 76,
      flow: 88,
      impact: 94,
      pulse: 'Carbon balance positive',
      action: 'Inspect energy flow'
    },
    motion: {
      name: 'Motion District',
      kicker: 'District 04 · Mobility & connection',
      description: 'The connective tissue of the city, moving people and ideas with quiet precision.',
      accent: 'blue',
      activity: 89,
      flow: 96,
      impact: 82,
      pulse: 'Transit running smoothly',
      action: 'Track city movement'
    }
  };
  ```

- [ ] **Step 2: Implement safe element lookup and panel rendering.**

  Add `const $ = (selector) => document.querySelector(selector);`, then implement `renderDistrict(district)` to update `#panel-content`, `#panel-title`, the description, the pulse text, the action label, the progress width, and all three metric values. Use `textContent` for user-visible local strings and `style.setProperty('--metric-value', ...)` for the progress visual; do not inject unsanitized HTML.

- [ ] **Step 3: Implement district selection.**

  Implement `selectDistrict(id)` so it reads `districts[id]`, returns early for an unknown ID, removes `.is-active` from all `[data-district]` elements, adds it to the selected element, updates its `aria-pressed` state, calls `renderDistrict(district)`, opens the panel, and stores the selected ID in `document.body.dataset.selectedDistrict`.

- [ ] **Step 4: Implement metric animation.**

  Implement `animateMetric(selector, target)` with `requestAnimationFrame`, a 650ms duration, integer interpolation from the current displayed value to `target`, and an immediate final value when `prefers-reduced-motion: reduce` is active. The function must do nothing when the selector does not resolve.

- [ ] **Step 5: Wire mouse, keyboard, panel, clock, and theme events.**

  Add listeners for click and `keydown` on every district. Activate on Enter or Space, preventing the Space page scroll. Wire `#panel-close` to `closeDistrictPanel()`, which removes the open class and updates `aria-hidden`. Start a one-second clock interval that writes a local `HH:MM` value into `#live-clock`. Wire `#theme-toggle` to toggle `data-theme="dawn"` on `<body>` and update its accessible label.

- [ ] **Step 6: Verify the runtime syntax and behavior.**

  Run: `node --check script.js`

  Expected: exit code 0 and no syntax errors.

  Then open the page directly and verify: each of the four districts opens the correct panel data, metrics animate, Escape closes the panel, Enter/Space activates a focused district, and the clock changes each minute.

- [ ] **Step 7: Commit the interaction layer.**

  ```bash
  git add script.js index.html
  git commit -m "feat: add interactive Neo Metro districts"
  ```

### Task 3: Finish the premium visual system and responsive map behavior

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `script.js` only if class hooks need synchronization

**Interfaces:**
- Consumes: `.is-active`, `.panel-is-open`, `data-theme`, district accent classes, and the `districts` model from Tasks 1–2.
- Produces: the polished city map, district hover/selection states, responsive layout, and dawn/night visual toggle.

- [ ] **Step 1: Style the SVG city geometry.**

  Add layered SVG classes for roads, rails, building clusters, district boundaries, and animated traffic lines. Use `vector-effect="non-scaling-stroke"` for crisp responsive lines. Keep decorative SVG elements `aria-hidden="true"` and use the district group labels for screen readers.

- [ ] **Step 2: Add district states and panel transitions.**

  Define `.district-zone`, `.district-zone:hover`, `.district-zone:focus-visible`, and `.district-zone.is-active` with the correct accent glow and transform behavior. Define `.panel-is-open` for the desktop side panel and its bottom-sheet mobile variant. Ensure the selected district remains visibly distinct without relying on color alone by adding an outline and a small active marker.

- [ ] **Step 3: Add the surrounding dashboard details.**

  Style the city status chips, live system badge, map legend, progress bar, metric cards, and action button. Use repeated visual motifs sparingly: one primary cyan action, one violet secondary accent, and lime only for health/energy indicators.

- [ ] **Step 4: Implement the dawn theme.**

  Define `[data-theme="dawn"]` variables with a pale blue-grey background and darker ink text while preserving district accents. Ensure the button label and icon state update from JavaScript and the theme remains readable in the panel and map.

- [ ] **Step 5: Verify responsive breakpoints.**

  Test the page at approximately 1440×900, 1024×768, 768×1024, and 390×844. Expected: desktop uses a map plus side panel; tablet maintains a usable map with a narrower panel; mobile stacks the map and shows the selected district as a bottom card without horizontal scrolling.

- [ ] **Step 6: Commit the visual system.**

  ```bash
  git add index.html styles.css script.js
  git commit -m "feat: polish Neo Metro visual system"
  ```

### Task 4: Run final visual, accessibility, and repository checks

**Files:**
- Modify: `index.html`, `styles.css`, or `script.js` only when a verification issue requires a targeted fix

**Interfaces:**
- Consumes: the complete static page from Tasks 1–3.
- Produces: a verified deliverable with clean Git status and documented checks.

- [ ] **Step 1: Check all project files and Git status.**

  Run: `git status --short`

  Expected: only intentional project files are present, and the design spec and implementation commits are visible in history.

- [ ] **Step 2: Run JavaScript syntax validation.**

  Run: `node --check script.js`

  Expected: exit code 0.

- [ ] **Step 3: Perform the interaction checklist in a browser.**

  Verify all of the following: initial welcome state; four district selections; correct title, copy, accent, progress, and three metrics per district; close button; Escape; keyboard activation; theme toggle; clock; no horizontal scroll on mobile.

- [ ] **Step 4: Perform the accessibility checklist.**

  Verify that the map has an accessible label, each district has a meaningful accessible name, focus is visible, the panel announces updates through `aria-live`, and decorative SVG elements are hidden from assistive technology.

- [ ] **Step 5: Inspect the browser console.**

  Expected: no uncaught JavaScript exceptions, missing local asset errors, or invalid ARIA warnings caused by the project.

- [ ] **Step 6: Make targeted fixes and re-run the affected checks.**

  For each issue found, edit only the responsible file, repeat the relevant browser or syntax check, and confirm the issue is gone before committing.

- [ ] **Step 7: Commit the verified deliverable.**

  ```bash
  git add index.html styles.css script.js
  git commit -m "chore: verify Neo Metro deliverable"
  ```
