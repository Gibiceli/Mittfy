# Mittfy
Un programa de codigo abierto que te permite descargar musica de spotify

## Guía de Instalación 

Si eres nuevo por aquí y quieres probar **Mittfy** en tu computadora, no te preocupes. Sigue estos sencillos pasos y tendrás tu propio servidor de música corriendo en menos de 5 minutos. 

### 📋 Requisitos Previos
Antes de empezar, asegúrate de tener instalado **Node.js** en tu computadora. Si no lo tienes, puedes descargarlo e instalarlo gratis desde su página oficial: [nodejs.org](https://nodejs.org/). (Elige la versión que dice "LTS").

---

#### 1. Descargar el Proyecto
Haz clic en el botón verde de arriba que dice **"Code"** y luego selecciona **"Download ZIP"**. Descomprime esa carpeta en el lugar de tu computadora que más te guste (por ejemplo, en tu Escritorio).

#### 2. Descargar el "Motor" (yt-dlp)
Para que la aplicación pueda procesar las búsquedas sin bloqueos, necesitamos una pequeña herramienta llamada `yt-dlp`. 
- Descarga el archivo ejecutable para Windows desde este enlace oficial: [yt-dlp.exe](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe).
- **MUY IMPORTANTE:** Toma ese archivo `yt-dlp.exe` que acabas de descargar y **pégalo dentro de la carpeta del proyecto**, justo al lado del archivo `server.js`.

#### 3. Instalar las dependencias
Abre la terminal de tu sistema (puedes usar PowerShell o la terminal de VS Code) dentro de la carpeta del proyecto y ejecuta el siguiente comando para descargar los paquetes necesarios:
```bash
npm install
