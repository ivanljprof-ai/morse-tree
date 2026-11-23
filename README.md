# 🌲 Morse Studio — Interactive Binary Tree & Translator

Un decodificador e intérprete interactivo de **Código Morse (ITU-R M.1677)** basado en una estructura de **Árbol Binario**, rediseñado con una interfaz espacial estilo **Apple (visionOS / macOS Sequoia)** con cristal translúcido, iluminación ambiente Cupertino, curvas Bézier suaves, sintetizador Web Audio configurable y **GitHub Pages** listo para usar en línea.

[![Live Demo](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-0071e3?style=for-the-badge&logo=github)](https://ivanljprof-ai.github.io/morse-tree/)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-Modern-orange?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

🌐 **Demo en vivo:** [https://ivanljprof-ai.github.io/morse-tree/](https://ivanljprof-ai.github.io/morse-tree/)

---

## ✨ Características Principales

-  **Estética Espacial Estilo Apple**: Barra de navegación flotante tipo cápsula, materiales *glassmorphism* con brillo especular superior (`backdrop-filter: blur(36px) saturate(180%)`), **Dynamic Island HUD**, switches nativos estilo Cupertino y hojas laterales accesibles (`inert` + navegación por teclado).
- 🌳 **Árbol Binario Interactivo con Curvas Bézier**:
  - **Izquierda (Raya `—` · ámbar)**: Camino izquierdo del árbol.
  - **Derecha (Punto `·` · cian)**: Camino derecho del árbol.
  - **Seguimiento en vivo de pulsaciones**: Mientras introduces puntos y rayas, el árbol ilumina paso a paso la ruta parcial antes incluso de decodificar la letra.
  - **Ajuste automático o vista detallada**: Alterna con un clic entre encajar todo el árbol en pantalla o hacer zoom para inspeccionarlo en detalle.
- 🏝️ **Dynamic Island HUD + Alfabeto Fonético OTAN**: Muestra la letra activa, su palabra fonética internacional (`Alfa`, `Bravo`, `Charlie`...), el código Morse y un botón directo de reproducción.
- 🎚️ **Sintetizador Web Audio Configurable**:
  - Selector de velocidad (**0.75× Lento**, **1× Normal**, **1.35× Rápido**).
  - Selector de frecuencia de tono (**550 Hz**, **680 Hz**, **800 Hz**) y botón rápido para silenciar (`🔊` / `🔇`).
- ⌨️ **Entrada Telegráfica Versátil**:
  - Barra espaciadora o pulsación mantenida sobre el pad (`<180 ms` punto, `≥180 ms` raya, con marcador visual del umbral).
  - Botones táctiles dedicados **`· Punto`** y **`— Raya`** para uso rápido en móvil o escritorio.
  - Modos **Letra a Letra** y **Modo Frase**, además de botones para reproducir, copiar al portapapeles, añadir espacio y limpiar.
- ⇄ **Traductor Bidireccional & Frases Clave**:
  - Convierte **Texto → Morse** o **Morse → Texto** automáticamente al detectar `.` / `-` y permite transmitir la secuencia animando el árbol.
  - Panel lateral de **Frases Clave** categorizadas (**Emergencia** y **Básico**).

---

## 🚀 Uso e Instalación

Puedes abrirlo directamente en línea desde **[GitHub Pages](https://ivanljprof-ai.github.io/morse-tree/)** sin instalar nada, o ejecutarlo localmente:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ivanljprof-ai/morse-tree.git
   cd morse-tree
   ```

2. **Abrir en el navegador:**
   - Abre `index.html` directamente en Chrome, Safari, Firefox o Edge.

---

## 📁 Estructura del Proyecto

```text
morse-tree/
├── .nojekyll       # Desactiva Jekyll para servir archivos estáticos directamente en GitHub Pages
├── index.html      # Estructura semántica, barra Apple, Dynamic Island HUD, consola y hojas laterales
├── styles.css      # Sistema de diseño espacial Apple, glassmorphism, transiciones y foco accesible
├── app.js          # Árbol binario Bézier, seguimiento en vivo, Web Audio, traductor bidireccional y presets
├── LICENSE         # Licencia MIT
└── README.md       # Documentación del proyecto
```

---

## 📜 Licencia

Este proyecto está liberado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
