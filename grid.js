// grid.js - Funciones relacionadas con la grilla orgánica

/**
 * @function generarGrillaOrganica
 * @description Genera una grilla de puntos con deformaciones orgánicas y fluidas utilizando Perlin noise
 * y funciones trigonométricas. Los puntos se extienden ligeramente más allá de los límites
 * del área de trabajo para un efecto más natural.
 */
function generarGrillaOrganica() {
  let cols = gridCols + 1;
  let rows = gridRows + 1;

  // Desplazar levemente la grilla
  noiseOffset = random(1000);

  // Inicializar array de puntos y semillas para el ruido
  puntosGrilla = [];
  distortionSeeds = [];
  for (let i = 0; i < cols; i++) {
    puntosGrilla[i] = [];
    distortionSeeds[i] = [];
    for (let j = 0; j < rows; j++) {
      distortionSeeds[i][j] = random(1000); // Semilla única para cada punto para variabilidad
    }
  }

  // Define la máxima cantidad de desplazamiento para los puntos de la grilla
  let desplazamientoMax = min(cellWidth, cellHeight) * 0.35; // Aumentamos a 35%

  // Primera pasada: generar puntos con múltiples capas de ruido para mayor organicidad
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let baseX = (i / gridCols) * areaSize;
      let baseY = (j / gridRows) * areaSize;

      // Múltiples capas de ruido para mayor organicidad y detalle
      let noiseScale1 = 0.015; // Deformación grande (movimiento lento)
      let noiseScale2 = 0.08;  // Deformación media (movimiento intermedio)
      let noiseScale3 = 0.25;  // Deformación fina (detalles rápidos)

      // Usa una semilla única para cada punto para asegurar variaciones diferentes
      let seed = distortionSeeds[i][j];

      // Capa 1: Deformación principal
      let noise1X = noise(i * noiseScale1 + seed, j * noiseScale1 + seed, noiseOffset * 0.3) - 0.5;
      let noise1Y = noise(i * noiseScale1 + seed + 500, j * noiseScale1 + seed + 500, noiseOffset * 0.3) - 0.5;

      // Capa 2: Deformación secundaria
      let noise2X = noise(i * noiseScale2 + seed, j * noiseScale2 + seed, noiseOffset * 0.8) - 0.5;
      let noise2Y = noise(i * noiseScale2 + seed + 300, j * noiseScale2 + seed + 300, noiseOffset * 0.8) - 0.5;

      // Capa 3: Deformación de detalle
      let noise3X = noise(i * noiseScale3 + seed, j * noiseScale3 + seed, noiseOffset * 1.5) - 0.5;
      let noise3Y = noise(i * noiseScale3 + seed + 200, j * noiseScale3 + seed + 200, noiseOffset * 1.5) - 0.5;

      // Deformación adicional basada en funciones trigonométricas para ondas
      let waveX = sin(i * 0.4 + j * 0.2 + noiseOffset * 0.02) * 15; // Amplitud aumentada
      let waveY = cos(j * 0.3 + i * 0.15 + noiseOffset * 0.025) * 30; // Amplitud aumentada

      // Combinar todas las deformaciones ponderadas
      let totalNoiseX = noise1X * 0.6 + noise2X * 0.3 + noise3X * 0.1;
      let totalNoiseY = noise1Y * 0.6 + noise2Y * 0.3 + noise3Y * 0.1;

      let finalX = baseX + totalNoiseX * desplazamientoMax + waveX;
      let finalY = baseY + totalNoiseY * desplazamientoMax + waveY;

      // Permitir extensión completa más allá de los límites del área de trabajo
      let margenExtension = 150; // Margen de extensión generoso

      finalX = constrain(finalX, -margenExtension, areaSize + margenExtension);
      finalY = constrain(finalY, -margenExtension, areaSize + margenExtension);

      // Para los bordes, permitir aún más extensión para un efecto de desbordamiento
      if (i == 0) { // Borde izquierdo
        finalX = constrain(finalX, -margenExtension * 1.5, areaSize * 0.3);
      } else if (i == cols - 1) { // Borde derecho
        finalX = constrain(finalX, areaSize * 0.7, areaSize + margenExtension * 1.5);
      }

      if (j == 0) { // Borde superior
        finalY = constrain(finalY, -margenExtension * 1.5, areaSize * 0.3);
      } else if (j == rows - 1) { // Borde inferior
        finalY = constrain(finalY, areaSize * 0.7, areaSize + margenExtension * 1.5);
      }

      puntosGrilla[i][j] = createVector(finalX, finalY);
    }
  }

  // Segunda pasada: suavizar solo ligeramente los puntos interiores para mantener organicidad
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      let promX = 0, promY = 0, count = 0;

      // Promediar solo con vecinos inmediatos (arriba, abajo, izquierda, derecha)
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (abs(di) + abs(dj) <= 1) { // Solo vecinos directos (no diagonales)
            promX += puntosGrilla[i + di][j + dj].x;
            promY += puntosGrilla[i + di][j + dj].y;
            count++;
          }
        }
      }

      // Suavización muy sutil para mantener el carácter orgánico de la deformación
      let factor = 0.10; // Suavizado aún más mínimo
      puntosGrilla[i][j].x = lerp(puntosGrilla[i][j].x, promX / count, factor);
      puntosGrilla[i][j].y = lerp(puntosGrilla[i][j].y, promY / count, factor);
    }
  }

  // Incrementar offset para animar sutilmente la deformación en el tiempo
  noiseOffset += 0.01;
}

/**
 * @function dibujarGrillaOrganica
 * @description Dibuja la grilla deformada en el buffer especificado, utilizando líneas fluidas
 * y con ligeras variaciones para un aspecto más orgánico.
 * @param {p5.Graphics} buffer - El buffer donde se dibujará la grilla.
 */
function dibujarGrillaOrganica(buffer) {
  let cols = gridCols + 1;
  let rows = gridRows + 1;

  buffer.stroke(0, 0, 1, 0.1); // Líneas más sutiles
  buffer.noFill();

  // Dibujar líneas horizontales con curvas muy orgánicas
  for (let j = 0; j < rows; j++) {
    buffer.strokeWeight(random(0.1, 0.1));
    buffer.beginShape();
    buffer.noFill();

    if (j > 0) {
      buffer.curveVertex(puntosGrilla[0][j].x - 30, puntosGrilla[0][j].y);
    }

    for (let i = 0; i < cols; i++) {
      // Verificar si esta línea debe ser ocultada por un bloque
      let debeOcultar = false;
      for (let bloque of bloquesGenerados) {
        // Si la línea horizontal pasa por dentro de un bloque, ocultarla
        if (j > bloque.row && j < bloque.row + bloque.alto &&
          i >= bloque.col && i <= bloque.col + bloque.ancho) {
          debeOcultar = true;
          break;
        }
      }

      if (!debeOcultar) {
        buffer.curveVertex(puntosGrilla[i][j].x, puntosGrilla[i][j].y);
      } else {
        // Si debe ocultar, levantar el "lápiz" y luego volver a bajarlo
        buffer.endShape();   // Terminar el shape actual
        buffer.beginShape(); // Iniciar un nuevo shape
        buffer.curveVertex(puntosGrilla[i][j].x, puntosGrilla[i][j].y); // Mover el vértice al punto actual
      }
    }

    if (j < rows - 1) {
      buffer.curveVertex(puntosGrilla[cols - 1][j].x + 30, puntosGrilla[cols - 1][j].y);
    }
    buffer.endShape();
  }

  // Dibujar líneas verticales
  for (let i = 0; i < cols; i++) {
    buffer.strokeWeight(random(0.1, 0.1));
    buffer.beginShape();
    buffer.noFill();

    if (i > 0) {
      buffer.curveVertex(puntosGrilla[i][0].x + random(-10, 10), puntosGrilla[i][0].y - random(-20, 20)); // Extensión superior
    }

    for (let j = 0; j < rows; j++) {
      // Añadir pequeñas variaciones aleatorias a cada punto
      let varX = random(-3, 3);
      let varY = random(-3, 3);

      // Verificar si esta línea debe ser ocultada por un bloque
      let debeOcultar = false;
      for (let bloque of bloquesGenerados) {
        // Si la línea vertical pasa por dentro de un bloque, ocultarla
        if (i > bloque.col && i < bloque.col + bloque.ancho &&
          j >= bloque.row && j <= bloque.row + bloque.alto) {
          debeOcultar = true;
          break;
        }
      }

      if (!debeOcultar) {
        buffer.curveVertex(puntosGrilla[i][j].x + varX, puntosGrilla[i][j].y + varY);
      } else {
        buffer.endShape();
        buffer.beginShape();
        buffer.curveVertex(puntosGrilla[i][j].x + varX, puntosGrilla[i][j].y + varY);
      }
    }

    if (i < cols - 1) {
      buffer.curveVertex(puntosGrilla[i][rows - 1].x + random(-10, 10), puntosGrilla[i][rows - 1].y + random(-20, 20)); // Extensión inferior
    }
    buffer.endShape();
  }
}

/**
 * @function vecinosClaros
 * @description Verifica si una celda específica en la grilla tiene vecinos marcados como "claros"
 * en la matriz `matrizClaros`. Considera vecinos directos y diagonales.
 * @param {number} col - La columna de la celda.
 * @param {number} row - La fila de la celda.
 * @returns {boolean} `true` si hay al menos un vecino claro, `false` en caso contrario.
 */
function vecinosClaros(col, row) {
  let dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  for (let i = 0; i < dirs.length; i++) {
    let nCol = col + dirs[i][0];
    let nRow = row + dirs[i][1];
    if (nCol >= 0 && nCol < gridCols && nRow >= 0 && nRow < gridRows) {
      if (matrizClaros[nCol][nRow]) {
        return true;
      }
    }
  }
  return false;
}