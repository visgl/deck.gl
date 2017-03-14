import {rgb} from 'd3-color';

export const normalizeParam = p => {
  if (p.type === 'function') {
    let displayValue = p.value.toString();
    displayValue = displayValue.replace(/^function \w+\((\w*?)\)/, '$1 =>');
    displayValue = displayValue.replace(/^function \w+(\(.*?\))/, '$1 =>');
    displayValue = displayValue.replace(/\{\s*return (.*?);?\s*\}$/, '$1');
    return {...p, displayValue};
  }
  if (p.type === 'color') {
    const color = rgb(p.value);
    const value = [color.r, color.g, color.b];
    const displayValue = value.reduce(
      (acc, v) => `${acc}${v < 16 ? '0' : ''}${v.toString(16)}`,
      '#'
    );
    return {...p, value, displayValue};
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
