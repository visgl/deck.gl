import getPalette, {NULL_COLOR, OTHERS_COLOR} from './palette';
import {assert, getAttrValue} from './utils';

export default function colorCategories({
  attr,
  categories,
  colors,
  nullColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}) {
  assert(Array.isArray(categories), 'Expected "domain" to be an array of numbers or strings');
  assert(
    Array.isArray(colors),
    'Expected "colors" to be an array of numbers or a CARTOColors string'
  );

  const colorsByCategory = {};
  const palette = typeof colors === 'string' ? getPalette(colors, categories.length) : colors;

  for (const [i, c] of categories.entries()) {
    colorsByCategory[c] = palette[i];
  }

  return d => {
    const value = getAttrValue(attr, d);
    return Number.isFinite(value) || typeof value === 'string'
      ? colorsByCategory[value] || othersColor
      : nullColor;
  };
}
