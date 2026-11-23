# 🌲 Morse Studio 3D — Interactive Binary Tree & Translator

Un decodificador e intérprete interactivo de **Código Morse (ITU-R M.1677)** basado en una estructura de **Árbol Binario**, diseñado en **Apple Light Mode (Frosted Ceramic & Silver)** con un escenario espacial **3D interactivo**, manipulador telegráfico mecánico 3D, esferas volumétricas, sintetizador Web Audio configurable y **GitHub Pages** listo para usar en línea.

[![Live Demo](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-0071e3?style=for-the-badge&logo=github)](https://ivanljprof-ai.github.io/morse-tree/)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-Modern-orange?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

🌐 **Demo en vivo:** [https://ivanljprof-ai.github.io/morse-tree/](https://ivanljprof-ai.github.io/morse-tree/)

---

## ✨ Características Principales

-  **Estética Apple Daylight (Cerámica y Cristal Translúcido)**: Fondo claro `#f5f5f7`, barra de navegación flotante tipo cápsula, materiales *frosted glass* con brillo especular superior, **Dynamic Island HUD 3D** con inclinación espacial al puntero, switches Cupertino y hojas laterales accesibles (`inert` + navegación por teclado).
- 🧊 **Escenario Espacial 3D + Nodos Volumétricos**:
  - Tablero flotante 3D (`perspective: 1400px`) con profundidad física, reflejo especular dinámico al mover el cursor y botón **`🧊 Vista 3D`** para alternar al instante entre perspectiva espacial 3D y vista plana 2D.
  - Nodos cerámicos 3D con sombreado esférico y ramas Bézier diferenciadas por color (**ámbar** izquierda para raya `—`, **cian** derecha para punto `·`) con seguimiento en vivo de cada pulsación.
  - Botón para alternar entre **ajustar a pantalla** o **vista detallada**.
- 🕹️ **Manipulador Telegráfico 3D y Teclas Extruidas**:
  - Palanca telegráfica mecánica 3D animada y **LED 3D de transmisión** (azul cian para `·`, ámbar para `—`) dentro de la consola de entrada.
  - Teclas físicas extruidas en 3D **`· Punto (Corto)`** y **`— Raya (Largo)`**, además de barra espaciadora/pad con indicador del umbral de `180 ms`.
- 🏝️ **Dynamic Island HUD 3D + Alfabeto Fonético OTAN**: Muestra la letra activa, su palabra fonética internacional (`Alfa`, `Bravo`, `Charlie`...), el código Morse y un botón directo de reproducción.
- 🎚️ **Sintetizador Web Audio Configurable**: Velocidad (**0.75× Lento**, **1× Normal**, **1.35× Rápido**), frecuencia (**550 Hz**, **680 Hz**, **800 Hz**) y silencio rápido (`🔊` / `🔇`).
- ⇄ **Traductor Bidireccional & Frases Clave**: Convierte **Texto → Morse** o **Morse → Texto** automáticamente al detectar `.` / `-`, permite transmitir la secuencia animando el árbol y el LED 3D, e incluye panel lateral de **Frases Clave** (**Emergencia** y **Básico**).

---

## 🚀 Uso e Instalación

Ábrelo directamente desde **[GitHub Pages](https://ivanljprof-ai.github.io/morse-tree/)** sin instalar nada, o ejecútalo en local:

```bash
git clone https://github.com/ivanljprof-ai/morse-tree.git
cd morse-tree
```

Abre `index.html` en Chrome, Safari, Firefox o Edge.

---

## 📁 Estructura del Proyecto

```text
morse-tree/
├── .nojekyll       # Desactiva Jekyll para servir archivos estáticos directamente en GitHub Pages
├── index.html      # Estructura semántica, Dynamic Island 3D, manipulador 3D y hojas laterales
├── styles.css      # Apple Light Mode, materiales cerámicos, perspectiva 3D, keycaps 3D y foco accesible
├── app.js          # Árbol binario Bézier, parallax 3D, hardware virtual, Web Audio y traductor bidireccional
├── LICENSE         # Licencia MIT
└── README.md       # Documentación del proyecto
```

---

## 📜 Licencia

Este proyecto está liberado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
