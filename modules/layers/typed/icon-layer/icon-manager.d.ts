import {Device} from '@luma.gl/api';
import {Texture2D} from '@luma.gl/webgl-legacy';
import type {AccessorFunction} from '@deck.gl/core';
declare type IconDef = {
  /** Width of the icon */
  width: number;
  /** Height of the icon */
  height: number;
  /** Horizontal position of icon anchor. Default: half width. */
  anchorX?: number;
  /** Vertical position of icon anchor. Default: half height. */
  anchorY?: number;
  /**
   * Whether the icon is treated as a transparency mask.
   * If `true`, color defined by `getColor` is applied.
   * If `false`, pixel color from the icon image is applied.
   * @default false
   */
  mask?: boolean;
};
export declare type UnpackedIcon = {
  /** Url to fetch the icon */
  url: string;
  /** Unique identifier of the icon. Icons of the same id are only fetched once. Fallback to `url` if not specified. */
  id?: string;
} & IconDef;
declare type PrepackedIcon = {
  /** Left position of the icon on the atlas */
  x: number;
  /** Top position of the icon on the atlas */
  y: number;
} & IconDef;
export declare type IconMapping = Record<string, PrepackedIcon>;
export declare type LoadIconErrorContext = {
  error: Error;
  /** The URL that was trying to fetch */
  url: string;
  /** The original data object that requested this icon */
  source: any;
  /** The index of the original data object that requested this icon */
  sourceIndex: number;
  /** The load options used for the fetch */
  loadOptions: any;
};
/**
 * Generate coordinate mapping to retrieve icon left-top position from an icon atlas
 */
export declare function buildMapping({
  icons,
  buffer,
  mapping,
  xOffset,
  yOffset,
  rowHeight,
  canvasWidth
}: {
  /** list of icon definitions */
  icons: UnpackedIcon[];
  /** add bleeding buffer to the right and bottom side of the image */
  buffer: number;
  /** right position of last icon in old mapping */
  xOffset: number;
  /** top position in last icon in old mapping */
  yOffset: number;
  /** height of the last icon's row */
  rowHeight: number;
  /** max width of canvas */
  canvasWidth: number;
  mapping: IconMapping;
}): {
  mapping: IconMapping;
  rowHeight: number;
  xOffset: number;
  yOffset: number;
  canvasWidth: number;
  canvasHeight: number;
};
export declare function getDiffIcons(
  data: any,
  getIcon: AccessorFunction<any, UnpackedIcon> | null,
  cachedIcons: Record<
    string,
    PrepackedIcon & {
      url?: string;
    }
  >
): Record<
  string,
  UnpackedIcon & {
    source: any;
    sourceIndex: number;
  }
> | null;
export default class IconManager {
  device: Device;
  private onUpdate;
  private onError;
  private _loadOptions;
  private _texture;
  private _externalTexture;
  private _mapping;
  private _textureParameters;
  /** count of pending requests to fetch icons */
  private _pendingCount;
  private _autoPacking;
  private _xOffset;
  private _yOffset;
  private _rowHeight;
  private _buffer;
  private _canvasWidth;
  private _canvasHeight;
  private _canvas;
  constructor(
    device: Device,
    {
      onUpdate,
      onError
    }: {
      /** Callback when the texture updates */
      onUpdate: () => void;
      /** Callback when an error is encountered */
      onError: (context: LoadIconErrorContext) => void;
    }
  );
  finalize(): void;
  getTexture(): Texture2D | null;
  getIconMapping(icon: string | UnpackedIcon): PrepackedIcon | null;
  setProps({
    loadOptions,
    autoPacking,
    iconAtlas,
    iconMapping,
    textureParameters
  }: {
    loadOptions?: any;
    autoPacking?: boolean;
    iconAtlas?: Texture2D | null;
    iconMapping?: IconMapping | null;
    textureParameters?: Record<number, number> | null;
  }): void;
  get isLoaded(): boolean;
  packIcons(data: any, getIcon: AccessorFunction<any, UnpackedIcon>): void;
  private _loadIcons;
}
export {};
// # sourceMappingURL=icon-manager.d.ts.map
