
// Parse array or string color
export function parseColor(color) {
  if (Array.isArray(color)) {
    if (color.length === 3) {
      return [color[0], color[1], color[2], 255];
    }
    return color;
  }
  if (typeof color === 'string') {
    return parseHexColor(color);
  }
  return null;
}

// Parse a hex color
export function parseHexColor(color) {
  const array = new Uint8ClampedArray(4);
  if (color.length === 7) {
    const value = parseInt(color.substring(1), 16);
    array[0] = value / 65536;
    array[1] = (value / 256) % 256;
    array[2] = value % 256;
    array[3] = 255;
  } else if (color.length === 9) {
    const value = parseInt(color.substring(1), 16);
    array[0] = value / 16777216;
    array[1] = (value / 65536) % 256;
    array[2] = (value / 256) % 256;
    array[3] = value % 256;
  }
  return array;
}

export function setOpacity(color, opacity = 127) {
  return [color[0], color[1], color[2], opacity];
}

export function applyOpacity(color, opacity = 127) {
  return [color[0], color[1], color[2], opacity];
}

