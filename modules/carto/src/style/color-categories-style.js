import {getPalette, NULL_COLOR} from './utils';

const OTHERS_COLOR = [119, 119, 119];

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
      return d === (undefined || null) ? nullColor : colorsByCategory[d] || othersColor;
    };
  }

  return NULL_COLOR;
}
