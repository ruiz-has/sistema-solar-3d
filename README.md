# Sistema Solar 3D 🌌

Animación 3D interactiva de un sistema solar con Three.js.

## Funciones
- Planetas 3D con texturas.
- Órbitas y movimiento orbital.
- Sol con iluminación y halo.
- Campo de estrellas.
- Cámara orbital: arrastrar + rueda.
- Doble clic sobre un planeta para enfocarlo.
- Diseño pensado para publicarse directamente con GitHub Pages.

## Ejecutar
No necesita Node.js. Puedes abrir `index.html` con un servidor local.

Con Python:

```bash
python -m http.server 8000
```

Luego entra a:

`http://localhost:8000`

## GitHub Pages
1. Crea un repositorio, por ejemplo `sistema-solar-3d`.
2. Sube `index.html`, `style.css`, `main.js` y `README.md`.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona `main` y la carpeta `/ (root)`.
6. Guarda.
7. GitHub generará la dirección pública de tu página.

## Nota
Las texturas se cargan desde los ejemplos públicos de Three.js mediante CDN. Para una versión 100% independiente se pueden descargar y guardar localmente en `textures/`.
