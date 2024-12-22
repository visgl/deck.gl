import {CharacterMapping} from './utils';
export declare type FontSettings = {
  /** CSS font family
   * @default 'Monaco, monospace'
   */
  fontFamily?: string;
  /** CSS font weight
   * @default 'normal'
   */
  fontWeight?: string | number;
  /** Specifies a list of characters to include in the font.
   * @default (ASCII characters 32-128)
   */
  characterSet?: Set<string> | string[] | string;
  /** Font size in pixels. This option is only applied for generating `fontAtlas`, it does not impact the size of displayed text labels. Larger `fontSize` will give you a sharper look when rendering text labels with very large font sizes. But larger `fontSize` requires more time and space to generate the `fontAtlas`.
   * @default 64
   */
  fontSize?: number;
  /** Whitespace buffer around each side of the character. In general, bigger `fontSize` requires bigger `buffer`. Increase `buffer` will add more space between each character when layout `characterSet` in `fontAtlas`. This option could be tuned to provide sufficient space for drawing each character and avoiding overlapping of neighboring characters.
   * @default 4
   */
  buffer?: number;
  /** Flag to enable / disable `sdf`. [`sdf` (Signed Distance Fields)](http://cs.brown.edu/people/pfelzens/papers/dt-final.pdf) will provide a sharper look when rendering with very large or small font sizes. `TextLayer` integrates with [`TinySDF`](https://github.com/mapbox/tiny-sdf) which implements the `sdf` algorithm.
   * @default false
   */
  sdf?: boolean;
  /** How much of the radius (relative) is used for the inside part the glyph. Bigger `cutoff` makes character thinner. Smaller `cutoff` makes character look thicker. Only applies when `sdf: true`.
   * @default 0.25
   */
  cutoff?: number;
  /** How many pixels around the glyph shape to use for encoding distance. Bigger radius yields higher quality outcome. Only applies when `sdf: true`.
   * @default 12
   */
  radius?: number;
  /** How much smoothing to apply to the text edges. Only applies when `sdf: true`.
   * @default 0.1
   */
  smoothing?: number;
};
export declare const DEFAULT_FONT_SETTINGS: Required<FontSettings>;
declare type FontAtlas = {
  /** x position of last character in mapping */
  xOffset: number;
  /** y position of last character in mapping */
  yOffset: number;
  /** bounding box of each character in the texture */
  mapping: CharacterMapping;
  /** packed texture */
  data: HTMLCanvasElement;
  /** texture width */
  width: number;
  /** texture height */
  height: number;
};
/**
 * Sets the Font Atlas LRU Cache Limit
 * @param {number} limit LRU Cache limit
 */
export declare function setFontAtlasCacheLimit(limit: number): void;
export default class FontAtlasManager {
  /** Font settings */
  props: Required<FontSettings>;
  /** Cache key of the current font atlas */
  private _key?;
  /** The current font atlas */
  private _atlas?;
  get atlas(): Readonly<FontAtlas> | undefined;
  get mapping(): CharacterMapping | undefined;
  get scale(): number;
  setProps(props?: FontSettings): void;
  private _generateFontAtlas;
  private _getKey;
}
export {};
// # sourceMappingURL=font-atlas-manager.d.ts.map
