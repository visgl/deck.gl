/* global document */

/* Create a clean canvas and its container testing */
export default function setupCanvasTest() {
  const canvas = document.createElement('canvas');
  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'canvas-parent';
  canvasContainer.appendChild(canvas);
  return {
    canvasContainer,
    canvas
  };
}
