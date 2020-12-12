import {scaleLinear} from 'd3-scale';
import getPalette, {NULL_COLOR} from './palette';
import {assert, getAttrValue} from './utils';

export default function colorContinuous({attr, range, colors, nullColor = NULL_COLOR}) {
  assert(Array.isArray(range), 'Expected "range" to be an array of numbers');
  assert(
    Array.isArray(colors),
    'Expected "colors" to be an array of numbers or a CARTOColors string'
  );

  const palette = typeof colors === 'string' ? getPalette(colors) : colors;
  const color = scaleLinear()
    .domain(range)
    .range(palette);

  return d => {
    const value = getAttrValue(attr, d);
    return Number.isFinite(value) ? color(value) : nullColor;
  };
}
