let player;
let tiempoVisto = 0;
let intervalo;
const TIEMPO_OBJETIVO = 300; // segundos
let lastTime = 0;
let felicitacionMostrada = false;
let advertenciaMostrada = false;
let velocidadAnterior = 1;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '315',
        width: '560',
        videoId: 'xQByz0Kv3L4', // Cambia este ID por el video que desees
        playerVars: {
            controls: 1, // Puedes poner 0 para ocultar controles, pero 1 es más amigable
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onPlaybackRateChange': onPlaybackRateChange
        }
    });
}

// Detectar cambio de pestaña o ventana
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (player && typeof player.pauseVideo === "function") {
            player.pauseVideo();
        }
        mostrarAdvertencia("No cambies de pestaña o minimices la ventana. El video se ha pausado.");
        advertenciaMostrada = true;
    } else if (advertenciaMostrada) {
        ocultarAdvertencia();
        advertenciaMostrada = false;
    }
});

// Detectar cambio de velocidad de reproducción
function onPlaybackRateChange(event) {
    if (!player) return;
    let velocidadActual = player.getPlaybackRate();
    if (velocidadActual !== 1) {
        tiempoVisto = 0;
        document.getElementById('tiempo-restante').textContent = TIEMPO_OBJETIVO;
        actualizarTimerSVG(TIEMPO_OBJETIVO);
        mostrarAdvertencia("No cambies la velocidad del video. El contador se reinició.");
        // Opcional: Regresa la velocidad a 1x
        player.setPlaybackRate(1);
    }
    velocidadAnterior = velocidadActual;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && !intervalo) {
        intervalo = setInterval(contarTiempo, 1000);
        lastTime = Math.floor(player.getCurrentTime());
    } else if (event.data !== YT.PlayerState.PLAYING && intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
}

function contarTiempo() {
    if (!player || typeof player.getCurrentTime !== "function") return;
    let currentTime = Math.floor(player.getCurrentTime());

    // Detectar si el usuario adelanta
    if (currentTime > lastTime + 2) {
        mostrarInstruccionAdelantar();
        lastTime = currentTime;
        return; // No avanza el contador
    }

    // Detectar si el usuario retrocede
    if (currentTime < lastTime) {
        tiempoVisto = 0;
        document.getElementById('tiempo-restante').textContent = TIEMPO_OBJETIVO;
        actualizarTimerSVG(TIEMPO_OBJETIVO);
        mostrarAdvertencia("No retrocedas el video. El contador se reinició.");
        lastTime = currentTime;
        return;
    }

    ocultarAdvertencia();
    ocultarInstruccionAdelantar();
    tiempoVisto++;
    let restante = TIEMPO_OBJETIVO - tiempoVisto;
    document.getElementById('tiempo-restante').textContent = restante > 0 ? restante : 0;
    actualizarTimerSVG(restante);
    if (tiempoVisto >= TIEMPO_OBJETIVO && !felicitacionMostrada) {
        clearInterval(intervalo);
        intervalo = null;
        mostrarFelicitaciones();
        felicitacionMostrada = true;
    }
    lastTime = currentTime;
}

function actualizarTimerSVG(restante) {
    const progressCircle = document.getElementById('timer-progress');
    if (!progressCircle) return;
    const radio = 45;
    const circunferencia = 2 * Math.PI * radio;
    let progreso = 1 - (restante / TIEMPO_OBJETIVO);
    let offset = circunferencia * (1 - progreso);
    progressCircle.style.strokeDashoffset = offset;

    // Cambiar color según progreso
    if (progreso < 0.33) {
        progressCircle.setAttribute('stroke', '#f44336'); // rojo
    } else if (progreso < 0.66) {
        progressCircle.setAttribute('stroke', '#ffeb3b'); // amarillo
    } else {
        progressCircle.setAttribute('stroke', '#4caf50'); // verde
    }
}

function mostrarFelicitaciones() {
    // Mostrar modal de vale personalizado
    const modal = document.getElementById('vale-modal');
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const codigo = generarVale();
    document.getElementById('vale-fecha').textContent = fechaStr;
    document.getElementById('vale-codigo').textContent = codigo;
    // Generar código de barras
    if (window.JsBarcode) {
        JsBarcode("#vale-barcode", codigo, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: false,
            margin: 0
        });
    }
    if (modal) modal.style.display = 'flex';
}

function mostrarAlertaTrampa() {
    const mensaje = document.getElementById('mensaje');
    mensaje.innerHTML = "No adelantes ni retrocedas el video. El contador se reinició.";
    mensaje.classList.remove('animar-felicitacion');
    setTimeout(() => {
        mensaje.innerHTML = "";
    }, 2500);
}

function mostrarAdvertencia(msg) {
    const mensaje = document.getElementById('mensaje');
    mensaje.innerHTML = msg;
    mensaje.classList.remove('animar-felicitacion');
    mensaje.style.color = "#f44336";
}

function ocultarAdvertencia() {
    const mensaje = document.getElementById('mensaje');
    mensaje.innerHTML = "";
    mensaje.style.color = "";
}

function generarVale() {
    // Genera un código aleatorio simple
    return 'VALE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Mostrar ayuda al cargar
window.addEventListener('DOMContentLoaded', () => {
    const ayuda = document.getElementById('ayuda-modal');
    if (ayuda) ayuda.style.display = 'flex';
});

function cerrarAyuda() {
    const ayuda = document.getElementById('ayuda-modal');
    if (ayuda) ayuda.style.display = 'none';
}

// Bloquear clic derecho (desactivado temporalmente para pruebas)
// window.addEventListener('contextmenu', function(e) {
//     e.preventDefault();
// });

// Bloquear teclas de herramientas de desarrollador (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
window.addEventListener('keydown', function(e) {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
        return false;
    }
}); // <-- faltaba cerrar el paréntesis aquí

// Nueva función para mostrar instrucción de adelantar
function mostrarInstruccionAdelantar() {
    let adv = document.getElementById('instruccion-adelantar');
    if (!adv) {
        adv = document.createElement('div');
        adv.id = 'instruccion-adelantar';
        adv.className = 'instruccion-adelantar';
        adv.textContent = "Adelantar el video puede perjudicar el progreso de tu vale. Por favor, mira el video de forma continua.";
        document.body.appendChild(adv);
    }
    adv.style.display = 'block';
}

// Nueva función para ocultar la instrucción
function ocultarInstruccionAdelantar() {
    let adv = document.getElementById('instruccion-adelantar');
    if (adv) adv.style.display = 'none';
}

function cerrarVale() {
    const modal = document.getElementById('vale-modal');
    if (modal) modal.style.display = 'none';
}

function reclamarVale() {
    const codigo = document.getElementById('vale-codigo').textContent;
    const fecha = document.getElementById('vale-fecha').textContent;
    const texto = `🎉 ¡He obtenido mi vale! 🎉\nCódigo: ${codigo}\nGenerado el: ${fecha}`;
    if (navigator.share) {
        navigator.share({
            title: 'Mi Vale de Felicitación',
            text: texto,
            // Puedes agregar una URL si lo deseas
        }).catch(() => {});
    } else {
        // Fallback: copiar al portapapeles
        copiarAlPortapapeles(texto);
        alert('El código del vale ha sido copiado al portapapeles. ¡Compártelo donde quieras!');
    }
}

function copiarAlPortapapeles(texto) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto);
    } else {
        // Fallback para navegadores antiguos
        const temp = document.createElement('textarea');
        temp.value = texto;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    }
}