import {gePalette, NULL_COLOR} from './utils';

const OTHERS_COLOR = [0, 0, 0];
const TOP = 10;

export default function ColorsCategories({
  categories,
  colors,
  nulltColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}) {
  let categoryList;
  const colorsByCategory = {};

  if (Array.isArray(categories)) {
    categoryList = categories;
  } else {
    const {stats, top = TOP} = categories;
    categoryList = stats.categories.map(c => c.category).slice(0, top);
  }

  const palette = typeof colors === 'string' ? gePalette(colors, categoryList.length) : colors;

  for (const [i, c] of categoryList.entries()) {
    colorsByCategory[c] = palette[i];
  }

  return d => {
    return d === (undefined || null) ? nulltColor : colorsByCategory[d] || othersColor;
  };
}
