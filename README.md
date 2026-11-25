# 🎄 Selfie Navideña + Código QR

Aplicación web 100% estática (sin backend) para que cualquier persona escanee un código QR desde su celular, se tome una selfie en tiempo real, elija su **marco navideño** o **fondo navideño con IA**, y descargue o comparta su foto al instante.

## ✨ Qué incluye

- **Cabina de Selfie (`index.html`)**:
  - Cámara frontal/trasera en tiempo real (`getUserMedia`) + opción de **subir una foto** desde la galería.
  - **6 Marcos navideños** en alta resolución: Sin marco, Guirnalda Clásica, Nieve y Cristal, Luces Doradas, Polaroid Navideña y Bastón de Caramelo.
  - **7 Modos de Fondo con IA** (MediaPipe Selfie Segmentation en el navegador): Original, Bokeh Suave, Chimenea, Aldea Nevada, Aurora Boreal, Taller de Santa y Destellos Dorados.
  - Formatos seleccionables (`3:4`, `1:1`, `9:16`), modo espejo y temporizador de 3 segundos.
  - Descarga directa en PNG de alta resolución y botón **Compartir** nativo (WhatsApp, Instagram, etc.).
- **Generador de Código QR (`qr.html`)**:
  - Genera el código QR escaneable apuntando a la cabina.
  - 3 estilos de póster imprimible (Pino y Oro, Rojo Festivo, Marfil Claro).
  - Descarga solo el **QR en PNG (1024×1024)**, descarga el **Póster completo (1200×1600)** o imprímelo directamente.

## 🚀 Cómo probarlo en tu computadora

```bash
npm start
```

Luego abre en tu navegador:
- Cabina Selfie: `http://localhost:3000/`
- Generador de QR: `http://localhost:3000/qr.html`

## 📱 Cómo publicarlo gratis para que funcione en celulares (HTTPS)

Los navegadores móviles requieren **HTTPS** para permitir el acceso a la cámara. Como este proyecto es 100% estático (no necesita compilación ni servidor), puedes publicarlo gratis en menos de 1 minuto:

1. **Netlify Drop (más rápido)**: Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra esta carpeta completa. Te dará un enlace `https://...netlify.app`.
2. **GitHub Pages / Vercel / Cloudflare Pages**: Sube esta carpeta a un repositorio y activa el despliegue estático.
3. Abre `https://tu-enlace/qr.html` (o pega tu enlace en el generador de QR), descarga o imprime el QR ¡y listo para escanear!
