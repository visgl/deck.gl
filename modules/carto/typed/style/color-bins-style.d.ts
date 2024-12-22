import {AccessorFunction} from '@deck.gl/core';
import {Feature} from 'geojson';
import {Color} from './palette';
import {AttributeSelector} from './utils';
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
  colors,
  nullColor
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
}): AccessorFunction<DataT, Color>;
// # sourceMappingURL=color-bins-style.d.ts.map
