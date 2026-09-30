# Bocado Club Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished static Bocado Club ordering experience with a cartoon Three.js waiter, realistic-styled smash burger, menu, product configurator, persistent cart, simulated checkout, and confirmation flow.

**Architecture:** `index.html` contains the semantic page shell and all dialog/drawer containers. `styles.css` owns the warm premium visual system, responsive layout, fallback artwork, and motion states. `script.js` owns one local product model, the catalog/filter UI, product customization, cart persistence, checkout validation, order confirmation, and the Three.js hero scene with a graceful fallback. Everything runs in the browser; no backend, build step, authentication, or payment service is used.

**Tech Stack:** HTML5, Tailwind CSS CDN, vanilla JavaScript, CSS custom properties, Three.js CDN, localStorage, Git.

## Global Constraints

- Bocado Club must be a web static experience with a premium, minimal, warm, and close-to-the-user visual language.
- The hero must feature a cartoon waiter and a smash burger that reads as more realistic than the character.
- The site must include catalog, product detail/configuration, cart, checkout, and simulated order confirmation.
- The four catalog categories are Smash, Combos, Sides, and Drinks.
- Tailwind CSS and Three.js load through CDN; `index.html` must open directly without installation or backend.
- Product data, cart state, totals, order code, and checkout confirmation are local browser state only.
- `localStorage` key `bocado-club-cart` stores the cart between page reloads.
- No real payment, order submission, sensitive-data storage, authentication, or server request is allowed.
- The layout must support desktop and mobile; the cart is a side drawer on desktop and a bottom panel on mobile.
- All controls must have visible focus states, keyboard support, accessible names, and sensible `aria-live` announcements.
- Motion must respect `prefers-reduced-motion`; Three.js must provide a visible fallback when unavailable.

---

### Task 1: Build the semantic page shell and visual foundation

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`

**Interfaces:**
- Produces the DOM hooks consumed by later tasks: `#site-header`, `#hero-scene`, `#hero-fallback`, `#menu-grid`, `[data-category]`, `#product-dialog`, `#cart-drawer`, `#checkout-dialog`, `#confirmation-view`, `#cart-count`, `#cart-live-region`, and `#toast-region`.

- [ ] **Step 1: Create the document shell and CDN imports.**

  Create an HTML5 document with `lang="es"`, viewport metadata, a descriptive title, the Tailwind CDN script, the pinned Three.js CDN script, the local stylesheet, and a deferred local script:

  ```html
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Bocado Club — smash burgers hechas para compartir." />
    <title>Bocado Club — Smash burgers con actitud</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app"></main>
    <div id="toast-region" aria-live="polite" aria-atomic="true"></div>
    <script src="script.js" defer></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Add the header and hero hooks.**

  Inside `#app`, add a sticky header with the Bocado Club wordmark, links to `#inicio`, `#menu`, `#combos`, and `#nosotros`, plus a `#cart-open` button containing `#cart-count`. Add a hero section with `id="inicio"`, copy, a `#hero-cta` button, `#hero-scene` for the canvas, `#hero-fallback` with a text alternative and burger illustration layers, and a visible `#hero-status` line.

- [ ] **Step 3: Add the menu structure.**

  Add a menu section with `id="menu"`, category buttons with `data-category="all|smash|combos|sides|drinks"`, and an empty `#menu-grid` container. Include a category status element with `id="menu-status"` and `aria-live="polite"` so JavaScript can announce the number of visible products.

- [ ] **Step 4: Add the product dialog.**

  Add a native `<dialog id="product-dialog">` with a close button, `#product-dialog-content`, `#product-name`, `#product-description`, `#product-price`, `#product-quantity`, `#product-extras`, `#product-total`, and `#product-add`. The dialog must have `aria-labelledby="product-name"` and use a form or button controls that work with keyboard input.

- [ ] **Step 5: Add the cart drawer and checkout dialog.**

  Add `#cart-drawer` with `aria-hidden="true"`, `#cart-items`, `#cart-empty`, `#cart-subtotal`, `#cart-total`, `#cart-checkout`, `#cart-close`, and `#cart-live-region` with `aria-live="polite"`. Add a checkout `<dialog id="checkout-dialog">` with fields `customer-name`, `customer-phone`, `customer-address`, `delivery-mode`, and `payment-mode`, plus `#checkout-error`, `#checkout-submit`, and `#checkout-cancel`.

- [ ] **Step 6: Add the confirmation view and supporting sections.**

  Add a hidden `#confirmation-view` with `#confirmation-code`, `#confirmation-name`, `#confirmation-total`, and `#confirmation-back-to-menu`. Add concise sections for combos and the Bocado Club story so the page feels complete without adding a second route.

- [ ] **Step 7: Create the visual tokens and responsive base styles.**

  In `styles.css`, define warm palette variables, the cream page background, charcoal text, red tomato action, cheese yellow highlight, pickle green status, glass/cream surfaces, rounded card system, focus-visible outline, dialog backdrop, drawer transitions, hero fallback art, and breakpoints. The drawer must use `position: fixed` on desktop and become a bottom sheet below 768px. Include:

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

- [ ] **Step 8: Add the no-op bootstrap script.**

  Create `script.js` with a harmless bootstrap so opening `index.html` before the later interaction task produces no missing-script or uncaught-reference error:

  ```js
  window.BocadoClub = window.BocadoClub || {};
  window.BocadoClub.bootstrap = true;
  ```

- [ ] **Step 9: Verify the static shell.**

  Run: `Start-Process -FilePath (Join-Path (Get-Location) 'index.html')`

  Expected: the browser opens the Bocado Club shell with header, hero fallback, menu container, dialogs, and no missing local asset or script error.

- [ ] **Step 10: Commit the shell.**

  ```bash
  git add index.html styles.css script.js
  git commit -m "feat: scaffold Bocado Club ordering experience"
  ```

### Task 2: Implement the menu model, filters, product details, and cart

**Files:**
- Modify: `script.js`
- Modify: `index.html` only if a required hook from Task 1 is missing

**Interfaces:**
- Consumes: the DOM hooks from Task 1.
- Produces: `products`, `cart`, `renderMenu(category)`, `openProduct(productId)`, `addToCart(productId, quantity, extras)`, `updateCartItem(key, quantity)`, `removeCartItem(key)`, `getCartTotal()`, `persistCart()`, `openCart()`, and `closeCart()`.

- [ ] **Step 1: Define the local catalog.**

  Add this concrete product model with eight products and exact categories:

  ```js
  const products = [
    { id: 'classic-smash', name: 'La Clásica', category: 'smash', price: 8.90, description: 'Doble smash, cheddar, pepinillos y salsa de la casa.', tag: 'La favorita', extras: ['extra-cheddar', 'bacon', 'salsa-picante'] },
    { id: 'bacon-crush', name: 'Bacon Crush', category: 'smash', price: 10.50, description: 'Doble smash, cheddar, bacon crocante y cebolla dulce.', tag: 'Más pedida', extras: ['extra-cheddar', 'bacon', 'cebolla-dulce'] },
    { id: 'green-room', name: 'Green Room', category: 'smash', price: 9.80, description: 'Smash, queso, lechuga fresca, pepinillos y alioli verde.', tag: 'Fresca', extras: ['extra-cheddar', 'aguacate', 'salsa-verde'] },
    { id: 'club-combo', name: 'Club Combo', category: 'combos', price: 14.90, description: 'La Clásica, papas doradas y bebida fría.', tag: 'Combo completo', extras: ['extra-cheddar', 'bacon'] },
    { id: 'bacon-combo', name: 'Bacon Combo', category: 'combos', price: 16.50, description: 'Bacon Crush, papas doradas y limonada.', tag: 'Para compartir', extras: ['extra-cheddar', 'bacon'] },
    { id: 'golden-fries', name: 'Golden Fries', category: 'sides', price: 4.50, description: 'Papas crujientes con sal de la casa.', tag: 'Crujientes', extras: ['queso-fundido', 'salsa-especial'] },
    { id: 'loaded-fries', name: 'Loaded Fries', category: 'sides', price: 6.90, description: 'Papas, queso fundido, bacon y cebolla dulce.', tag: 'Para mojar', extras: ['bacon', 'salsa-especial'] },
    { id: 'house-lemonade', name: 'Limonada Club', category: 'drinks', price: 3.50, description: 'Limonada fresca con hierbabuena y hielo.', tag: 'Refrescante', extras: ['extra-hielo', 'hierbabuena'] }
  ];
  ```

  Define `extraOptions` with concrete labels and prices for every extra id used above: `extra-cheddar` 1.20, `bacon` 1.50, `salsa-picante` 0.50, `cebolla-dulce` 0.60, `aguacate` 1.40, `salsa-verde` 0.50, `queso-fundido` 1.00, `salsa-especial` 0.50, `extra-hielo` 0, and `hierbabuena` 0.30.

- [ ] **Step 2: Implement safe format and persistence helpers.**

  Implement `formatCurrency(value)` with `Intl.NumberFormat('es-PY', { style: 'currency', currency: 'USD' })`, `loadCart()` reading `bocado-club-cart` with a guarded `try/catch`, `persistCart()` writing the JSON cart, and `getCartTotal()` reducing item subtotals. Invalid or non-array localStorage data must reset to an empty cart.

- [ ] **Step 3: Render the category filters and menu cards.**

  Implement `renderMenu(category = 'all')` so it filters `products`, updates the active category button, writes accessible cards into `#menu-grid`, and updates `#menu-status` with the visible product count. Each card must expose its product id through `data-product-id` and include a keyboard-accessible “Ver detalle” button.

- [ ] **Step 4: Implement product details and extras.**

  Implement `openProduct(productId)` to populate the dialog fields, reset quantity to 1, render only the product’s allowed extras with checkbox controls, calculate `#product-total`, and call `showModal()` when available. Add `updateProductTotal()` so quantity or extras immediately update the displayed total.

- [ ] **Step 5: Implement the cart operations.**

  Use a cart item key made from `${productId}::${sortedExtraIds.join(',')}`. Implement `addToCart(productId, quantity, extras)` to merge matching keys, `updateCartItem(key, quantity)` to remove quantities below 1, `removeCartItem(key)`, and `renderCart()` to show empty, populated, subtotal, total, extras, quantity controls, and accessible labels. Call `persistCart()` after every mutation and write a short message into `#cart-live-region`.

- [ ] **Step 6: Wire catalog, dialog, and drawer events.**

  Wire category clicks, product detail buttons, dialog close buttons, quantity controls, extra checkboxes, `#product-add`, `#cart-open`, `#cart-close`, and `#cart-checkout`. Support Escape for the cart drawer and keep focus on the triggering control when a dialog closes.

- [ ] **Step 7: Verify the menu and cart logic.**

  Run: `node --check script.js`

  Expected: exit code 0.

  In the browser, verify all categories, product details, extras, quantity updates, duplicate-item merging, removal, totals, empty state, toast/live announcements, and cart persistence after a reload.

- [ ] **Step 8: Commit the catalog and cart.**

  ```bash
  git add script.js index.html
  git commit -m "feat: add Bocado Club catalog and cart"
  ```

### Task 3: Implement checkout validation and simulated order confirmation

**Files:**
- Modify: `script.js`
- Modify: `index.html` only if a checkout hook is missing
- Modify: `styles.css` for validation and confirmation states

**Interfaces:**
- Consumes: `cart`, `getCartTotal()`, `renderCart()`, and the checkout hooks from Tasks 1–2.
- Produces: `validateCheckout(form)`, `generateOrderCode()`, `submitOrder(form)`, and `renderConfirmation(order)`.

- [ ] **Step 1: Implement field validation.**

  Implement `validateCheckout(form)` returning `{ valid, values, errors }`. Require a name with at least 2 characters, a phone with at least 7 digits after removing spaces and punctuation, an address of at least 5 characters when delivery is selected, a delivery mode, and a payment mode. Render each error into its adjacent `[data-error-for]` element and set `aria-invalid="true"` on invalid controls.

- [ ] **Step 2: Implement order code generation.**

  Implement `generateOrderCode()` as `BC-${Date.now().toString(36).slice(-5).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`. It must return a non-empty string matching `/^BC-[A-Z0-9]{5}-[A-Z0-9]{3}$/`.

- [ ] **Step 3: Implement simulated submission.**

  Implement `submitOrder(form)` to reject an empty cart, validate the form, build an order object with code, customer name, delivery mode, line items, total, and current local time, then clear the cart, persist it, close checkout/cart, and call `renderConfirmation(order)`. Never send the order to a network endpoint.

- [ ] **Step 4: Render confirmation and restart flow.**

  Implement `renderConfirmation(order)` to show the confirmation view, write the order code, customer name, total, and line-item summary, and focus the confirmation heading. `#confirmation-back-to-menu` must hide the confirmation view, scroll to `#menu`, and restore the menu state.

- [ ] **Step 5: Wire checkout events and visible errors.**

  Wire `#cart-checkout` to open checkout only when cart has items, `#checkout-submit` to call `submitOrder`, `#checkout-cancel` to close it, and delivery-mode changes to toggle the address requirement. Add a toast for a successful simulated order and a clear error for an empty cart.

- [ ] **Step 6: Verify the full purchase flow.**

  In the browser, test invalid name/phone/address, pickup without address, delivery with address, empty cart, successful submission, generated order code, cleared cart, confirmation values, and return-to-menu behavior.

- [ ] **Step 7: Commit checkout.**

  ```bash
  git add index.html styles.css script.js
  git commit -m "feat: add simulated Bocado Club checkout"
  ```

### Task 4: Build the Three.js hero scene and fallback behavior

**Files:**
- Modify: `script.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `#hero-scene`, `#hero-fallback`, `prefers-reduced-motion`, and hero CTA hooks.
- Produces: `initHeroScene()`, `createWaiter()`, `createBurger()`, `animateScene()`, `showHeroFallback()`, and `disposeHeroScene()`.

- [ ] **Step 1: Implement capability detection and scene initialization.**

  Implement `initHeroScene()` to return early to `showHeroFallback()` when `window.THREE` is missing or the canvas WebGL context cannot be created. Otherwise create a scene, perspective camera, renderer with antialiasing and alpha, warm ambient light, key light, and a resize observer for `#hero-scene`.

- [ ] **Step 2: Build the cartoon waiter from primitive geometry.**

  Implement `createWaiter()` returning a `THREE.Group` with torso, head, hair/hat, eyes, arms, hands, legs, shoes, and tray. Use flat warm materials and store named child references (`head`, `armLeft`, `armRight`, `eyes`) in `userData` for animation.

- [ ] **Step 3: Build the layered smash burger.**

  Implement `createBurger()` returning a `THREE.Group` with top bun, sesame dots, patty, cheese, lettuce, pickles, and bottom bun. Use warm materials, bevelled cylinders/planes, small positional offsets, and the key light to give the burger stronger highlights and depth than the waiter.

- [ ] **Step 4: Add the serving animation.**

  Implement `animateScene()` with a render loop that gently bobs the waiter, rotates the burger by a small amount, moves the tray arm, blinks the eyes on a timer, and adds a very small camera orbit. When reduced motion is active, render a stable frame with no continuous animation.

- [ ] **Step 5: Add fallback and cleanup.**

  Implement `showHeroFallback()` to hide the canvas area, show `#hero-fallback`, update `#hero-status` to explain that the illustrated presentation is active, and keep `#hero-cta` usable. Implement `disposeHeroScene()` to cancel the animation frame, dispose geometries/materials, disconnect the resize observer, and remove the renderer canvas before reinitialization.

- [ ] **Step 6: Verify the hero.**

  Open the page with normal WebGL and verify the mozo, tray, layered burger, lighting, resize behavior, and CTA. Then simulate failure by temporarily disabling the Three.js script in DevTools or setting `window.THREE = undefined` before initialization; expected result is the visible fallback with no uncaught error.

- [ ] **Step 7: Commit the hero scene.**

  ```bash
  git add styles.css script.js
  git commit -m "feat: add Bocado Club Three.js hero"
  ```

### Task 5: Polish responsive behavior and run final QA

**Files:**
- Modify: `index.html`, `styles.css`, or `script.js` only for targeted issues found by verification

**Interfaces:**
- Consumes: the complete Bocado Club page from Tasks 1–4.
- Produces: a clean, verified static deliverable.

- [ ] **Step 1: Run syntax and repository checks.**

  Run:

  ```powershell
  node --check script.js
  git diff --check
  git status --short
  ```

  Expected: syntax exit code 0, no whitespace errors, and only intentional project files.

- [ ] **Step 2: Verify desktop interaction.**

  At approximately 1440×900, verify hero scene, navigation anchors, all category filters, product details, extras, cart drawer, totals, checkout validation, confirmation, and return-to-menu flow.

- [ ] **Step 3: Verify mobile interaction.**

  At approximately 390×844, verify no horizontal scrolling, readable product cards, usable product dialog, bottom cart panel, large enough tap targets, and checkout fields that remain visible above the keyboard.

- [ ] **Step 4: Verify accessibility.**

  Use keyboard only to reach every header link, category, product action, dialog control, cart control, checkout field, and confirmation action. Verify focus visibility, dialog labels, `aria-live` announcements, `aria-invalid` updates, and the hero fallback text.

- [ ] **Step 5: Verify reduced motion and fallback.**

  Enable reduced motion in the browser and confirm the scene stops continuous movement while the rest of the site remains functional. Confirm missing Three.js/WebGL shows the fallback and does not break menu or checkout.

- [ ] **Step 6: Inspect the console and local persistence.**

  Expected: no uncaught exceptions, no missing local file errors, no failed localStorage parse after corrupting the key, and no network request other than CDN library loads.

- [ ] **Step 7: Fix only verified issues and rerun affected checks.**

  Each fix must be narrowly scoped to the responsible file, followed by the specific check that exposed it and the relevant full-flow check.

- [ ] **Step 8: Commit the verified deliverable.**

  ```bash
  git add index.html styles.css script.js
  git commit -m "chore: verify Bocado Club deliverable"
  ```
