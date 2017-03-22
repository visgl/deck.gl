import {rgb} from 'd3-color';

export const normalizeParam = p => {
  if (p.type === 'function') {
    let displayValue = p.value.toString();
    displayValue = displayValue.replace(/^function (\w+)?\((\w*?)\)/, '$2 =>');
    displayValue = displayValue.replace(/^function (\w+)?(\(.*?\))/, '$2 =>');
    displayValue = displayValue.replace(/\{\s*return\s*(.*?);?\s*\}$/, '$1');
    return {...p, displayValue};
  }
  if (p.type === 'json') {
    return {...p, displayValue: JSON.stringify(p.value)};
  }
  if (p.type === 'color') {
    return {...p, displayValue: colorToHex(p.value)};
  }
  return {...p, displayValue: String(p.value)};
};

export const readableInteger = x => {
  if (!x) {
    return 0;
  }
  if (x < 1000) {
    return x.toString();
  }
  x /= 1000;
  if (x < 1000) {
    return `${x.toFixed(1)}K`;
  }
  x /= 1000;
  return `${x.toFixed(1)}M`;
};

export function colorToHex(color) {
  return colorToRGBArray(color).reduce(
    (acc, v) => `${acc}${v < 16 ? '0' : ''}${v.toString(16)}`,
    '#'
  );
}

export function colorToRGBArray(color) {
  if (Array.isArray(color)) {
    return color.slice(0, 3);
  }
  const c = rgb(color);
  return [c.r, c.g, c.b];
}
