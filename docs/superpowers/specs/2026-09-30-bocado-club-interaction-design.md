# Bocado Club: diseño de interacción y movimiento

## Objetivo

Optimizar la primera decisión del visitante y definir un sistema de movimiento que convierta la personalidad de Bocado Club —cercana, juguetona y premium— en una experiencia de compra clara. La acción principal será llegar al menú y elegir un producto en menos de diez segundos.

## Promesa y selección principal

- Promesa visible: smash burgers hechas al momento, con borde crujiente y una experiencia cercana, sin protocolo.
- CTA primario: `Ver el menú`, enlazado a `#menu`.
- CTA secundario: `Ver combos`, enlazado a `#combos`.
- El hero no esperará a Three.js para habilitar los CTA.
- El texto debe aparecer antes o al mismo tiempo que la ilustración para que la conversión no dependa del movimiento.

## Dirección visual

La dirección es “cocina en una toma”: un sistema cálido, breve y físico. El hero utiliza una ilustración vectorial minimalista, con pocos colores y trazos claros; el contenido de decisión —título, CTA, precios, total y formularios— permanece estable.

El 3D no vive en el hero. Se carga bajo demanda dentro del configurador de producto, donde el usuario ya está explorando un bocado concreto. Allí funciona como evidencia interactiva y ayuda a convertir la personalización en una experiencia tangible. Al cerrar el configurador, la escena se desmonta para no dejar un render continuo consumiendo recursos.

Se descartan el parallax fuerte, el scroll hijacking, los elementos que persiguen el cursor, los rebotes permanentes y cualquier animación que retrase la interacción.

## Sistema de movimiento

### Entrada inicial

El header aparece de forma casi instantánea. El eyebrow, el título y el subtítulo entran con `opacity` y un desplazamiento vertical corto de 8–14 px. Los CTA aparecen de inmediato, sin depender de la animación ni de una red externa. La ilustración vectorial entra después con una escala mínima. La secuencia completa no debe superar 700 ms.

### Scroll

Las secciones se revelan una sola vez con `IntersectionObserver`, usando únicamente `opacity` y `transform`. Las tarjetas del menú pueden tener una separación de hasta 60 ms entre sí. El combo y la historia usan una única entrada; no habrá parallax intenso ni movimiento continuo ligado al scroll.

### Hover y clic

- Botones: elevación de 2 px, sombra suave, icono desplazado 3 px y compresión a `scale(.97)` durante 90–120 ms al pulsar.
- Tarjetas: elevación máxima de 4 px y borde tomate más visible; la acción sigue siendo visible.
- Carrito: el contador pulsa una sola vez cuando se agrega un producto y se muestra un toast breve.
- En móvil no se dependerá de hover; el toque tendrá una respuesta de compresión y abrirá el configurador.

### Transiciones de vistas

- Navegación al menú: scroll suave de aproximadamente 450 ms y foco lógico en la sección.
- Configurador: backdrop con fade y tarjeta con `scale(.97) → scale(1)` en aproximadamente 220 ms.
- Carrito: backdrop de 180–220 ms y panel lateral de 280 ms.
- Checkout y confirmación: transición de 220–350 ms sin desplazamientos de layout.

## Rendimiento móvil y accesibilidad

- Priorizar `transform` y `opacity`; evitar cambios animados de layout.
- Mantener como máximo una animación continua visible.
- Desactivar adornos secundarios, parallax y partículas en pantallas pequeñas.
- Mantener el fallback vectorial del configurador cuando WebGL no esté disponible o no sea conveniente.
- Cargar Three.js sólo al abrir el configurador y desmontar la escena al cerrarlo.
- Respetar `prefers-reduced-motion`: sin parallax, sin animaciones infinitas y con transiciones casi instantáneas.
- No alterar el foco visible ni mover contenido anunciado por `aria-live`.

## Elementos que nunca se mueven

El título, subtítulo, CTA primario, precios, total del carrito, labels, errores, foco accesible, botones de cierre, navegación y mensajes `aria-live` deben conservar su posición y tamaño. La regla es: el contenido que ayuda a decidir permanece quieto; lo decorativo puede moverse.

## Criterios de aceptación

1. El CTA `Ver el menú` es visible y usable sin esperar a ningún recurso 3D.
2. `Ver combos` funciona como segunda ruta sin competir visualmente con el CTA primario.
3. Las animaciones de entrada no superan 700 ms ni desplazan el contenido crítico.
4. El movimiento usa principalmente `transform` y `opacity` y no produce saltos de layout.
5. La experiencia mantiene una variante reducida y usable con `prefers-reduced-motion`.
6. El configurador muestra 3D bajo demanda y conserva un fallback visual si la carga falla.
7. El carrito, checkout y confirmación conservan su comportamiento actual.

