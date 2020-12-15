import getPalette, {DEFAULT_PALETTE, NULL_COLOR, OTHERS_COLOR} from './palette';
import {assert, getAttrValue} from './utils';

export default function colorCategories({
  attr,
  domain,
  colors = DEFAULT_PALETTE,
  nullColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}) {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers or strings');

  const colorsByCategory = {};
  const palette = typeof colors === 'string' ? getPalette(colors, domain.length) : colors;

  for (const [i, c] of domain.entries()) {
    colorsByCategory[c] = palette[i];
  }

  return d => {
    const value = getAttrValue(attr, d);
    return Number.isFinite(value) || typeof value === 'string'
      ? colorsByCategory[value] || othersColor
      : nullColor;
  };
}
