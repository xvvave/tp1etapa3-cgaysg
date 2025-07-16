// input.js - Manejo de eventos de teclado

// Definición de constantes para las teclas de flecha
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;

/**
 * @function keyPressed
 * @description Se ejecuta una vez cuando se presiona cualquier tecla.
 * Controla el cambio de modo de color y el reinicio de la composición.
 */
function keyPressed(event) {
  if (event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW) {
    event.preventDefault(); // Evita el comportamiento predeterminado del navegador para las flechas
  }
  teclaPresionada = true;
  if (event.keyCode === LEFT_ARROW) {
    modoColor = 'oscuro';
    console.log("Modo oscuro activado");

    // GENERAR BLOQUE DINÁMICO
    intentarGenerarBloqueDinamico();


  } else if (event.keyCode === RIGHT_ARROW) {
    modoColor = 'claro';
    console.log("Modo claro activado");

    // GENERAR BLOQUE DINÁMICO
   intentarGenerarBloqueDinamico();


   } else if (event.key === 'r' || event.key === 'R') {
    // Cambiar a la siguiente imagen de luminosidad
    if (imgLuminosidad && Array.isArray(imgLuminosidad)) {
        luminosidadActual = (luminosidadActual + 1) % imgLuminosidad.length;
    } else {
        console.error("Error: imgLuminosidad no está definido o no es un arreglo.");
    }
    console.log("Cambiando a luminosidad" + (luminosidadActual + 1) + ".png");
    
    // Reiniciar la composición
    layerGenerativa.background(60,50,35);
    dibujarGrillaOrganica(layerGenerativa);
    
    // REGENERAR GRILLA ORGÁNICA
    generarGrillaOrganica();    

    layerGenerativa.background(60,50,35); // Fondo oscuro para la capa
    dibujarGrillaOrganica(layerGenerativa); // Redibuja la grilla deformada

    // Actualizar la capa de luminosidad con la nueva imagen seleccionada
    layerLuminosidad.clear(); // Limpia la capa de luminosidad
    if (imgLuminosidad[luminosidadActual]) { // Asegura que la imagen exista
      layerLuminosidad.image(imgLuminosidad[luminosidadActual], areaSize/2, areaSize/2, areaSize, areaSize);
    }

    // Regenerar toda la composición de pinceladas
    generarComposicionInicial();
    console.log("Composición reiniciada con nueva luminosidad.");
  }
}

/**
 * @function keyReleased
 * @description Se ejecuta una vez cuando se suelta cualquier tecla.
 * Restablece la bandera de tecla presionada.
 * @param {KeyboardEvent} event - El evento de teclado que contiene información sobre la tecla liberada.
 * @returns {void} - No devuelve ningún valor.
 */
function keyReleased(event) {
  teclaPresionada = false; // Establece la bandera de tecla presionada a false
  console.log(`Tecla liberada: ${event.key}`); // Opcional: Log para depuración
}