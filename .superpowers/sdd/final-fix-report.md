# Bocado Club — final fix report

**Date:** 2026-09-30
**Source requirements:** `.superpowers/sdd/final-review.md`
**Scope:** final review findings I-1, I-2, I-3, M-1, and M-2 only.

## Result

All five findings were corrected without changing catalog data, cart/checkout behavior, Three.js behavior, fallback behavior, or the no-backend architecture.

Changed implementation files:

- `styles.css`
- `script.js`

The protected spec, plan, progress ledger, prior reports/reviews, `index.html`, and unrelated source files were not modified.

## Fixes applied

- **I-1:** Added the premium responsive component rules for the JavaScript-generated `.menu-card` family, `.cart-list`, `.cart-item` content and controls, and `.toast`. Cards now have structured header/tag/price/title/description/action spacing, borders, surfaces, shadows, hover/focus-within treatment, and mobile sizing. Cart lines have responsive grid areas, readable extras/subtotals, quantity controls, and remove-action placement. Toasts have an accessible dark surface, readable cream text, animation, and mobile edge spacing.
- **I-2:** Changed the default `--tomato` token from `#d84b36` to `#c93f2e`. Cream text on tomato now measures **4.77:1**, meeting the 4.5:1 normal-text target for primary actions and the cart count. Existing focus rings and the darker hover state remain in place.
- **I-3:** Changed the base hero eyebrow to `var(--tomato-deep)`. Deep tomato on cream measures **5.52:1** and remains consistent with the existing section eyebrow palette.
- **M-1:** `restartFromConfirmation()` now uses `behavior: 'auto'` when `matchMedia('(prefers-reduced-motion: reduce)').matches`, and keeps smooth scrolling otherwise.
- **M-2:** Replaced the hidden mobile navigation with a compact wrapping navigation. The existing Inicio, Menú, Combos, and Nosotros links remain keyboard reachable below 768px. The header now wraps safely and the mobile section scroll margin accounts for the taller header.
- During mobile verification, the intentional hero/fallback artwork overflow was contained at the mobile breakpoint so fallback rendering does not create horizontal scrolling.

## Verification commands and outputs

### Syntax and diff

Command:

```text
node --check "D:\CURSO DE DESARROLLO WEB FULL STACK IDT\Tarea 19 - IA en GitHub y Herramientas de Productividad (ollama y más)\script.js"
```

Output: no output; exit code 0.

Command:

```text
git -c safe.directory='D:/CURSO DE DESARROLLO WEB FULL STACK IDT/Tarea 19 - IA en GitHub y Herramientas de Productividad (ollama y más)' -C "D:\CURSO DE DESARROLLO WEB FULL STACK IDT\Tarea 19 - IA en GitHub y Herramientas de Productividad (ollama y más)" diff --check
```

Output: exit code 0. Git emitted only the existing LF-to-CRLF normalization warnings for the two edited files; no whitespace errors were reported.

### Contrast and static assertions

An inline Node WCAG relative-luminance check plus selector/static assertions reported:

```text
contrast primary/cream #c93f2e #fffaf2 4.77
contrast eyebrow/cream #b93829 #fffaf2 5.52
PASS primary tomato/cream contrast >= 4.5:1
PASS cart-count tomato/cream contrast >= 4.5:1
PASS hero eyebrow deep-tomato/cream contrast >= 4.5:1
PASS CSS selector present: .menu-card
PASS CSS selector present: .menu-card__header
PASS CSS selector present: .menu-card__tag
PASS CSS selector present: .menu-card__price
PASS CSS selector present: .menu-card__title
PASS CSS selector present: .menu-card__description
PASS CSS selector present: .menu-card__action
PASS CSS selector present: .cart-list
PASS CSS selector present: .cart-item
PASS CSS selector present: .cart-item__name
PASS CSS selector present: .cart-item__extras
PASS CSS selector present: .cart-item__subtotal
PASS CSS selector present: .cart-item__controls
PASS CSS selector present: .cart-item__quantity
PASS CSS selector present: .toast
PASS mobile navigation remains rendered
PASS mobile navigation is not hidden
PASS reduced-motion confirmation scroll uses auto
PASS header link retained: #inicio
PASS header link retained: #menu
PASS header link retained: #combos
PASS header link retained: #nosotros
PASS no order-network surface: fetch(
PASS no order-network surface: XMLHttpRequest
PASS no order-network surface: sendBeacon
PASS no order-network surface: WebSocket
STATIC CHECK: PASS
```

### Desktop browser flow

A temporary Node local server served the project at `http://127.0.0.1:4173/`; it was stopped after verification.

The Codex in-app browser desktop pass verified:

- The normal Three.js hero rendered.
- The hero eyebrow was visibly readable on the cream surface.
- The catalog rendered eight styled cards with tags, prices, descriptions, and full-width actions.
- Product detail opened from a generated card.
- Tab entered the product dialog and Escape closed it, returning focus to the triggering card action.
- A customized product with an extra was added; the cart count announced one product.
- The cart drawer rendered the styled list item, extras, subtotal, quantity controls, remove action, and toast.
- Empty checkout submission exposed the required field errors.
- A valid pickup/cash checkout produced a local confirmation code and order summary.
- The cart was cleared and the cart count returned to zero.
- “Volver al menú” hid confirmation, rerendered the catalog, and restored focus to `#menu-title`.
- The final browser accessibility tree exposed all four desktop navigation links and the expected dialog/list/button labels.

### Mobile browser and reduced-motion checks

Chrome headless/CDP was run with an explicit 390×844 device metric override. The final output was:

```json
{
  "viewport": [390, 844],
  "layoutViewport": 390,
  "navDisplay": "flex",
  "visibleNavLinks": 4,
  "menuCards": 8,
  "menuGridColumns": "358px",
  "menuCardPadding": "22px",
  "headerFlexWrap": "wrap",
  "horizontalOverflow": false
}
```

The same mobile run added a local cart item and toast:

```json
{
  "cartItemCount": 1,
  "cartItemDisplay": "grid",
  "cartItemAreas": "\"name\" \"extras\" \"subtotal\" \"controls\"",
  "toastDisplay": "block",
  "toastBackground": "rgb(33, 29, 26)"
}
```

With `prefers-reduced-motion: reduce` emulated:

```json
{
  "mediaMatches": true,
  "cssScrollBehavior": "auto",
  "scriptedScrollBehavior": "auto",
  "scriptedScrollBlock": "start"
}
```

The captured 390×844 mobile screenshot showed the wrapped four-link header, one-column catalog cards, category switcher, readable card content, and the styled notification surface.

### Fallback and console/network checks

The headless runner could not access the two existing CDN scripts, so the app entered its fallback hero mode. The fallback status was rendered as “Presentación ilustrada activa · escena 3D no disponible”; the catalog, cart, toast, and reduced-motion checks still passed, with no uncaught application/runtime exceptions.

Static source inspection confirmed no `fetch`, `XMLHttpRequest`, `sendBeacon`, or `WebSocket` order/network surface.

## Concerns

- The headless test environment reported `net::ERR_NETWORK_ACCESS_DENIED` for the already-approved Tailwind CDN and Three.js CDN URLs. The normal in-app desktop pass loaded the Three.js scene successfully; this is an environment restriction, not a new application error.
- The local test server reported a 404 for `/favicon.ico`. No favicon was part of the requested fix scope, so it was left unchanged.
- Git reported LF-to-CRLF normalization warnings for the edited files, but `git diff --check` passed with no whitespace failures.
- The project remains a direct-open static deliverable with the existing CDN architecture and no build/dependency step.
