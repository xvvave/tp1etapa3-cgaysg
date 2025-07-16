// sketch.js - Archivo principal de p5.js

// Las funciones preload, setup y draw son las funciones base de p5.js
// y se mantienen aquí. Las funciones auxiliares son llamadas desde este archivo.

/**
 * @function setups
 * @description Función de configuración inicial de p5.js. Se ejecuta una vez al inicio.
 * Configura el canvas, modos de color, capas gráficas y genera la composición inicial.
 */
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight); // Crea un canvas que ocupa toda la ventana del navegador
  cnv.parent('canvas-container'); // Mueve el canvas al contenedor correcto
  background(255); // Fondo inicial blanco
  imageMode(CENTER); // Las imágenes se dibujarán con su centro en el punto especificado
  colorMode(HSB, 360, 100, 100, 100); // Usa el modo de color HSB para manipulación de color
  pixelDensity(1); // Controla la densidad de píxeles para consistencia entre pantallas

  centroX = width / 2; // Calcula el centro X del canvas
  centroY = height / 2; // Calcula el centro Y del canvas

  // Calcula el tamaño base de cada celda de la grilla (antes de la deformación)
  cellWidth = areaSize / gridCols;
  cellHeight = areaSize / gridRows;

  // CREAR LAS TRES CAPAS GRÁFICAS (buffers) del tamaño del área de trabajo
  layerGenerativa = createGraphics(areaSize, areaSize); // Capa para pinceladas y grilla
  layerLuminosidad = createGraphics(areaSize, areaSize); // Capa para efectos de luz
  layerTextura = createGraphics(areaSize, areaSize); // Capa para textura de lienzo

  // CONFIGURAR CAPA GENERATIVA
  layerGenerativa.colorMode(HSB, 360, 100, 100, 100); // Mismo modo de color HSB para el canvas principal
  layerGenerativa.imageMode(CENTER); // Las imágenes en esta capa también se centrarán
  layerGenerativa.background(60,50,35); // Fondo oscuro para la capa generativa

  // CONFIGURAR CAPA DE TEXTURA
  layerTextura.clear(); // Asegura que la capa de textura sea transparente inicialmente
  layerTextura.imageMode(CENTER);
  layerTextura.image(imgTextura, areaSize/2, areaSize/2, areaSize, areaSize); // Dibuja la textura base

  // CONFIGURAR CAPA DE LUMINOSIDAD
  layerLuminosidad.clear(); // Asegura que la capa de luminosidad sea transparente inicialmente
  layerLuminosidad.imageMode(CENTER);
  if (imgLuminosidad[luminosidadActual]) { // Dibuja la imagen de luminosidad actual si existe
    layerLuminosidad.image(imgLuminosidad[luminosidadActual], areaSize/2, areaSize/2, areaSize, areaSize);
  }

  // GENERAR LA GRILLA ORGÁNICA inicial
  generarGrillaOrganica();

  // Dibujar la grilla orgánica en la capa generativa
  dibujarGrillaOrganica(layerGenerativa);

  // Preprocesar las imágenes de pinceladas: invertirlas y ajustar su transparencia
  for (let i = 0; i < cantidad; i++) {
    let img = pinceladas[i];
    img.filter(INVERT); // Invierte los colores (de negro a blanco)
    img.loadPixels(); // Carga los píxeles de la imagen para manipulación
    for (let j = 0; j < img.pixels.length; j += 4) {
      let r = img.pixels[j];
      let g = img.pixels[j + 1];
      let b = img.pixels[j + 2];
      let brillo = (r + g + b) / 3; // Calcula el brillo promedio
      // Mapea el brillo a un valor alfa: más brillo (originalmente negro), menos alfa (más transparente)
      let alpha = map(brillo, 100, 255, 0, 255); 
      img.pixels[j + 3] = constrain(alpha, 0, 255); // Asigna el alfa, restringiéndolo entre 0 y 255
    }
    img.updatePixels(); // Actualiza la imagen con los nuevos píxeles
  }

  // --- Simular un "R" inicial para que el clima visual sea igual al de apretar R ---
  luminosidadActual = (luminosidadActual + 1) % imgLuminosidad.length;
  layerGenerativa.background(60,50,35);
  dibujarGrillaOrganica(layerGenerativa);
  generarGrillaOrganica();
  layerGenerativa.background(60,50,35);
  dibujarGrillaOrganica(layerGenerativa);
  layerLuminosidad.clear();
  if (imgLuminosidad[luminosidadActual]) {
    layerLuminosidad.image(imgLuminosidad[luminosidadActual], areaSize/2, areaSize/2, areaSize, areaSize);
  }
  generarComposicionInicial();
  // --- Fin simulación "R" inicial ---

  // Si hay una paleta pendiente seleccionada antes de que todo esté listo, aplicarla ahora
  if (typeof paletaPendiente !== 'undefined' && paletaPendiente !== null) {
    paletaActual = paletaPendiente;
    paletaPendiente = null;
    // --- BLOQUE DE REINICIO COMO EN seleccionarPaletaActual ---
    if (imgLuminosidad && Array.isArray(imgLuminosidad)) {
      luminosidadActual = (luminosidadActual + 1) % imgLuminosidad.length;
    } else {
      console.error("Error: imgLuminosidad no está definido o no es un arreglo.");
    }
    layerGenerativa.background(60,50,35);
    dibujarGrillaOrganica(layerGenerativa);
    generarGrillaOrganica();
    layerGenerativa.background(60,50,35);
    dibujarGrillaOrganica(layerGenerativa);
    layerLuminosidad.clear();
    if (imgLuminosidad[luminosidadActual]) {
      layerLuminosidad.image(imgLuminosidad[luminosidadActual], areaSize/2, areaSize/2, areaSize, areaSize);
    }
    generarComposicionInicial();
    console.log("Composición reiniciada con paleta seleccionada al cargar.");
  } else {
    generarComposicionInicial();
  }
  // Llamar a onboarding tras inicializar todo
  if (typeof iniciarOnboarding === 'function') iniciarOnboarding();
}

/**
 * @function draw
 * @description Función de dibujo principal de p5.js. Se ejecuta continuamente.
 * Dibuja las diferentes capas y la interfaz de usuario.
 */
function draw() {
  background(255); // Limpia el fondo del canvas principal (blanco)

  // Detectar audio (graves/agudos) usando p5.FFT
  if (typeof detectAudio === 'function') {
    detectAudio();
  }

  // Si una tecla está siendo presionada, se pinta una celda aleatoria
  if (teclaPresionada) {
    pintarCeldaAleatoria();
  }

  // Dibuja la capa generativa (pinceladas y grilla) en el centro del canvas principal
  imageMode(CENTER);
  image(layerGenerativa, centroX, centroY);

  // Aplica la capa de textura con un modo de mezcla y tinte para un efecto de "lienzo"
  push();
  blendMode(OVERLAY); // Modo de mezcla OVERLAY para superponer texturas
  tint(55, 35); // Tinte para controlar la intensidad de la textura (brillo 50%, saturación 30%)
  image(layerTextura, centroX, centroY);
  pop();

  // Aplica la capa de luminosidad con un modo de mezcla y tinte
  // Nunca aplicar en Obra 3
  if (
    paletaActual !== 3 && imgLuminosidad[luminosidadActual] &&
    (
      paletaActual !== 2 || (luminosidadActual === 1 || luminosidadActual === 5)
    )
  ) {
    push();
    blendMode(OVERLAY); // Otro modo OVERLAY para efectos de luz
    tint(150, 60); // Tinte para controlar la intensidad de la luminosidad
    image(imgLuminosidad[luminosidadActual], centroX, centroY);
    pop();
  }

  // Dibuja una sombra central sutil sobre el área de trabajo
  push();
  noStroke();
  fill(0, 20); // Color negro con transparencia para la sombra
  rectMode(CENTER);
  rect(centroX, centroY, areaSize, areaSize); // Dibuja un rectángulo que actúa como sombra
  pop();

  // Dibuja un marco alrededor del área de trabajo
  push();
  noFill(); // Sin relleno para el marco
  stroke(220, 45, 13); // Color azul oscuro en HSB para el marco
  strokeWeight(12); // Grosor del marco
  rectMode(CENTER);
  rect(centroX, centroY, areaSize, areaSize); // Dibuja el rectángulo del marco
  pop();

  // Dibuja las instrucciones de uso en la interfaz
  dibujarInstrucciones();
}

// Las funciones keyPressed y keyReleased se encuentran ahora en input.js
// Las funciones auxiliares como obtenerColor, generarGrillaOrganica,
// dibujarGrillaOrganica, dibujarPinceladaRecorteImperfecto, dibujarBloqueGrande,
// vecinosClaros, generarComposicionInicial, pintarCeldaAleatoria, y dibujarInstrucciones
// son definidas en sus respectivos archivos y son accesibles globalmente por p5.js.