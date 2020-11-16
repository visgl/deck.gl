const DEFAULT_COLOR = [0, 0, 0];
const TOP = 10;

export default function ColorsCategories({categories, colors, defaultColor}) {
  let categoryList;
  const colorsByCategory = {};

  if (Array.isArray(categories)) {
    categoryList = categories;
  } else {
    const {stats, top = TOP} = categories;
    categoryList = stats.categories.map(c => c.category).slice(0, top);
  }

  for (const [i, c] of categoryList.entries()) {
    colorsByCategory[c] = colors[i];
  }

  return d => {
    return colorsByCategory[d] || defaultColor || DEFAULT_COLOR;
  };
}
