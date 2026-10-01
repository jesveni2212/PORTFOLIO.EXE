# PORTFOLIO.EXE — Build 95.24

**PORTFOLIO.EXE** es un portafolio interactivo construido como una computadora personal de los años 90. En lugar de presentar el perfil como una página tradicional, convierte la experiencia en una pequeña aventura: el visitante inicia el sistema, abre aplicaciones, explora proyectos en un mapa y escribe comandos en una terminal.

La estética retro es solo la puerta de entrada. La interfaz está pensada con criterios actuales de jerarquía visual, accesibilidad, responsive design y microinteracciones útiles.

## ✨ Características principales

1. **🖥️ Arranque de sistema interactivo**
   - Pantalla de boot con comandos, estados y barra de progreso.
   - Entrada rápida para saltar el arranque.
   - Transición hacia un escritorio tipo sistema operativo.

2. **🗂️ Escritorio exploratorio**
   - Íconos para abrir `ABOUT.EXE`, `PROJECTS`, `SKILLS.SYS` y `TERMINAL`.
   - Ventana de bienvenida con CTA principal.
   - Barra de tareas y menú `START`.
   - Reloj local y estado de conexión.

3. **🪟 Ventanas interactivas**
   - Ventanas que se pueden abrir, cerrar, minimizar y enfocar.
   - Drag & drop en escritorio para dispositivos con puntero fino.
   - Cada aplicación tiene una función concreta y contenido independiente.

4. **🧭 Mapa 2D de proyectos**
   - Tres nodos explorables: AURA 99, ATLAS y MONO/01.
   - Al seleccionar un nodo cambian la descripción, el stack y el estado del proyecto.
   - Presentación de proyectos como misiones completadas.

5. **⌨️ Terminal funcional**
   - Comandos disponibles: `help`, `about`, `projects`, `skills`, `contact`, `whoami`, `status` y `clear`.
   - Los comandos de navegación abren la aplicación correspondiente.
   - No ejecuta comandos del sistema: es una simulación segura dentro del navegador.

6. **📊 Sistema de habilidades**
   - Visualización de capacidades con métricas y barras de progreso.
   - Sección preparada para reemplazar los datos de ejemplo por información personal.

7. **✉️ Canal de contacto**
   - Enlaces de contacto sin formulario backend.
   - Copia del email usando `Clipboard API` cuando el navegador lo permite.
   - Estado visible de la acción para evitar feedback ambiguo.

8. **📱 Responsive retro-moderno**
   - En desktop funciona como un escritorio con ventanas.
   - En móvil las ventanas se convierten en paneles completos y navegables.
   - Incluye `focus-visible`, textos accesibles y soporte para `prefers-reduced-motion`.

## 🛠️ Tecnologías empleadas

- **HTML5 semántico** para la estructura de escritorio, ventanas y navegación.
- **Tailwind CSS CDN** para utilidades base y configuración de color.
- **CSS personalizado** para la interfaz retro, ventanas, animaciones, grilla y responsive.
- **JavaScript vanilla ES6+** para boot, window manager, drag & drop, terminal y mapa de proyectos.
- **Google Fonts**: `VT323`, `IBM Plex Mono` y `DM Mono`.

No utiliza frameworks pesados, backend, base de datos ni paquetes obligatorios.

## 📂 Estructura del proyecto

```text
PORTFOLIO.EXE/
├── index.html     # Escritorio, ventanas, terminal y contenido
├── styles.css     # Sistema visual retro y responsive
├── script.js      # Boot, ventanas, comandos y mapa de proyectos
└── README.md      # Documentación
```

## 🚀 Cómo ejecutar

### Opción 1: abrir directamente

Abrí `index.html` con Chrome, Edge, Firefox o cualquier navegador moderno.

### Opción 2: usar un servidor local

Desde la carpeta del proyecto ejecutá:

```bash
python -m http.server 4173
```

Después visitá:

```text
http://127.0.0.1:4173/index.html
```

El servidor local es la opción recomendada para probar correctamente las fuentes externas y la Clipboard API.

## 🧩 Personalización rápida

La información principal de proyectos se encuentra en `script.js`, dentro del objeto `projectData`. Allí se pueden cambiar títulos, descripciones, tecnologías y estados.

Los accesos de contacto están en `index.html`, dentro de `CONTACT.EXE`. También podés editar los porcentajes de habilidades directamente en la estructura HTML de `SKILLS.SYS`.

## 🧠 Principios de código

- **KISS:** cada interacción tiene una responsabilidad clara.
- **DRY:** los datos de proyectos, ventanas y comandos se reutilizan desde objetos y funciones comunes.
- **SOLID:** el boot, el administrador de ventanas, la terminal, el mapa y el contacto están separados en inicializadores independientes.
- **Progressive enhancement:** si una API opcional como Clipboard no está disponible, la interfaz comunica el estado sin romper la experiencia.

## 📚 Proyecto académico

Desarrollado como parte de la **Tarea 19 — IA en GitHub y Herramientas de Productividad**.

La experiencia fue creada con asistencia de Inteligencia Artificial, priorizando creatividad, interacción, narrativa visual, accesibilidad y código frontend mantenible.
