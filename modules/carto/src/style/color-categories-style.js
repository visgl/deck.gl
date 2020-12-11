import getPalette, {NULL_COLOR, OTHERS_COLOR} from './palette';
import {getAttrValue} from './utils';

export default function colorCategories({
  categories,
  colors,
  nullColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}) {
  if (Array.isArray(categories)) {
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

  return () => NULL_COLOR;
}
