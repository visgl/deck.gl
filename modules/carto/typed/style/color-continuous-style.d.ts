import {AccessorFunction} from '@deck.gl/core';
import {Feature} from 'geojson';
import {Color} from './palette';
import {AttributeSelector} from './utils';
/**
 * Helper function for quickly creating a color continuous style.
 *
 * Data values of each field are interpolated linearly across values in the domain and
 * are then styled with a blend of the corresponding color in the range.
 *
 * @return accessor that maps objects to `Color` values
 */
export default function colorContinuous<DataT = Feature>({
  attr,
  domain,
  colors,
  nullColor
}: {
  /** Attribute or column to symbolize by. */
  attr: AttributeSelector<DataT, number>;
  /** Attribute domain to define the data range. */
  domain: number[];
  /**
   * Color assigned to each domain value.
   *
   * Either Array of colors in RGBA or valid named CARTOColors palette.
   * @default `PurpOr`
   */
  colors?: string | Color[];
  /** Color for null values. @default: [204, 204, 204]*/
  nullColor?: Color;
}): AccessorFunction<DataT, Color>;
// # sourceMappingURL=color-continuous-style.d.ts.map
