// globals.js - Variables globales y configuración inicial

let pinceladas = [];      // Array para guardar las imágenes de pinceladas
let cantidad = 33;        // Cantidad de pinceladas a cargar
let margen = 20;          // Margen 
let areaSize = 720;       // Tamaño del área de trabajo (canvas principal)
let centroX, centroY;     // Coordenadas del centro del canvas
let modoColor = 'oscuro'; // Modo de color actual: claro u oscuro
let gridCols = 16;        // Cantidad de columnas en la grilla
let gridRows = 12;        // Cantidad de filas en la grilla
let cellWidth, cellHeight; // Tamaño de cada celda

// Estructura para grilla irregular
let puntosGrilla = [];    // Array 2D con los puntos de la grilla deformada

// Sistema de 3 capas
let layerGenerativa;  // Capa principal con pinceladas y grilla
let layerLuminosidad; // Capa de efectos de luz
let layerTextura;     // Capa de textura
let imgLuminosidad = []; // Array de imágenes de luminosidad
let imgTextura;       // Imagen de textura base (lienzo)
let luminosidadActual = 0; // Índice de la imagen de luminosidad actual

let teclaPresionada = false; // Bandera para saber si se está presionando una tecla
let matrizClaros = [];       // Matriz para registrar si una celda es clara (true) u oscura (false)

// Variables para mayor organicidad
let noiseOffset = 0;      // Para animar la deformación orgánica
let distortionSeeds = []; // Semillas únicas para cada punto

let bloquesGenerados = []; // Array para trackear bloques generados y ocultar sus líneas

// Paletas de cada obra
let paletaObra1Claros = [
  "#D9BA5F", "#D9BF3D", "#D98014", "#BF712C", "#c6a74c", "#e9d76c", "#c98313", "#b16a26", "#a64c12"
];

let paletaObra1Oscuros = [
  "#402E1E", "#735A2D", "#6C733C", "#585936", "#26261C", "#592C1C", "#0D0000",
  "#5d4d2c", "#415034", "#0a0905", "#463923", "#363f29", "#372d1b",
  "#292e1e", "#140b08", "#17170f", "#32332c", "#242116", "#2c2113", "#43443c", "#1b2417", "#191504"
];

let paletaObra2Claros = [
  "#F2CB07",
  "#F2E750",
  "#F2DCB3",
  "#f3e395",
  "#f9f0c2"
];

let paletaObra2Oscuros = [
  "#025E73",
  "#0D0000",
  "#0b4b63",
  "#0c0f08",
  "#0e2e36",
  "#13481d",
  "#214001",
  "#260101",
  "#330c06",
  "#38270e",
  "#383632",
  "#400101",
  "#43370f",
  "#4a4a22",
  "#4f1e06",
  "#593B02",
  "#5f2f0b",
  "#62645b",
  "#6c6438",
  "#6d9695",
  "#6e855b",
  "#732C02",
  "#744622",
  "#948037",
  "#987560",
  "#9b4a38",
  "#9b7111",
  "#a91d18",
  "#da6b61",
  "#D93B3B",
  "#D93232"
];


let paletaObra3Claros = [
  "#cdccd5", // gris lavanda claro
  "#eae695", // amarillo pálido
  "#efb69d", // durazno claro
  "#a7dda5", // verde pastel
  "#d0bb9b", // beige claro
  "#ec968d", // rosa suave
  "#e7cabe", // nude
  "#edcfa3", // durazno dorado claro
];

let paletaObra3Oscuros = [
  "#c04a34", // rojo ladrillo oscuro
  "#53577a", // azul grisáceo oscuro
  "#965656", // marrón rojizo
  "#262828"  // gris profundo casi negro
];

let paletaObra4Claros = [
  "#BF9B30",  // dorado claro
  "#BF9924",  // dorado medio claro
  "#BF9E39",   // dorado cálido
  "#D91828", // rojo saturado
];

let paletaObra4Oscuros = [
  "#401A1D", "#232226", "#592C30", "#3A3B40",
  "#733B2F", "#131226", "#594A2D"
];

// Paletas generales
let paletas = [
  {
    nombre: "Todas",
    claros: [
     
      ...paletaObra2Claros,
      ...paletaObra3Claros,
     
    ],
    oscuros: [
      ...paletaObra1Oscuros,   
         ...paletaObra4Oscuros
    ]
  },
  {
    nombre: "Obra 1",
    claros: paletaObra1Claros,
    oscuros: paletaObra1Oscuros
  },
  {
    nombre: "Obra 2",
    claros: paletaObra2Claros,
    oscuros: paletaObra2Oscuros
  },
  {
    nombre: "Obra 3",
    claros: paletaObra3Claros,
    oscuros: paletaObra3Oscuros
  },
  {
    nombre: "Obra 4",
    claros: paletaObra4Claros,
    oscuros: paletaObra4Oscuros
  }
];

let paletaActual = 0; // Índice de la paleta actual
let paletaPendiente = null; // Si se selecciona antes de que todo esté listo
let paletaMostrada = 0; // Índice de la paleta actualmente mostrada en el onboarding

function detectarSonido() {
  if (amplitud > UMBRAL) {
    paletaActual = int(random(paletas.length));
  }
}

function obtenerColor(modo = null) {
  let paleta = paletas[paletaActual];
  if (paletaActual === 0) { // Si está seleccionada "Todas las paletas"
    const colores = [...paleta.claros, ...paleta.oscuros];
    return random(colores);
  } else if (modo === 'oscuro') {
    return random(paleta.oscuros);
  } else if (modo === 'claro') {
    return random(paleta.claros);
  } else {
    return random() < 0.5 ? random(paleta.oscuros) : random(paleta.claros);
  }
}

let onboardingActivo = true;
let indicePaleta = 0;
let intervaloPaleta = null;

function mostrarPaletaPreview(idx) {
  paletaMostrada = idx; // Guardar el índice mostrado
  const paleta = paletas[idx];
  const preview = document.getElementById('paleta-preview');
  preview.innerHTML = '';
  // Mostrar el nombre de la paleta
  let nombreDiv = document.createElement('div');
  nombreDiv.textContent = paleta.nombre;
  nombreDiv.style.color = 'white';
  nombreDiv.style.fontSize = '1.3em';
  nombreDiv.style.marginBottom = '10px';
  nombreDiv.style.textAlign = 'center';
  preview.appendChild(nombreDiv);

  let coloresPreview = [];
  
  // Función auxiliar para ordenar colores por luminosidad (gradiente)
  function ordenarPorLuminosidad(colores) {
    return colores.sort((a, b) => {
      // Convertir hex a RGB y calcular luminosidad
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgbA = hexToRgb(a);
      const rgbB = hexToRgb(b);
      
      if (!rgbA || !rgbB) return 0;
      
      const luminosidadA = (0.299 * rgbA.r + 0.587 * rgbA.g + 0.114 * rgbA.b);
      const luminosidadB = (0.299 * rgbB.r + 0.587 * rgbB.g + 0.114 * rgbB.b);
      
      return luminosidadB - luminosidadA; // De más claro a más oscuro
    });
  }
  
  if (idx === 0) { // Todas las paletas
    // Tomar 1 claro y 1 oscuro de cada obra (Obra 1, 2, 3, 4)
    let coloresSeleccionados = [];
    
    // Para cada obra (1, 2, 3, 4), seleccionar 1 claro y 1 oscuro
    for (let i = 1; i < paletas.length; i++) {
      const obra = paletas[i];
      
      // Seleccionar el color claro más representativo (el más claro)
      let clarosOrdenados = ordenarPorLuminosidad([...obra.claros]);
      if (clarosOrdenados.length > 0) {
        coloresSeleccionados.push(clarosOrdenados[0]); // El más claro
      }
      
      // Seleccionar el color oscuro más representativo (el más oscuro)
      let oscurosOrdenados = ordenarPorLuminosidad([...obra.oscuros]);
      if (oscurosOrdenados.length > 0) {
        coloresSeleccionados.push(oscurosOrdenados[oscurosOrdenados.length - 1]); // El más oscuro
      }
    }
    
    coloresPreview = coloresSeleccionados;
    
  } else { // Obras individuales (1, 2, 3, 4)
    // Tomar 4 claros y 4 oscuros de la paleta actual
    let claros = paleta.claros.slice(0, 4);
    let oscuros = paleta.oscuros.slice(0, 4);
    
    // Ordenar por luminosidad para crear gradiente
    claros = ordenarPorLuminosidad(claros);
    oscuros = ordenarPorLuminosidad(oscuros);
    
    coloresPreview = claros.concat(oscuros);
  }
  
  coloresPreview = coloresPreview.slice(0, 8);
  coloresPreview.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-preview';
    div.style.background = color;
    preview.appendChild(div);
  });
}

function cicloPaletas() {
  mostrarPaletaPreview(indicePaleta);
  indicePaleta = (indicePaleta + 1) % paletas.length;
}

function iniciarOnboarding() {
  onboardingActivo = true;
  indicePaleta = 0;
  if (intervaloPaleta) clearInterval(intervaloPaleta); // Limpiar cualquier ciclo anterior
  
  // Mostrar overlay de "Cargando..." por 2 segundos
  const loadingOverlay = document.getElementById('loading-overlay');
  const onboardingDiv = document.getElementById('onboarding');
  
  loadingOverlay.style.display = 'flex';
  onboardingDiv.style.display = 'none';
  document.getElementById('canvas-container').style.display = 'none';
  
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
    onboardingDiv.style.display = 'flex';
    mostrarPaletaPreview(indicePaleta); // Mostrar la primera paleta al iniciar
    // Iniciar el ciclo de paletas inmediatamente
    intervaloPaleta = setInterval(cicloPaletas, 1000);
    // Hacer el primer cambio después de 500ms para que no se quede estático
    setTimeout(() => {
      cicloPaletas();
    }, 100);
  }, 500);
  
  if (typeof resetAmplitudeDetection === 'function') resetAmplitudeDetection();
}

function seleccionarPaletaActual() {
  clearInterval(intervaloPaleta);
  intervaloPaleta = null; // Evitar que se reinicie accidentalmente
  paletaActual = paletaMostrada; // Seleccionar la paleta que se muestra
  if (paletaActual < 0) paletaActual = 0;
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('canvas-container').style.display = 'block';
  onboardingActivo = false;
  // Si las capas o imágenes no están listas, guardar la selección pendiente
  if (!layerGenerativa || !layerLuminosidad || !imgLuminosidad || imgLuminosidad.length === 0) {
    paletaPendiente = paletaActual;
    console.warn('Paleta seleccionada antes de que todo esté listo. Se aplicará al finalizar la carga.');
    return;
  }
  paletaPendiente = null;
  // --- BLOQUE DE REINICIO COMO EN TECLA 'R' ---
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
  console.log("Composición reiniciada con nueva paleta y luminosidad.");
}

// Eliminar: window.onload = iniciarOnboarding;

// Integración con sonido
function onSonidoAlto() {
  if (onboardingActivo) {
    seleccionarPaletaActual();
  }
}

function detectarSonido() {
  if (amplitud > UMBRAL) {
    onSonidoAlto();
  }
}

// Permitir seleccionar paleta con barra espaciadora o Enter
window.addEventListener('keydown', function(e) {
  if (onboardingActivo && (e.code === 'Space' || e.code === 'Enter')) {
    seleccionarPaletaActual();
  }
});