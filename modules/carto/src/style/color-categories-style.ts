import getPalette, {Color, DEFAULT_PALETTE, NULL_COLOR, OTHERS_COLOR} from './palette';
import {assert, AttributeSelector, getAttrValue} from './utils';

export default function colorCategories({
  attr,
  domain,
  colors = DEFAULT_PALETTE,
  nullColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}: {
  attr: AttributeSelector;
  domain: number[];
  colors: string | Color[];
  nullColor?: Color;
  othersColor?: Color;
}): AttributeSelector {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers or strings');

  const colorsByCategory = {};
  const palette = typeof colors === 'string' ? getPalette(colors, domain.length) : colors;

  for (const [i, c] of domain.entries()) {
    colorsByCategory[c] = palette[i];
  }

  return d => {
    const value = getAttrValue(attr, d);
    return (typeof value === 'number' && Number.isFinite(value)) || typeof value === 'string'
      ? colorsByCategory[value] || othersColor
      : nullColor;
  };
}
