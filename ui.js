// ui.js - Funciones para elementos de interfaz de usuario

/**
 * @function dibujarInstrucciones
 * @description Dibuja un cuadro de texto con las instrucciones de uso y
 * el estado actual del modo de color en la esquina superior izquierda del canvas.
 */
function dibujarInstrucciones() {
  colorMode(RGB, 255); // Cambiar a modo RGB para el texto (más fácil de manejar para UI)

  // Fondo negro semitransparente para el cuadro de instrucciones
  push();
  fill(0, 0, 0, 150); // Negro con 150 de transparencia
  noStroke();
  rect(20, 20, 355, 165, 10); // Cuadro de fondo con bordes redondeados
  pop();

  // Texto blanco con las instrucciones
  push();
  fill(255); // Color blanco para el texto
  textAlign(LEFT); // Alineación del texto a la izquierda
  textSize(14); // Tamaño de fuente
  textFont('Arial'); // Fuente

  textFont('Inter');
  text("CONTROLES:", 35, 45);
  text("← Un tap flecha izq: Color oscuro con % grande", 35, 65);
  text("→ Un tap flecha der: Color claro con % grande", 35, 85);
  text("Mantener presionado: Generar cuadrados pequeños", 35, 105);
  text("R: Reiniciar nuevo patrón y luminosidad", 35, 125);

  // Indicador visual del modo actual (claro/oscuro)
  fill(modoColor === 'oscuro' ? color(255, 155, 0) : color(255, 255, 50)); // Color según el modo
  text("Modo actual: " + (modoColor === 'oscuro' ? 'OSCURO' : 'CLARO'), 35, 170);
  
  pop();

  colorMode(HSB, 360, 100, 100, 100); // Volver al modo HSB después de dibujar la UI
}