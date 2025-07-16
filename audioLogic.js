// audioLogic.js - Integración de procesamiento de audio

// ==========================================
// VARIABLES DE CONFIGURACIÓN
// ==========================================
const AMP_MIN = 0.5;      // Amplitud mínima para la puerta de ruido (umbral bajo)
const AMP_MAX = 1.0;       // Amplitud máxima para normalización
const FREC_MIN = 50;       // Frecuencia mínima para el filtro
const FREC_MAX = 20000;     // Frecuencia máxima para el filtro
const AMORTIGUACION = 0.8; // Factor de suavizado para los filtros (amortiguación)

// ==========================================
// PARTE 1: CALIBRACIÓN (PUERTA)
// ==========================================
class GateCalibration {
  constructor() {
    this.mic = new p5.AudioIn(); // Inicializa el objeto para la entrada de audio del micrófono
    this.mic.start(); // Inicia la captura de audio del micrófono
    this.amp = 0; // Inicializa la variable para almacenar la amplitud del audio
  }
  update() {
    this.amp = this.mic.getLevel(); // Obtiene el nivel (amplitud) actual del micrófono
    return this.amp; // Devuelve la amplitud actual
  }
  isAboveThreshold() {
    return this.amp > AMP_MIN; // Comprueba si la amplitud supera el umbral mínimo (puerta de ruido)
  }
}

// ==========================================
// PARTE 2: AMORTIGUACIÓN (COMPRESOR)
// ==========================================
class SignalFilter {
  constructor(minValue, maxValue) {
    this.minValue = minValue; // Define el valor mínimo esperado para la entrada
    this.maxValue = maxValue; // Define el valor máximo esperado para la entrada
    this.filteredValue = 0; // Inicializa el valor filtrado
  }
  update(inputValue) {
    // Normaliza el valor de entrada a un rango de 0 a 1 y lo restringe a ese rango
    let raw = constrain(map(inputValue, this.minValue, this.maxValue, 0, 1), 0, 1);
    // Aplica un suavizado (amortiguación) al valor filtrado
    this.filteredValue = this.filteredValue * AMORTIGUACION + raw * (1 - AMORTIGUACION);
    return this.filteredValue; // Devuelve el valor suavizado
  }
}

// ==========================================
// PARTE 3: DETECCIÓN DE EVENTOS
// ==========================================
class SoundEventDetector {
  constructor() {
    this.hasSoundNow = false; // Estado actual: ¿hay sonido?
    this.hadSoundBefore = false; // Estado anterior: ¿había sonido?
    this.soundStartTime = 0; // Momento en que comenzó el sonido
    this.soundDuration = 0; // Duración del sonido actual
    this.minDuration = 200; // Duración mínima para considerar un sonido "largo"
  }
  update(isAboveThreshold) {
    this.hadSoundBefore = this.hasSoundNow; // Guarda el estado actual como estado anterior
    this.hasSoundNow = isAboveThreshold; // Actualiza el estado actual con la nueva detección
    if (this.hasSoundNow && !this.hadSoundBefore) {
      this.soundStartTime = millis(); // Registra el inicio del sonido si acaba de empezar
    }
    if (this.hasSoundNow) {
      this.soundDuration = millis() - this.soundStartTime; // Calcula la duración si el sonido está activo
    } else {
      this.soundDuration = 0; // Reinicia la duración si no hay sonido
    }
    return {
      soundStarted: this.hasSoundNow && !this.hadSoundBefore, // Indica si un sonido acaba de empezar
      soundEnded: !this.hasSoundNow && this.hadSoundBefore,   // Indica si un sonido acaba de terminar
      isLongSound: this.soundDuration > this.minDuration       // Indica si el sonido actual es "largo"
    };
  }
}

// ==========================================
// PARTE 4: DETECCIÓN DE FRECUENCIA ML5
// ==========================================
class FrequencyDetector {
  constructor() {
    this.audioContext = getAudioContext(); // Obtiene el contexto de audio del navegador
    this.mic = null; // Referencia al micrófono (se asigna después)
    this.pitch = null; // Objeto para la detección de tono (pitch) de ml5.js
    this.frequency = 0; // Frecuencia detectada actualmente
    this.prevFrequency = 0; // Frecuencia detectada previamente
    this.frequencyDiff = 0; // Diferencia entre la frecuencia actual y la anterior
    // URL del modelo de detección de tono de ml5.js
    this.modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  }
  setup(micInput) {
    this.mic = micInput; // Asigna la entrada del micrófono
    // Inicializa el detector de tono de ml5.js
    this.pitch = ml5.pitchDetection(this.modelUrl, this.audioContext, this.mic.stream, () => this.getPitch());
  }
  getPitch() {
    // Obtiene el tono (frecuencia) actual del audio
    this.pitch.getPitch((err, freq) => {
      if (freq) {
        this.prevFrequency = this.frequency; // Guarda la frecuencia actual como anterior
        this.frequency = freq; // Actualiza la frecuencia detectada
        this.frequencyDiff = this.frequency - this.prevFrequency; // Calcula la diferencia
      }
      this.getPitch(); // Llama recursivamente para continuar detectando el tono
    });
  }
  getFrequency() {
    return this.frequency; // Devuelve la frecuencia detectada
  }
}

// ==========================================
// API DE AUDIO
// ==========================================
let gate, ampFilter, freqFilter, eventDetector, freqDetector; // Declaración de las instancias de las clases

function initAudioLogic() {
  gate = new GateCalibration(); // Inicializa la clase de calibración de la puerta de ruido
  ampFilter = new SignalFilter(AMP_MIN, AMP_MAX); // Inicializa el filtro para la amplitud
  freqFilter = new SignalFilter(FREC_MIN, FREC_MAX); // Inicializa el filtro para la frecuencia
  eventDetector = new SoundEventDetector(); // Inicializa el detector de eventos de sonido
  freqDetector = new FrequencyDetector(); // Inicializa el detector de frecuencia
  // Espera a un gesto del usuario para iniciar el audio (requisito del navegador)
  userStartAudio().then(() => {
    freqDetector.setup(gate.mic); // Configura el detector de frecuencia con la entrada del micrófono
    console.log('AudioLogic: mic y detector de frecuencia inicializados'); // Mensaje de consola
  });
}

function updateAudioLogic() {
  const rawAmp = gate.update(); // Obtiene la amplitud "cruda" del micrófono
  const fAmp = ampFilter.update(rawAmp); // Filtra y suaviza la amplitud
  const rawFreq = freqDetector.getFrequency(); // Obtiene la frecuencia "cruda" detectada
  const fFreq = freqFilter.update(rawFreq); // Filtra y suaviza la frecuencia
  // Actualiza el detector de eventos basándose en si la amplitud filtrada es mayor que cero
  const events = eventDetector.update(fAmp > 0);
  return { amp: fAmp, freq: fFreq, rawFreq, events }; // Devuelve los valores procesados y eventos
}