import {AccessorFunction} from '@deck.gl/core';
import {Feature} from 'geojson';
import getPalette, {Color, DEFAULT_PALETTE, NULL_COLOR, OTHERS_COLOR} from './palette';
import {assert, AttributeSelector, getAttrValue} from './utils';

/**
 * Helper function for quickly creating a color category style.
 *
 * Data values of each attribute listed in the domain are mapped one to one
 * with corresponding colors in the range.
 *
 * @return accessor that maps objects to `Color` values
 */
export default function colorCategories<DataT = Feature>({
  attr,
  domain,
  colors = DEFAULT_PALETTE,
  nullColor = NULL_COLOR,
  othersColor = OTHERS_COLOR
}: {
  /** Attribute or column to symbolize by */
  attr: string | AttributeSelector<DataT, number | string>;

  /** Category list. Must be a valid list of categories. */
  domain: number[] | string[];

  /**
   * Color assigned to each domain value.
   *
   * Either Array of colors in RGBA or valid named CARTOColors palette.
   * @default `PurpOr`
   */
  colors: string | Color[];

  /** Color for null values. @default: [204, 204, 204] */
  nullColor?: Color;

  /** Fallback color for a category not correctly assigned. @default: [119, 119, 119] */
  othersColor?: Color;
}): AccessorFunction<DataT, Color> {
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
