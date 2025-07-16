//sound.js

// Integración de ml5.js y detección de frecuencias graves y agudas

// Asegúrate de incluir en tu HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
// <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>

// URL del modelo CREPE para detección de pitch
const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

let mic, fft;
let audioInitialized = false;
// Variables para detección de sonido corto y fuerte
let amplitudeActive = false;
let amplitudeStartTime = 0;
// Nivel mínimo RMS para considerar fuerte y duración máxima para corto
const amplitudeThreshold = 0.2; // 
const maxShortDuration = 200; // ms
// Bandas de frecuencia y thresholds para detección continua
// Se usarán en detectAudio para obtener energía en rangos específicos
// No se requiere crossing detection

// Rangos de frecuencia (Hz) - SEPARADOS Y CLAROS
const bassFreqLow = 80;        // inicio graves
const bassFreqHigh = 150;      // fin graves 
const trebleFreqLow = 1500;    // inicio agudos 
const trebleFreqHigh = 20000;  // fin agudos
// Thresholds de energía (0-255) para disparo continuo
const bassThreshold = 25;      // energía mínima graves 
const trebleThreshold = 2;     // energía mínima agudos 
/**
 * Inicia la entrada de audio y configura p5.FFT tras un gesto de usuario.
 */
function mousePressed() {
  if (!audioInitialized) {
    userStartAudio().then(() => {
      mic = new p5.AudioIn();
      // Iniciar micrófono y configurar FFT solo cuando esté listo
      mic.start(() => {
        fft = new p5.FFT();
        fft.setInput(mic);
        audioInitialized = true;
        console.log('Audio initialized: p5.FFT ready');
      }, err => {
        console.error('Error initiating mic:', err);
        mostrarErrorMicrofono();
      });
    }).catch(err => {
      console.error('Error starting audio user gesture:', err);
      mostrarErrorMicrofono();
    });
  }
}

/**
 * Detecta audio cada frame y dibuja mientras está activo.
 */
function detectAudio() { // se invoca en draw()
  if (!audioInitialized || !fft) return; // salir si no está listo
  fft.analyze(); // analizar espectro de audio
  // obtener energía en bandas de graves y agudos
  const bass = fft.getEnergy(bassFreqLow, bassFreqHigh);     // energía 80-400 Hz
  const treble = fft.getEnergy(trebleFreqLow, trebleFreqHigh); // energía 6000-12000 Hz
  const micLevel = mic.getLevel(); // nivel RMS del micrófono
  console.log(`🎙️ Mic Level: ${micLevel.toFixed(3)}`); // muestra nivel mic
  // Detección de sonido corto y fuerte (pulso)
  if (micLevel > amplitudeThreshold && !amplitudeActive) {
    amplitudeActive = true;              // empieza pulso
    amplitudeStartTime = millis();       // marca inicio
  } else if (micLevel <= amplitudeThreshold && amplitudeActive) {
    amplitudeActive = false;             // termina pulso
    let duration = millis() - amplitudeStartTime; // calcula duración
    if (duration < maxShortDuration) {   // si es corto
      if (typeof onboardingActivo !== 'undefined' && onboardingActivo) {
        console.log('DEBUG: Seleccionando paleta por micrófono');
        if (typeof seleccionarPaletaActual === 'function') {
          seleccionarPaletaActual();
        }
      } else {
        // Simular 'r' para cambiar luminosidad
        console.log(`🔆 Short loud sound (${duration}ms) detected: changing luminosity`);
        const evR = { key: 'r', keyCode: 82, preventDefault: () => {} };
        keyPressed(evR);
        setTimeout(() => { keyReleased(evR); }, 50);
      }
    }
  }
  console.log(`🔊 Bass (${bassFreqLow}-${bassFreqHigh}Hz): ${bass.toFixed(2)}, Treble (${trebleFreqLow}-${trebleFreqHigh}Hz): ${treble.toFixed(2)}`);
  
  // NUEVA LÓGICA CON FILTRADO: Si hay agudos, ignorar graves
  if (treble > trebleThreshold) {  // Agudos activos - PRIORIDAD ALTA
    modoColor = 'claro';           // cambia a modo claro
    pintarCeldaAleatoria();        // dibujar celda
    console.log(`🎵 AGUDO detectado (ignorando graves)`);
  } else if (bass > bassThreshold) {  // Solo graves si NO hay agudos
    modoColor = 'oscuro';          // cambia a modo oscuro
    pintarCeldaAleatoria();        // dibujar celda
    console.log(`🎵 GRAVE detectado`);
  }
}

// Función utilitaria para mostrar el mensaje de error de micrófono
function mostrarErrorMicrofono() {
  const div = document.getElementById('mic-error');
  if (div) div.style.display = 'flex';
}

// Agregar función para resetear el estado de amplitud
function resetAmplitudeDetection() {
  amplitudeActive = false;
  amplitudeStartTime = 0;
}