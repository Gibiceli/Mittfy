const express = require('express');
const cors = require('cors');
const archiver = require('archiver');
const { spawn } = require('child_process');
const path = require('path');
const { getTracks } = require('spotify-url-info')(fetch); 

const app = express();
app.use(cors());
app.use(express.json());

// 🆕 Mapa para guardar los "túneles" de comunicación con los navegadores
const clientesSSE = new Map();

// 🆕 Endpoint para abrir el túnel de mensajes en vivo
app.get('/estado-descarga', (req, res) => {
    const id = req.query.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Guardamos la conexión de este usuario
    clientesSSE.set(id, res);

    // Si el usuario cierra la pestaña, lo borramos
    req.on('close', () => {
        clientesSSE.delete(id);
    });
});

// Función ayudante para enviar mensajes al frontend
const emitirProgreso = (id, mensaje, porcentaje) => {
    if (clientesSSE.has(id)) {
        clientesSSE.get(id).write(`data: ${JSON.stringify({ mensaje, porcentaje })}\n\n`);
    }
};

app.post('/descargar-playlist', async (req, res) => {
    const url = req.body.url;
    const clientId = req.body.clientId; // 🆕 Recibimos el ID del usuario

    console.log('\n--- NUEVA PETICIÓN ---');
    console.log('URL recibida:', url);

    res.attachment('Mittfy-Playlist.zip');
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err) => {
        console.error('Error durante la compresión:', err);
        if (!res.headersSent) res.status(500).send('Error empaquetando.');
    });

    archive.pipe(res);

    try {
        emitirProgreso(clientId, "🕵️‍♂️ Analizando la playlist en Spotify...", 5);
        const tracks = await getTracks(url);
        
        if (!tracks || tracks.length === 0) throw new Error('Playlist vacía o inválida.');

        // LÍMITE DE PRUEBA: Sigue en 3 para testear. ¡Cámbialo a tracks.length cuando quieras bajar todo!
        const limitePrueba = Math.min(tracks.length, 3); 
        
        for (let i = 0; i < limitePrueba; i++) {
            const track = tracks[i];
            if (!track) continue;

            const nombreCancion = track.name;
            const artistas = track.artists ? track.artists.map(a => a.name).join(' ') : '';
            const nombreArchivoLimpio = `${nombreCancion} - ${artistas}`.replace(/[^a-zA-Z0-9 -]/g, "").trim();
            const queryBusqueda = `${nombreCancion} ${artistas} audio`;

            // 🆕 Calculamos el porcentaje y lo enviamos a tu pantalla
            const porcentaje = Math.round(((i) / limitePrueba) * 100);
            emitirProgreso(clientId, `⬇️ Descargando: ${nombreCancion} - ${artistas}`, porcentaje);

            console.log(`\n🔎 [${i+1}/${limitePrueba}] Ejecutando yt-dlp para: ${nombreCancion}`);
            
            await new Promise((resolve) => {
                const rutaYtDlp = path.join(__dirname, 'yt-dlp.exe');
                const ytDlpProcess = spawn(rutaYtDlp, [
                    `ytsearch1:${queryBusqueda}`, 
                    '-f', 'bestaudio', 
                    '--no-playlist', 
                    '-o', '-' 
                ]);

                archive.append(ytDlpProcess.stdout, { name: `${nombreArchivoLimpio}.mp3` });

                ytDlpProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ Añadida -> ${nombreArchivoLimpio}.mp3`);
                    }
                    resolve();
                });

                ytDlpProcess.on('error', (err) => {
                    console.log(`❌ Error yt-dlp: ${err.message}`);
                    resolve();
                });
            });
        }

        emitirProgreso(clientId, "📦 Empaquetando el archivo ZIP final...", 99);
        archive.append('¡Gracias por usar Mittfy!', { name: 'mittfy-log.txt' });

    } catch (error) {
        emitirProgreso(clientId, `❌ Error: ${error.message}`, 0);
        archive.append(`Error: ${error.message}`, { name: 'error-log.txt' });
    }

    archive.finalize();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🎵 Servidor Mittfy encendido en http://localhost:${PORT}`);
});