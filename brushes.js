// brushes.js - Funciones para dibujar pinceladas individuales y bloques

/**
 * @function dibujarPinceladaRecorteImperfecto
 * @description Dibuja una pincelada dentro de una celda de la grilla irregular,
 * aplicando un recorte que coincide con la forma de la celda y
 * extendiendo la pincelada en los bordes para un efecto de desbordamiento.
 * También aplica múltiples capas de la pincelada con ligeras variaciones.
 * @param {p5.Graphics} buffer - El buffer donde se dibujará la pincelada.
 * @param {number} col - La columna de la celda de la grilla.
 * @param {number} row - La fila de la celda de la grilla.
 * @param {p5.Image} pincel - La imagen de la pincelada a dibujar.
 * @param {string} colorHex - El color hexadecimal para teñir la pincelada.
 */
function dibujarPinceladaRecorteImperfecto(buffer, col, row, pincel, colorHex) {
  // Detectar si la celda actual está en un borde de la grilla
  let enBordeIzquierdo = (col === 0);
  let enBordeDerecho = (col === gridCols - 1);
  let enBordeSuperior = (row === 0);
  let enBordeInferior = (row === gridRows - 1);
  let enBorde = enBordeIzquierdo || enBordeDerecho || enBordeSuperior || enBordeInferior;

  // Obtener los 4 puntos exactos de la celda deformada de la grilla
  let p1 = puntosGrilla[col][row];
  let p2 = puntosGrilla[col + 1][row];
  let p3 = puntosGrilla[col + 1][row + 1];
  let p4 = puntosGrilla[col][row + 1];

  // EXTENDER LOS PUNTOS DE LA GRILLA HACIA AFUERA SI ESTÁ EN BORDE
  if (enBorde) {
    let extension = 1;

    // Extender hacia la izquierda si está en el borde izquierdo
    if (enBordeIzquierdo) {
      p1.x = min(p1.x, -extension);
      p4.x = min(p4.x, -extension);
    }

    // Extender hacia la derecha si está en el borde derecho
    if (enBordeDerecho) {
      p2.x = max(p2.x, areaSize + extension);
      p3.x = max(p3.x, areaSize + extension);
    }

    // Extender hacia arriba si está en el borde superior
    if (enBordeSuperior) {
      p1.y = min(p1.y, -extension);
      p2.y = min(p2.y, -extension);
    }

    // Extender hacia abajo si está en el borde inferior
    if (enBordeInferior) {
      p3.y = max(p3.y, areaSize + extension);
      p4.y = max(p4.y, areaSize + extension);
    }
  }

  // Calcular el centro de la celda deformada para posicionar la pincelada
  let centroX = (p1.x + p2.x + p3.x + p4.x) / 4;
  let centroY = (p1.y + p2.y + p3.y + p4.y) / 4;

  // Calcular escala basada en el tamaño promedio de la celda
  let anchoPromedio = (dist(p1.x, p1.y, p2.x, p2.y) + dist(p4.x, p4.y, p3.x, p3.y)) / 2;
  let altoPromedio = (dist(p1.x, p1.y, p4.x, p4.y) + dist(p2.x, p2.y, p3.x, p3.y)) / 2;

  // Multiplicador de escala extra para celdas en los bordes
  let multiplicadorEscala = enBorde ? random(1.3, 1.8) : random(1.1, 1.3);

  let escalaX = (anchoPromedio / pincel.width) * multiplicadorEscala;
  let escalaY = (altoPromedio / pincel.height) * multiplicadorEscala;
  let escala = max(escalaX, escalaY);

  buffer.push();

  // Borrar el área con el color de fondo antes de aplicar el clip
  buffer.fill(60, 50, 35);
  buffer.noStroke();
  buffer.beginShape();
  buffer.vertex(p1.x, p1.y);
  buffer.vertex(p2.x, p2.y);
  buffer.vertex(p3.x, p3.y);
  buffer.vertex(p4.x, p4.y);
  buffer.endShape(CLOSE);

  // Definir el área de recorte (clip) usando la forma de la celda irregular
  buffer.beginClip();
  buffer.noStroke();
  buffer.fill(255);
  buffer.beginShape();

  // Usar los puntos exactos de la grilla irregular (ahora extendidos) para el clip
  buffer.vertex(p1.x, p1.y);
  buffer.vertex(p2.x, p2.y);
  buffer.vertex(p3.x, p3.y);
  buffer.vertex(p4.x, p4.y);

  buffer.endShape(CLOSE);
  buffer.endClip();

  // Dibujar múltiples capas de la misma pincelada con ligeras variaciones
  let numCapas = int(random(1, 3));

  for (let capa = 0; capa < numCapas; capa++) {
    let c = color(colorHex);

    // Variar ligeramente el color en cada capa
    if (capa > 0) {
      let h = hue(c);
      let s = saturation(c);
      let b = brightness(c);

      h += random(-8, 8);
      s += random(-3, 3);
      b += random(-5, 5);

      c = color(h, s, b);
    }

    buffer.tint(c);
    buffer.push();

    // Añadir variaciones muy sutiles en posición y escala por capa
    let offsetX = random(-2, 2);
    let offsetY = random(-2, 2);
    let escalaVariacion = random(1.2, 1.2);

    buffer.translate(centroX + offsetX, centroY + offsetY);
    buffer.rotate(random(-0.05, 0.05));
    buffer.scale(escala * escalaVariacion);
    buffer.image(pincel, 0, 0);
    buffer.pop();
  }

  buffer.noTint();
  buffer.pop();
}

/**
 * @function dibujarBloqueGrande
 * @description Dibuja un bloque de pinceladas que ocupa múltiples celdas de la grilla.
 * Crea un área de recorte que abarca las celdas especificadas y dibuja
 * múltiples capas de una pincelada grande dentro de esa área.
 * @param {p5.Graphics} buffer - El buffer donde se dibujará el bloque.
 * @param {number} colInicio - La columna de inicio del bloque.
 * @param {number} rowInicio - La fila de inicio del bloque.
 * @param {number} ancho - La cantidad de columnas que abarca el bloque.
 * @param {number} alto - La cantidad de filas que abarca el bloque.
 * @param {p5.Image} pincel - La imagen de la pincelada a dibujar.
 * @param {string} colorHex - El color hexadecimal para teñir la pincelada.
 */
function dibujarBloqueGrande(buffer, colInicio, rowInicio, ancho, alto, pincel, colorHex) {
  // Obtener todos los puntos del perímetro del bloque grande
  let puntosBloque = [];

  // Recopilar puntos del lado superior
  for (let c = colInicio; c <= colInicio + ancho; c++) {
    puntosBloque.push(puntosGrilla[c][rowInicio]);
  }

  // Recopilar puntos del lado derecho (sin repetir esquina)
  for (let r = rowInicio + 1; r <= rowInicio + alto; r++) {
    puntosBloque.push(puntosGrilla[colInicio + ancho][r]);
  }

  // Recopilar puntos del lado inferior (de derecha a izquierda, sin repetir esquina)
  for (let c = colInicio + ancho - 1; c >= colInicio; c--) {
    puntosBloque.push(puntosGrilla[c][rowInicio + alto]);
  }

  // Recopilar puntos del lado izquierdo (de abajo hacia arriba, sin repetir esquinas)
  for (let r = rowInicio + alto - 1; r > rowInicio; r--) {
    puntosBloque.push(puntosGrilla[colInicio][r]);
  }

  // Calcular el centro del bloque grande para posicionar la pincelada
  let centroX = 0, centroY = 0;
  for (let punto of puntosBloque) {
    centroX += punto.x;
    centroY += punto.y;
  }
  centroX /= puntosBloque.length;
  centroY /= puntosBloque.length;

  // Calcular la escala apropiada para el bloque grande
  let anchoBloque = abs(puntosGrilla[colInicio + ancho][rowInicio].x - puntosGrilla[colInicio][rowInicio].x);
  let altoBloque = abs(puntosGrilla[colInicio][rowInicio + alto].y - puntosGrilla[colInicio][rowInicio].y);

  let escalaX = (anchoBloque / pincel.width) * random(1.0, 1.2);
  let escalaY = (altoBloque / pincel.height) * random(1.0, 1.2);
  let escala = max(escalaX, escalaY);

  buffer.push();

  // Borrar el área con el color de fondo antes de aplicar el clip
  buffer.fill(60, 50, 35);
  buffer.noStroke();
  buffer.beginShape();
  for (let punto of puntosBloque) {
    buffer.vertex(punto.x, punto.y);
  }
  buffer.endShape(CLOSE);

  // Definir el área de recorte (clip) utilizando la forma del bloque
  buffer.beginClip();
  buffer.noStroke();
  buffer.fill(255);
  buffer.beginShape();

  for (let punto of puntosBloque) {
    buffer.vertex(punto.x, punto.y);
  }

  buffer.endShape(CLOSE);
  buffer.endClip();

  // Dibujar múltiples capas del pincel grande para mayor riqueza visual
  let numCapas = int(random(2, 4));

  for (let capa = 0; capa < numCapas; capa++) {
    let c = color(colorHex);

    // Variar ligeramente el color en cada capa
    if (capa > 0) {
      let h = hue(c);
      let s = saturation(c);
      let b = brightness(c);

      h += random(-5, 5);
      s += random(-2, 2);
      b += random(-3, 3);

      c = color(h, s, b);
    }

    buffer.tint(c);
    buffer.push();

    // Aplicar variaciones en posición y escala a cada capa
    let offsetX = random(-5, 5);
    let offsetY = random(-5, 5);
    let escalaVariacion = random(1.2, 1.2);

    buffer.translate(centroX + offsetX, centroY + offsetY);
    buffer.rotate(random(-0.02, 0.02));
    buffer.scale(escala * escalaVariacion);
    buffer.image(pincel, 0, 0);
    buffer.pop();
  }

  buffer.noTint();
  buffer.pop();
}

// NUEVA FUNCIÓN: Intentar generar un bloque grande dinámicamente
function intentarGenerarBloqueDinamico() {
  // Probabilidades para generar bloques de diferentes tamaños
  let probabilidad3x3 = (paletaActual === 3) ? 0.25 : 0.10;
  let probabilidad2x2 = (paletaActual === 3 || paletaActual === 4) ? 0.25 : 0.30;

  // Intentar generar un bloque 3x3 SOLO en Todas las paletas o en Obra3
  if ((paletaActual === 0 || paletaActual === 2) && random(1) < probabilidad3x3) {
    let col = floor(random(gridCols - 2));
    let row = floor(random(gridRows - 2));
    let areaLibre = true;
    for (let r = row; r < row + 3 && areaLibre; r++) {
      for (let c = col; c < col + 3 && areaLibre; c++) {
        // Lógica para verificar celdaUsada iría aquí
      }
    }
    if (areaLibre) {
      let modoBloque = (random(1) < 0.5) ? 'claro' : 'oscuro';
      let colorBloque = obtenerColor(modoBloque);
      dibujarBloque(layerGenerativa, col, row, 3, 3, colorBloque, modoBloque);
      bloquesGenerados.push({
        col: col,
        row: row,
        ancho: 3,
        alto: 3,
        modo: modoBloque
      });
      console.log(`Bloque 3x3 generado en (${col},${row})`);
      return true;
    }
  }

  // Intentar generar un bloque 2x2 SOLO en Todas las paletas, Obra3 y Obra4
  if ((paletaActual === 0 || paletaActual === 2 || paletaActual === 3) && random(1) < probabilidad2x2) {
    let col = floor(random(gridCols - 1));
    let row = floor(random(gridRows - 1));
    let areaLibre = true;
    for (let r = row; r < row + 2 && areaLibre; r++) {
      for (let c = col; c < col + 2 && areaLibre; c++) {
        // Lógica para verificar celdaUsada iría aquí
      }
    }
    if (areaLibre) {
      let modoBloque = (random(1) < 0.5) ? 'claro' : 'oscuro';
      let colorBloque = obtenerColor(modoBloque);
      dibujarBloque(layerGenerativa, col, row, 2, 2, colorBloque, modoBloque);
      bloquesGenerados.push({
        col: col,
        row: row,
        ancho: 2,
        alto: 2,
        modo: modoBloque
      });
      console.log(`Bloque 2x2 generado en (${col},${row})`);
      return true;
    }
  }
  return false;
}

/**
 * @function dibujarBloque
 * @description Dibuja un bloque de pinceladas en la grilla.
 * @param {p5.Graphics} buffer - El buffer donde se dibujará.
 * @param {number} startCol - Columna inicial del bloque.
 * @param {number} startRow - Fila inicial del bloque.
 * @param {number} width - Ancho del bloque en celdas.
 * @param {number} height - Alto del bloque en celdas.
 * @param {string} colorHex - Color hexadecimal para las pinceladas del bloque.
 * @param {string} modoColorBloque - 'claro' u 'oscuro' para el bloque.
 */
function dibujarBloque(buffer, startCol, startRow, width, height, colorHex, modoColorBloque) {
  let puntosBloque = [];
  let escalaBasePincelada = 1.0;

  // Calcular los puntos de la forma irregular del bloque
  for (let c = startCol; c <= startCol + width; c++) {
    for (let r = startRow; r <= startRow + height; r++) {
      if (puntosGrilla[c] && puntosGrilla[c][r]) {
        puntosBloque.push(puntosGrilla[c][r]);
      }
    }
  }

  // Obtener los cuatro puntos de las esquinas del bloque
  let pSuperiorIzquierdo = puntosGrilla[startCol][startRow];
  let pSuperiorDerecho = puntosGrilla[startCol + width][startRow];
  let pInferiorDerecho = puntosGrilla[startCol + width][startRow + height];
  let pInferiorIzquierdo = puntosGrilla[startCol][startRow + height];

  // Redefinir puntosBloque con los vértices en el orden correcto
  puntosBloque = [
    pSuperiorIzquierdo,
    pSuperiorDerecho,
    pInferiorDerecho,
    pInferiorIzquierdo
  ];

  buffer.push();

  // Dibujar el fondo del bloque
  buffer.noStroke();
  buffer.fill(colorHex);
  buffer.beginShape();
  for (let punto of puntosBloque) {
    buffer.vertex(punto.x, punto.y);
  }
  buffer.endShape(CLOSE);

  // Definir el área de recorte (clip) utilizando la forma del bloque
  buffer.beginClip();
  buffer.noStroke();
  buffer.fill(255);
  buffer.beginShape();

  for (let punto of puntosBloque) {
    buffer.vertex(punto.x, punto.y);
  }

  buffer.endShape(CLOSE);
  buffer.endClip();

  // Dibujar múltiples capas del pincel grande
  let numCapas = int(random(2, 4));

  for (let capa = 0; capa < numCapas; capa++) {
    let c = color(colorHex);

    // Variar ligeramente el color en cada capa
    if (capa > 0) {
      let h = hue(c);
      let s = saturation(c);
      let b = brightness(c);

      h += random(-5, 5);
      s += random(-2, 2);
      b += random(-3, 3);

      c = color(h, s, b);
    }

    buffer.tint(c);
    buffer.push();

    // Variaciones en posición y escala
    let offsetX = random(-5, 5);
    let offsetY = random(-5, 5);
    let escalaVariacion = random(1.2, 1.2);

    // Centrar el pincel dentro del área del bloque y aplicar escala
    let centroXBloque = (pSuperiorIzquierdo.x + pInferiorDerecho.x) / 2;
    let centroYBloque = (pSuperiorIzquierdo.y + pInferiorDerecho.y) / 2;

    buffer.translate(centroXBloque + offsetX, centroYBloque + offsetY);
    buffer.rotate(random(-0.02, 0.02));
    buffer.scale(escalaBasePincelada * escalaVariacion * max(width, height));

    // Elegir una pincelada al azar
    let cual = int(random(cantidad));
    let pincel = pinceladas[cual];
    buffer.image(pincel, 0, 0);
    buffer.pop();
  }

  buffer.noTint();
  buffer.pop();
}