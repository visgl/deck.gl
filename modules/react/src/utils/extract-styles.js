const CANVAS_ONLY_STYLES = {
  mixBlendMode: null
};

export default function extractStyles({width, height, style}) {
  // This styling is enforced for correct positioning with children
  const containerStyle = {
    position: 'absolute',
    zIndex: 0,
    left: 0,
    top: 0,
    width,
    height
  };

  // Fill the container
  const canvasStyle = {
    left: 0,
    top: 0
  };

  if (style) {
    for (const key in style) {
      if (key in CANVAS_ONLY_STYLES) {
        // apply style to the canvas, but not deck's children, e.g. mix-blend-mode
        canvasStyle[key] = style[key];
      } else {
        // apply style to the container, e.g. position/flow settings
        containerStyle[key] = style[key];
      }
    }
  }

  return {containerStyle, canvasStyle};
}
