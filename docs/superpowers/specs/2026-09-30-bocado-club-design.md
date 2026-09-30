# Bocado Club — Diseño de experiencia

**Fecha:** 2026-09-30
**Estado:** Aprobado para implementación

## Resumen

Bocado Club será una web estática de venta de hamburguesas con una experiencia premium, minimalista y cercana. Un mozo caricaturizado construido con Three.js recibirá al visitante y presentará una smash burger con materiales, iluminación y proporciones más realistas que el personaje. La experiencia incluirá catálogo, configuración de productos, carrito y checkout completamente simulado en el navegador.

## Objetivo

Crear una página llamativa y completa para una hamburguesería ficticia, demostrando HTML, Tailwind CSS, JavaScript y Three.js sin backend, base de datos, instalación ni pagos reales.

## Dirección de marca

- Nombre de trabajo: **Bocado Club**.
- Personalidad: cálida, juguetona, premium y cercana.
- Contraste principal: personaje cartoon amable frente a comida visualmente apetitosa y más realista.
- Paleta: crema cálido, carbón, rojo tomate, amarillo queso y verde pepinillo.
- Tipografía: sans-serif moderna, con una marca de alto peso visual y textos de lectura cómoda.
- Interfaz: espacios generosos, tarjetas limpias, bordes redondeados, botones grandes y microinteracciones.

## Estructura de la página

1. **Header:** logotipo Bocado Club, enlaces Inicio, Menú, Combos y Nosotros, además del botón de carrito con contador.
2. **Hero Bistro Motion:** escena 3D con el mozo, bandeja, smash burger y un mensaje de bienvenida con CTA para ver el menú.
3. **Menú:** categorías Smash, Combos, Acompañamientos y Bebidas; filtros y tarjetas de producto.
4. **Detalle de producto:** modal o panel con descripción, precio, cantidad, extras y CTA para agregar.
5. **Carrito:** drawer lateral en escritorio y panel inferior en móvil; permite editar cantidades, eliminar productos y ver subtotal/total.
6. **Checkout:** formulario de nombre, teléfono, dirección, modalidad de entrega/retiro y método de pago demostrativo.
7. **Confirmación:** resumen del pedido, código generado localmente, total y botón para volver al menú.

## Escena Three.js

- La escena se renderizará dentro de un contenedor accesible y adaptable.
- El mozo usará geometrías simples, materiales planos y movimientos suaves: respiración, parpadeo, inclinación y presentación de la bandeja.
- La hamburguesa usará geometría por capas con iluminación cálida, brillos controlados, queso fundido estilizado y sombras suaves para verse más realista que el personaje.
- La escena tendrá fondo minimalista, luces cálidas y un pequeño movimiento orbital de cámara.
- La animación se pausará o simplificará cuando `prefers-reduced-motion: reduce` esté activo.
- Si Three.js no carga o WebGL no está disponible, se mostrará una composición de fallback que mantiene visible el mensaje, la hamburguesa y el CTA.

## Datos e interacción

- Los productos estarán definidos en un arreglo local de JavaScript con id, nombre, categoría, descripción, precio, etiqueta y extras permitidos.
- El carrito tendrá una estructura serializable con producto, cantidad, extras y subtotal.
- `localStorage` conservará el carrito entre recargas.
- El total se calculará localmente; no se enviarán datos a servidores.
- El número de pedido se generará con una combinación de fecha y caracteres aleatorios.
- El checkout validará campos obligatorios, mostrará errores junto al campo correspondiente y evitará avanzar mientras falten datos.
- No se procesarán pagos reales ni se guardarán datos sensibles.

## Responsive y accesibilidad

- En escritorio, la escena 3D será protagonista en el hero y el catálogo ocupará una sección amplia debajo.
- En móvil, la escena se reducirá para priorizar el catálogo y el carrito se convertirá en un panel inferior.
- Todos los botones, filtros, campos y tarjetas interactivas tendrán focus visible y navegación por teclado.
- El carrito anunciará cambios importantes mediante `aria-live`.
- El canvas tendrá una etiqueta descriptiva y una alternativa textual visible cuando WebGL no esté disponible.
- El diseño respetará contraste, tamaño táctil y la preferencia de movimiento reducido.

## Arquitectura técnica

- `index.html`: estructura semántica, contenedores del canvas, catálogo, carrito y checkout.
- `styles.css`: tokens visuales, layout responsive, fallback, animaciones y estados de interfaz.
- `script.js`: catálogo, filtros, configurador, carrito, checkout, persistencia, reloj de pedido y controlador de escena.
- Tailwind CSS y Three.js se cargarán mediante CDN para mantener la apertura directa de `index.html` sin instalación.
- No habrá backend, build step, autenticación, base de datos ni dependencias instalables.

## Criterios de aceptación

- `index.html` abre la experiencia directamente en el navegador.
- La escena presenta al mozo y la hamburguesa, o muestra el fallback si WebGL/CDN no están disponibles.
- El visitante puede explorar las cuatro categorías y abrir detalles de productos.
- Se pueden agregar productos con extras y cantidades al carrito.
- El carrito permite editar, eliminar y recalcular subtotales y total.
- El checkout valida los campos y genera una confirmación simulada.
- El carrito sobrevive a una recarga gracias a `localStorage`.
- La interfaz mantiene su utilidad en móvil, teclado y movimiento reducido.
- No se realizan solicitudes de pedido ni pagos reales.

## Verificación

- Abrir `index.html` directamente y confirmar el estado inicial.
- Probar carga de Three.js y fallback sin WebGL.
- Probar filtros, detalle, extras, carrito, persistencia y checkout.
- Revisar teclado, focus, `aria-live` y responsive en escritorio y móvil.
- Confirmar que no existan errores uncaught en la consola.
