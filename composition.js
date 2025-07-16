// composition.js - Lógica de la composición y disposición de pinceladas

/**
 * @function generarComposicionInicial
 * @description Genera la composición inicial de la obra, rellenando la grilla
 * con pinceladas individuales y bloques, asignando colores
 * y decidiendo si una celda es "clara" u "oscura".
 */
function generarComposicionInicial() {
  // Inicializar matrices para llevar el control de celdas y colores
  let coloresAsignados = Array(gridRows).fill().map(() => Array(gridCols).fill(null)); // Matriz para almacenar el color de cada celda
  let celdaUsada = Array(gridRows).fill().map(() => Array(gridCols).fill(false));     // Matriz para marcar celdas usadas por bloques
  matrizClaros = Array(gridCols).fill().map(() => Array(gridRows).fill(false));       // Matriz para registrar si una celda es "clara"

  // Distribuir todos los colores de la paleta de forma equitativa en la grilla
  let paleta = paletas[paletaActual];                     // Obtiene la paleta de colores actual
  let todosColores = [...paleta.claros, ...paleta.oscuros]; // Combina colores claros y oscuros de la paleta
  let totalCeldas = gridCols * gridRows;                  // Calcula el número total de celdas
  let coloresParaGrilla = [];                             // Array para almacenar los colores a distribuir
  while (coloresParaGrilla.length < totalCeldas) {
    coloresParaGrilla = coloresParaGrilla.concat(todosColores); // Repite los colores si no hay suficientes
  }
  coloresParaGrilla = coloresParaGrilla.slice(0, totalCeldas); // Ajusta el tamaño al número de celdas
  // Mezclar el array para que los colores no queden agrupados
  for (let i = coloresParaGrilla.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [coloresParaGrilla[i], coloresParaGrilla[j]] = [coloresParaGrilla[j], coloresParaGrilla[i]]; // Intercambia elementos
  }

  // Asignar estos colores a la grilla
  let idxColor = 0; // Índice para recorrer el array de colores
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      coloresAsignados[row][col] = coloresParaGrilla[idxColor]; // Asigna el color a la celda
      // Determinar si es claro u oscuro según la paleta
      matrizClaros[col][row] = paleta.claros.includes(coloresParaGrilla[idxColor]); // Marca la celda como clara si su color está en la lista de claros
      idxColor++; // Avanza al siguiente color
    }
  }

  // Dibujar todas las celdas con la asignación equitativa
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      let cual = int(random(cantidad)); // Elige un índice de pincelada al azar
      let pincel = pinceladas[cual];    // Obtiene la imagen de la pincelada
      let colorHex = coloresAsignados[row][col]; // Obtiene el color asignado a la celda
      dibujarPinceladaRecorteImperfecto(layerGenerativa, col, row, pincel, colorHex); // Dibuja la pincelada en la capa generativa
    }
  }

  // PASO 1: Generar bloques de 3x3 (con una probabilidad conservadora)
  if (paletaActual === 0 || paletaActual === 3) { // Todas las paletas o Solo Obra3
    for (let row = 0; row <= gridRows - 3; row++) {
      for (let col = 0; col <= gridCols - 3; col++) {
        let areaLibre = true;
        for (let r = row; r < row + 3 && areaLibre; r++) {
          for (let c = col; c < col + 3 && areaLibre; c++) {
            if (celdaUsada[r][c]) {
              areaLibre = false;
            }
          }
        }
        // Probabilidad mayor en Obra3
        let prob3x3 = (paletaActual === 3) ? 0.18 : 0.06;
        if (areaLibre && random() < prob3x3) {
          let modoBloque = random() < 0.25 ? 'claro' : 'oscuro';
          let colorBloque = obtenerColor(modoBloque);
          for (let r = row; r < row + 3; r++) {
            for (let c = col; c < col + 3; c++) {
              celdaUsada[r][c] = true;
              coloresAsignados[r][c] = colorBloque;
              matrizClaros[c][r] = (modoBloque === 'claro');
            }
          }
          bloquesGenerados.push({ col: col, row: row, ancho: 3, alto: 3, modo: modoBloque });
          dibujarBloque(layerGenerativa, col, row, 3, 3, colorBloque, modoBloque);
          console.log(`Bloque 3x3 generado en (${col}, ${row}) - Modo: ${modoBloque}`);
        }
      }
    }
  }

  // PASO 2: Generar bloques de 2x2 en celdas no ocupadas (con una probabilidad mayor)
  // Solo en Todas las paletas, Obra3 y Obra4
  if (paletaActual === 0 || paletaActual === 3 || paletaActual === 4) {
    for (let row = 0; row <= gridRows - 2; row += 2) {
      for (let col = 0; col <= gridCols - 2; col += 2) {
        let bloqueLibre = true;
        for (let r = row; r < row + 2 && bloqueLibre; r++) {
          for (let c = col; c < col + 2 && bloqueLibre; c++) {
            if (celdaUsada[r][c]) {
              bloqueLibre = false;
            }
          }
        }
        // Probabilidad mayor en Obra3 y Obra4
        let prob2x2 = (paletaActual === 3 || paletaActual === 4) ? 0.18 : 0.06;
        if (bloqueLibre && random() < prob2x2) {
          let modoBloque = random() < 0.2 ? 'claro' : 'oscuro';
          let colorBloque = obtenerColor(modoBloque);
          for (let r = row; r < row + 2; r++) {
            for (let c = col; c < col + 2; c++) {
              coloresAsignados[r][c] = colorBloque;
              celdaUsada[r][c] = true;
              matrizClaros[c][r] = (modoBloque === 'claro');
            }
          }
          bloquesGenerados.push({ col: col, row: row, ancho: 2, alto: 2, modo: modoBloque });
          dibujarBloque(layerGenerativa, col, row, 2, 2, colorBloque, modoBloque);
          console.log(`Bloque 2x2 generado en (${col}, ${row}) - Modo: ${modoBloque}`);
        }
      }
    }
  }

  // PASO 3: Rellenar las celdas restantes individualmente
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (!celdaUsada[row][col]) { // Si la celda no ha sido ocupada por un bloque
        let modo;
        // Decidir si la celda individual será clara u oscura (probabilidad)
        let probClaro;
        if (paletaActual === 2 || paletaActual === 3) { // Obra2 y Obra3
          probClaro = 0.7;
        } else if (paletaActual === 1 || paletaActual === 4) { // Obra1 y Obra4
          probClaro = 0.3;
        } else { // Todas las paletas
          probClaro = 0.5;
        }
        if (random() < probClaro) {
          modo = 'claro';
        } else {
          modo = 'oscuro';
        }

        // Asignar el color y registrar si es clara u oscura
        if (modo === 'claro') {
          // Intentar repetir el color si hay vecinos claros para crear agrupaciones
          let vecinoColor = null; // Variable para almacenar el color de un vecino
          let vecinos = [];      // Array para almacenar colores de vecinos
          if (row > 0 && coloresAsignados[row - 1][col]) vecinos.push(coloresAsignados[row - 1][col]); // Agrega el color del vecino de arriba
          if (col > 0 && coloresAsignados[row][col - 1]) vecinos.push(coloresAsignados[row][col - 1]); // Agrega el color del vecino de la izquierda
          vecinos = vecinos.filter(c => c != null); // Filtra los valores nulos
          if (vecinos.length > 0 && random() < 0.8) { // 80% de probabilidad de usar un color vecino
            vecinoColor = random(vecinos); // Elige un color de entre los vecinos
          }
          coloresAsignados[row][col] = vecinoColor || obtenerColor('claro'); // Usa el color del vecino o un nuevo color claro
          matrizClaros[col][row] = true; // Marca la celda como clara
        } else {
          coloresAsignados[row][col] = obtenerColor('oscuro'); // Asigna un color oscuro
          matrizClaros[col][row] = false; // Marca la celda como oscura
        }
      }

      // Elegir una pincelada al azar y dibujarla con el color asignado
      let cual = int(random(cantidad)); // Elige un índice de pincelada al azar
      let pincel = pinceladas[cual];    // Obtiene la imagen de la pincelada
      let colorHex = coloresAsignados[row][col]; // Obtiene el color asignado a la celda

      // Dibujar la pincelada con recorte imperfecto en la capa generativa
      dibujarPinceladaRecorteImperfecto(layerGenerativa, col, row, pincel, colorHex);
    }
  }
}

/**
 * @function pintarCeldaAleatoria
 * @description Pinta una celda aleatoria de la grilla con una nueva pincelada
 * y un color determinado por el `modoColor` actual.
 * Esta función es útil para interacción del usuario (e.g., al presionar una tecla).
 */
function pintarCeldaAleatoria() {
  let col = floor(random(gridCols)); // Elige una columna aleatoria
  let row = floor(random(gridRows)); // Elige una fila aleatoria

  // Elegir una pincelada al azar
  let cual = int(random(cantidad)); // Elige un índice de pincelada al azar
  let pincel = pinceladas[cual];    // Obtiene la imagen de la pincelada

  // Obtener color según el modo actual (claro/oscuro)
  let colorHex = obtenerColor(modoColor); // Obtiene un color basado en el modo de color actual

  // Dibujar pincelada con recorte imperfecto en la capa generativa
  dibujarPinceladaRecorteImperfecto(layerGenerativa, col, row, pincel, colorHex);
}