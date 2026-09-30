# Bocado Club — reporte de corrección de contraste I-4

**Fecha:** 2026-09-30
**Hallazgo:** I-4 — contraste insuficiente en `.hero-status` y `.hero-fallback__caption`
**Estado:** corregido

## Commit

- `84688106cf68729044205ef9026296082dc80617` — `fix: resolve hero contrast finding I-4`
- El commit del fix contiene únicamente `styles.css`.
- Este reporte se agrega en un commit documental separado para conservar estable y verificable el hash del cambio de estilos.

## Archivos

- Modificado por el fix: `styles.css`.
- Creado para esta verificación: `.superpowers/sdd/final-contrast-fix-report.md`.
- No se modificaron `index.html`, `script.js`, la spec, el plan, el ledger ni las revisiones previas.

## Cambios realizados

- `.hero-status` usa `#2f6b48`, un verde más oscuro que conserva la señal visual y alcanza el contraste requerido sobre `--cream`.
- `.hero-fallback__caption` conserva sus colores de texto, pero ahora se presenta sobre una placa sólida `var(--charcoal)`. La superficie opaca hace que el contraste sea independiente de cualquier zona del gradiente.
- La descripción accesible existente del fallback quedó intacta.

## Pruebas

- Contraste WCAG calculado desde los valores presentes en `styles.css`:
  - `#2f6b48` sobre `#f8f1e6`: **5.64:1** — PASS (objetivo `>= 4.5:1`).
  - `#fffaf2` sobre `#211d1a`: **16.10:1** — PASS.
  - `#ffe49a` sobre `#211d1a`: **13.40:1** — PASS.
- `node --check script.js`: **PASS**.
- `git diff --check`: **PASS**.
- Revisión del diff: el commit del fix contiene solo las reglas de `.hero-status` y `.hero-fallback__caption` en `styles.css`.
- Prueba visual normal en navegador local: **PASS**; Three.js cargó, el canvas del hero estuvo visible y el estado normal se anunció como “Escena 3D lista para servir.”.
- Prueba visual fallback: **PASS**; se sirvió una copia temporal sin la carga de Three.js, la aplicación mostró “escena 3D no disponible”, mantuvo la descripción accesible completa y renderizó el caption sobre la placa oscura.
- La copia temporal y los servidores HTTP de prueba fueron eliminados/detenidos al finalizar.

## Limitaciones

- No se ejecutó una suite automatizada de pruebas de interacción ni una auditoría pixel a pixel; la validación de accesibilidad fue cálculo WCAG de luminancia más comprobación visual normal/fallback.
- Los artefactos `.superpowers/sdd` preexistentes y no rastreados se dejaron intactos, según el alcance solicitado.
