import {AccessorFunction} from '@deck.gl/core';
import {Feature} from 'geojson';
import {Color} from './palette';
import {AttributeSelector} from './utils';
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
  colors,
  nullColor,
  othersColor
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
}): AccessorFunction<DataT, Color>;
// # sourceMappingURL=color-categories-style.d.ts.map
