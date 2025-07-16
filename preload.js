// preload.js - Carga de assets (imágenes)

/**
 * @function preload
 * @description Carga todas las imágenes necesarias antes de que la configuración inicial de p5.js (`setup`) se ejecute.
 * Esto incluye las imágenes de pinceladas, la textura base y las imágenes de luminosidad.
 */
function preload() {
  // Carga las imágenes de pinceladas
  for (let i = 0; i < cantidad; i++) {
    let nombre = 'data/cuadradito_' + nf(i, 4) + '_Capa-' + (i + 3) + '.png';
    pinceladas[i] = loadImage(nombre);
  }
  
  // Carga la imagen de textura base (lienzo)
  imgTextura = loadImage('data/lienzo.png');
  
  // Carga todas las imágenes de luminosidad
  for (let i = 1; i <= 8; i++) {
    imgLuminosidad[i-1] = loadImage('data/luminosidad' + i + '.png');
  }
}