# Neo Metro — Diseño de experiencia

**Fecha:** 2026-09-30
**Estado:** Aprobado para implementación

## Resumen

Neo Metro será una página web premium y moderna que presenta una ciudad inteligente futurista como un mapa explorable. El usuario podrá seleccionar distritos de la ciudad y consultar información visual, métricas demostrativas y acciones destacadas sin backend ni base de datos.

## Objetivo

Crear una experiencia visual llamativa para una entrega académica de desarrollo web, demostrando el uso de HTML, Tailwind CSS y JavaScript en una interfaz autónoma, responsive e interactiva.

## Dirección visual

- Fondo nocturno azul grafito, con cyan, violeta y verde eléctrico como colores de acento.
- Estética de vidrio translúcido, bordes finos, gradientes controlados y sombras suaves.
- Tipografía moderna y composición tipo centro de control futurista.
- Mapa central construido con HTML, CSS y SVG: avenidas luminosas, edificios abstractos, puntos de interés y líneas de tránsito.
- Animaciones breves y sutiles: pulsos, tráfico luminoso, entrada del panel y contadores.

## Estructura de la página

1. **Barra superior:** marca NEO METRO, estado del sistema, hora simulada y control visual.
2. **Mapa principal:** ciudad completa en el área central, con cuatro distritos seleccionables.
3. **Distritos:** Innovation Hub, Creative Quarter, Green Grid y Motion District.
4. **Panel lateral dinámico:** nombre, descripción, nivel de actividad, métricas y acción destacada del distrito seleccionado.
5. **Estado inicial:** bienvenida y distrito destacado para orientar al usuario.

## Interacción

- Hacer clic en un distrito lo resalta y actualiza el panel lateral.
- Las métricas se animan al cambiar de distrito.
- El panel puede cerrarse y reabrirse seleccionando otra zona.
- Los elementos interactivos tendrán estados hover y focus.
- En móvil, el panel lateral se transforma en una tarjeta inferior.
- Se respetará la preferencia del sistema para reducir movimiento cuando corresponda.

## Arquitectura técnica

- `index.html`: estructura semántica y componentes de la interfaz.
- `script.js`: datos locales de los distritos, selección, panel, contadores y comportamientos.
- `styles.css`: estilos específicos y detalles visuales complementarios a Tailwind.
- Tailwind CSS se cargará mediante CDN para permitir abrir `index.html` directamente sin instalar dependencias ni iniciar un servidor.
- No se utilizarán llamadas externas de datos, backend ni base de datos.

## Responsive y accesibilidad

- Diseño adaptable para escritorio, tablet y móvil.
- Controles con etiquetas comprensibles y navegación por teclado.
- Contraste suficiente entre texto y fondo.
- Estados visuales para hover, focus y selección.
- Animaciones moderadas y compatibles con `prefers-reduced-motion`.

## Criterios de aceptación

- Al abrir `index.html`, la ciudad se muestra correctamente y comunica su propósito en pocos segundos.
- Los cuatro distritos pueden seleccionarse con clic.
- El panel actualiza el contenido según el distrito seleccionado.
- Los contadores y transiciones funcionan sin errores visibles.
- La interfaz conserva su utilidad en pantallas pequeñas.
- El proyecto funciona sin backend ni instalación de dependencias.

## Verificación

- Revisar la carga inicial en navegador.
- Probar los cuatro distritos y el cierre/reapertura del panel.
- Probar teclado, focus y responsive.
- Confirmar que no haya errores en la consola.
- Revisar visualmente el resultado final en escritorio y móvil.
