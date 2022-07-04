import {scaleThreshold} from 'd3-scale';
import {AccessorFunction} from '@deck.gl/core';
import {Feature} from 'geojson';
import getPalette, {Color, DEFAULT_PALETTE, NULL_COLOR} from './palette';
import {assert, AttributeSelector, getAttrValue} from './utils';

/**
 * Helper function for quickly creating a color bins style based on `d3` `scaleThreshold`.
 *
 * Data values of each attribute are rounded down to the nearest value in the domain and are then
 * styled with the corresponding color.
 *
 * @return accessor that maps objects to `Color` values
 */
export default function colorBins<DataT = Feature>({
  attr,
  domain,
  colors = DEFAULT_PALETTE,
  nullColor = NULL_COLOR
}: {
  /** Attribute or column to symbolize by. */
  attr: AttributeSelector<DataT, number>;

  /** Category list. Must be a valid list of categories. */
  domain: number[];

  /**
   * Color assigned to each domain value.
   *
   * Either Array of colors in RGBA or valid named CARTOColors palette.
   * @default `PurpOr`
   */
  colors?: string | Color[];

  /** Color for null values. @default: [204, 204, 204] */
  nullColor?: Color;
}): AccessorFunction<DataT, Color> {
  assert(Array.isArray(domain), 'Expected "domain" to be an array of numbers');

  const palette = typeof colors === 'string' ? getPalette(colors, domain.length + 1) : colors;

  const color = scaleThreshold<number, Color>().domain(domain).range(palette);

  return d => {
    const value = getAttrValue(attr, d);
    return typeof value === 'number' && Number.isFinite(value) ? color(value) : nullColor;
  };
}
