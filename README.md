# AURA 99 — The Scent Archive

**AURA 99** es una experiencia web premium para descubrir una fragancia que se sienta como vos. La página combina dirección de arte editorial, exploración sensorial e interacciones suaves para convertir la elección de un perfume en un pequeño ritual.

No necesita backend, base de datos ni instalación de dependencias: todo funciona desde el navegador con HTML, CSS y JavaScript vanilla.

## ✨ Características y módulos principales

1. **🌌 Atmósfera viva con HTML5 Canvas**
   - Campo de partículas liviano dentro de la esfera sensorial principal.
   - Movimiento ambiental sutil y parallax con el puntero.
   - Control opcional de `Activar aura` y slider de intensidad.
   - Respeta `prefers-reduced-motion` para reducir el movimiento cuando el usuario lo solicita.

2. **🧭 Explorador de aroma de 30 segundos**
   - Quiz de tres impulsos, sin cuentas y sin fórmulas visibles.
   - Clasifica la dirección entre familias etérea, amaderada y eléctrica.
   - Entrega una recomendación local y permite abrir su ficha desde la colección.

3. **🎛️ The Mood Lab**
   - Laboratorio interactivo de estados: Susurro, Solar, Raíz y Nocturna.
   - Cambia la temperatura visual, el mensaje, la familia olfativa y la intensidad de la escena.
   - Diseñado para que el visitante explore antes de decidir.

4. **🧪 Colección sensorial**
   - Cuatro esencias: Bruma 02, Cobre 07, Volt 11 y Noche 04.
   - Tarjetas con atmósferas visuales diferentes y estados hover.
   - Cada esencia abre una ficha modal con notas, proyección y momento recomendado.

5. **📖 Ritual editorial**
   - Sección narrativa para reforzar la promesa de marca.
   - CTA de regreso al explorador para cerrar el recorrido de conversión.

6. **📱 Responsive y accesible**
   - Layout adaptado a desktop, tablet y móvil.
   - Navegación semántica, botones accesibles, `aria-live`, `focus-visible` y diálogo nativo.
   - Animaciones contenidas para conservar el rendimiento en dispositivos móviles.

## 🛠️ Tecnologías empleadas

- **HTML5 semántico** para la estructura, navegación, quiz, colección y modal.
- **Tailwind CSS CDN** para utilidades de layout y configuración base.
- **CSS personalizado** para la dirección de arte, gradientes, tipografía, estados y motion design.
- **JavaScript vanilla ES6+** para el Canvas, el quiz, el laboratorio de estados y las fichas modales.
- **HTML5 Canvas 2D** para la atmósfera de partículas sin WebGL ni librerías pesadas.
- **Google Fonts**: `Manrope`, `DM Mono` y `Playfair Display`.

## 📂 Estructura

```text
Proyecto AURA99/
├── index.html     # Estructura y contenido de la experiencia
├── styles.css     # Sistema visual, responsive y animaciones
├── script.js      # Canvas, quiz, Mood Lab y modales
└── README.md      # Documentación del proyecto
```

## 🚀 Cómo ejecutar el proyecto

### Opción 1: abrir directamente

Abrí `index.html` con Chrome, Edge, Firefox o cualquier navegador moderno.

### Opción 2: servidor local recomendado

Desde la carpeta del proyecto ejecutá:

```bash
python -m http.server 4173
```

Después visitá:

```text
http://127.0.0.1:4173/index.html
```

El servidor local evita restricciones del navegador sobre recursos externos y permite probar la experiencia como un sitio real.

## 🎨 Dirección de diseño

AURA 99 mezcla **lujo editorial**, **laboratorio sensorial** y una atmósfera nocturna de alto contraste. La paleta usa tinta profunda como base, lima para las acciones, lavanda para la parte etérea y ámbar para las notas cálidas.

La interacción sigue tres reglas:

- El movimiento aporta contexto, atmósfera o feedback.
- Las acciones importantes permanecen visibles y estables.
- Ningún efecto bloquea el contenido ni obliga al usuario a esperar.

## 🔒 Alcance técnico

- Sin backend.
- Sin autenticación.
- Sin base de datos.
- Sin instalación de paquetes.
- Datos, recomendaciones y estados almacenados en memoria del navegador.
- El fondo Canvas se mantiene acotado para no convertir la landing en una experiencia pesada.

## 📚 Proyecto académico

Desarrollado como parte de la **Tarea 19 — IA en GitHub y Herramientas de Productividad**.

La experiencia fue diseñada y construida con asistencia de Inteligencia Artificial, priorizando conversión, narrativa visual, accesibilidad y rendimiento frontend.
