// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, createIterable, log} from '@deck.gl/core';
import MultiIconLayer from './multi-icon-layer/multi-icon-layer';
import FontAtlasManager, {
  DEFAULT_FONT_SETTINGS,
  setFontAtlasCacheLimit
} from './font-atlas-manager';
import {transformParagraph, getTextFromBuffer} from './utils';

import TextBackgroundLayer from './text-background-layer/text-background-layer';

import type {FontSettings} from './font-atlas-manager';
import type {
  LayerProps,
  LayerDataSource,
  Accessor,
  AccessorFunction,
  AccessorContext,
  Unit,
  Position,
  Color,
  UpdateParameters,
  GetPickingInfoParams,
  PickingInfo,
  DefaultProps
} from '@deck.gl/core';

const TEXT_ANCHOR = {
  start: 1,
  middle: 0,
  end: -1
} as const;

const ALIGNMENT_BASELINE = {
  top: 1,
  center: 0,
  bottom: -1
} as const;

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const DEFAULT_LINE_HEIGHT = 1.0;

type _TextLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** If `true`, the text always faces camera. Otherwise the text faces up (z).
   * @default true
   */
  billboard?: boolean;
  /**
   * Text size multiplier.
   * @default 1
   */
  sizeScale?: number;
  /**
   * The units of the size, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'pixels'
   */
  sizeUnits?: Unit;
  /**
   * The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.
   * @default 0
   */
  sizeMinPixels?: number;
  /**
   * The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  sizeMaxPixels?: number;

  /** Whether to render background for the text blocks.
   * @default false
   */
  background?: boolean;
  /** Background color accessor.
   * @default [255, 255, 255, 255]
   */
  getBackgroundColor?: Accessor<DataT, Color>;
  /** Border color accessor.
   * @default [0, 0, 0, 255]
   */
  getBorderColor?: Accessor<DataT, Color>;
  /** Border width accessor.
   * @default 0
   */
  getBorderWidth?: Accessor<DataT, number>;
  /**
   * The padding of the background..
   * If an array of 2 is supplied, it is interpreted as `[padding_x, padding_y]` in pixels.
   * If an array of 4 is supplied, it is interpreted as `[padding_left, padding_top, padding_right, padding_bottom]` in pixels.
   * @default [0, 0, 0, 0]
   */
  backgroundPadding?: [number, number] | [number, number, number, number];
  /**
   * Specifies a list of characters to include in the font. If set to 'auto', will be automatically generated from the data set.
   * @default (ASCII characters 32-128)
   */
  characterSet?: FontSettings['characterSet'] | 'auto';
  /** CSS font family
   * @default 'Monaco, monospace'
   */
  fontFamily?: FontSettings['fontFamily'];
  /** CSS font weight
   * @default 'normal'
   */
  fontWeight?: FontSettings['fontWeight'];
  /** A unitless number that will be multiplied with the current text size to set the line height.
   * @default 'normal'
   */
  lineHeight?: number;
  /**
   * Width of outline around the text, relative to the text size. Only effective if `fontSettings.sdf` is `true`.
   * @default 0
   */
  outlineWidth?: number;
  /**
   * Color of outline around the text, in `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.
   * @default [0, 0, 0, 255]
   */
  outlineColor?: Color;
  /**
   * Advance options for fine tuning the appearance and performance of the generated shared `fontAtlas`.
   */
  fontSettings?: FontSettings;
  /**
   * Available options are `break-all` and `break-word`. A valid `maxWidth` has to be provided to use `wordBreak`.
   * @default 'break-word'
   */
  wordBreak?: 'break-word' | 'break-all';
  /**
   * A unitless number that will be multiplied with the current text size to set the width limit of a string.
   * If specified, when the text is longer than the width limit, it will be wrapped into multiple lines using
   * the strategy of `wordBreak`.
   * @default -1
   */
  maxWidth?: number;
  /**
   * Label text accessor
   */
  getText?: AccessorFunction<DataT, string>;
  /**
   * Anchor position accessor
   */
  getPosition?: Accessor<DataT, Position>;
  /**
   * Label color accessor
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Label size accessor
   * @default 32
   */
  getSize?: Accessor<DataT, number>;
  /**
   * Label rotation accessor, in degrees
   * @default 0
   */
  getAngle?: Accessor<DataT, number>;
  /**
   * Horizontal alignment accessor
   * @default 'middle'
   */
  getTextAnchor?: Accessor<DataT, 'start' | 'middle' | 'end'>;
  /**
   * Vertical alignment accessor
   * @default 'center'
   */
  getAlignmentBaseline?: Accessor<DataT, 'top' | 'center' | 'bottom'>;
  /**
   * Label offset from the anchor position, [x, y] in pixels
   * @default [0, 0]
   */
  getPixelOffset?: Accessor<DataT, [number, number]>;
  /**
   * @deprecated Use `background` and `getBackgroundColor` instead
   */
  backgroundColor?: Color;
};

export type TextLayerProps<DataT = unknown> = _TextLayerProps<DataT> & LayerProps;

const defaultProps: DefaultProps<TextLayerProps> = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: 'pixels',
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,

  background: false,
  getBackgroundColor: {type: 'accessor', value: [255, 255, 255, 255]},
  getBorderColor: {type: 'accessor', value: DEFAULT_COLOR},
  getBorderWidth: {type: 'accessor', value: 0},
  backgroundPadding: {type: 'array', value: [0, 0, 0, 0]},

  characterSet: {type: 'object', value: DEFAULT_FONT_SETTINGS.characterSet},
  fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
  fontWeight: DEFAULT_FONT_SETTINGS.fontWeight,
  lineHeight: DEFAULT_LINE_HEIGHT,
  outlineWidth: {type: 'number', value: 0, min: 0},
  outlineColor: {type: 'color', value: DEFAULT_COLOR},
  fontSettings: {type: 'object', value: {}, compare: 1},

  // auto wrapping options
  wordBreak: 'break-word',
  maxWidth: {type: 'number', value: -1},

  getText: {type: 'accessor', value: (x: any) => x.text},
  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getSize: {type: 'accessor', value: 32},
  getAngle: {type: 'accessor', value: 0},
  getTextAnchor: {type: 'accessor', value: 'middle'},
  getAlignmentBaseline: {type: 'accessor', value: 'center'},
  getPixelOffset: {type: 'accessor', value: [0, 0]},

  // deprecated
  backgroundColor: {deprecatedFor: ['background', 'getBackgroundColor']}
};

/** Render text labels at given coordinates. */
export default class TextLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TextLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'TextLayer';

  state!: {
    styleVersion: number;
    fontAtlasManager: FontAtlasManager;
    characterSet?: Set<string>;
    startIndices?: number[];
    numInstances?: number;
    getText?: AccessorFunction<DataT, string>;
  };

  initializeState() {
    this.state = {
      styleVersion: 0,
      fontAtlasManager: new FontAtlasManager()
    };

    // Breaking change in v8.9
    if (this.props.maxWidth > 0) {
      log.warn('v8.9 breaking change: TextLayer maxWidth is now relative to text size')();
    }
  }

  // eslint-disable-next-line complexity
  updateState(params: UpdateParameters<this>) {
    const {props, oldProps, changeFlags} = params;
    const textChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText));

    if (textChanged) {
      this._updateText();
    }

    const fontChanged = this._updateFontAtlas();

    const styleChanged =
      fontChanged ||
      props.lineHeight !== oldProps.lineHeight ||
      props.wordBreak !== oldProps.wordBreak ||
      props.maxWidth !== oldProps.maxWidth;

    if (styleChanged) {
      this.setState({
        styleVersion: this.state.styleVersion + 1
      });
    }
  }

  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    // because `TextLayer` assign the same pickingInfoIndex for one text label,
    // here info.index refers the index of text label in props.data
    info.object = info.index >= 0 ? (this.props.data as any[])[info.index] : null;
    return info;
  }

  /** Returns true if font has changed */
  private _updateFontAtlas(): boolean {
    const {fontSettings, fontFamily, fontWeight} = this.props;
    const {fontAtlasManager, characterSet} = this.state;

    const fontProps = {
      ...fontSettings,
      characterSet,
      fontFamily,
      fontWeight
    };

    if (!fontAtlasManager.mapping) {
      // This is the first update
      fontAtlasManager.setProps(fontProps);
      return true;
    }

    for (const key in fontProps) {
      if (fontProps[key] !== fontAtlasManager.props[key]) {
        fontAtlasManager.setProps(fontProps);
        return true;
      }
    }

    return false;
  }

  // Text strings are variable width objects
  // Count characters and start offsets
  private _updateText() {
    const {data, characterSet} = this.props;
    const textBuffer = (data as any).attributes?.getText;
    let {getText} = this.props;
    let startIndices: number[] = (data as any).startIndices;
    let numInstances: number;

    const autoCharacterSet = characterSet === 'auto' && new Set();

    if (textBuffer && startIndices) {
      const {texts, characterCount} = getTextFromBuffer({
        ...(ArrayBuffer.isView(textBuffer) ? {value: textBuffer} : textBuffer),
        // @ts-ignore if data.attribute is defined then length is expected
        length: data.length,
        startIndices,
        characterSet: autoCharacterSet
      });
      numInstances = characterCount;
      getText = (_, {index}) => texts[index];
    } else {
      const {iterable, objectInfo} = createIterable(data);
      startIndices = [0];
      numInstances = 0;

      for (const object of iterable) {
        objectInfo.index++;
        // Break into an array of characters
        // When dealing with double-length unicode characters, `str.length` or `str[i]` do not work
        const text = Array.from(getText(object, objectInfo) || '');
        if (autoCharacterSet) {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          text.forEach(autoCharacterSet.add, autoCharacterSet);
        }
        numInstances += text.length;
        startIndices.push(numInstances);
      }
    }

    this.setState({
      getText,
      startIndices,
      numInstances,
      characterSet: autoCharacterSet || characterSet
    });
  }

  /** There are two size systems in this layer:

    + Pixel size: user-specified text size, via getSize, sizeScale, sizeUnits etc.
      The layer roughly matches the output of the layer to CSS pixels, e.g. getSize: 12, sizeScale: 2
      in layer props is roughly equivalent to font-size: 24px in CSS.
    + Texture size: internally, character positions in a text blob are calculated using the sizes of iconMapping,
      which depends on how large each character is drawn into the font atlas. This is controlled by
      fontSettings.fontSize (default 64) and most users do not set it manually.
      These numbers are intended to be used in the vertex shader and never to be exposed to the end user.

    All surfaces exposed to the user should either use the pixel size or a multiplier relative to the pixel size. */

  /** Calculate the size and position of each character in a text string.
   * Values are in texture size */
  private transformParagraph(
    object: DataT,
    objectInfo: AccessorContext<DataT>
  ): ReturnType<typeof transformParagraph> {
    const {fontAtlasManager} = this.state;
    const iconMapping = fontAtlasManager.mapping!;
    const getText = this.state.getText!;
    const {wordBreak, lineHeight, maxWidth} = this.props;

    const paragraph = getText(object, objectInfo) || '';
    return transformParagraph(
      paragraph,
      lineHeight,
      wordBreak,
      maxWidth * fontAtlasManager.props.fontSize,
      iconMapping
    );
  }

  /** Returns the x, y, width, height of each text string, relative to pixel size.
   * Used to render the background.
   */
  private getBoundingRect: AccessorFunction<DataT, [number, number, number, number]> = (
    object,
    objectInfo
  ) => {
    let {
      size: [width, height]
    } = this.transformParagraph(object, objectInfo);
    const {fontSize} = this.state.fontAtlasManager.props;
    width /= fontSize;
    height /= fontSize;

    const {getTextAnchor, getAlignmentBaseline} = this.props;
    const anchorX =
      TEXT_ANCHOR[
        typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor
      ];
    const anchorY =
      ALIGNMENT_BASELINE[
        typeof getAlignmentBaseline === 'function'
          ? getAlignmentBaseline(object, objectInfo)
          : getAlignmentBaseline
      ];

    return [((anchorX - 1) * width) / 2, ((anchorY - 1) * height) / 2, width, height];
  };

  /** Returns the x, y offsets of each character in a text string, in texture size.
   * Used to layout characters in the vertex shader.
   */
  private getIconOffsets: AccessorFunction<DataT, number[]> = (object, objectInfo) => {
    const {getTextAnchor, getAlignmentBaseline} = this.props;

    const {
      x,
      y,
      rowWidth,
      size: [width, height]
    } = this.transformParagraph(object, objectInfo);
    const anchorX =
      TEXT_ANCHOR[
        typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor
      ];
    const anchorY =
      ALIGNMENT_BASELINE[
        typeof getAlignmentBaseline === 'function'
          ? getAlignmentBaseline(object, objectInfo)
          : getAlignmentBaseline
      ];

    const numCharacters = x.length;
    const offsets = new Array(numCharacters * 2);
    let index = 0;

    for (let i = 0; i < numCharacters; i++) {
      // For a multi-line object, offset in x-direction needs consider
      // the row offset in the paragraph and the object offset in the row
      const rowOffset = ((1 - anchorX) * (width - rowWidth[i])) / 2;
      offsets[index++] = ((anchorX - 1) * width) / 2 + rowOffset + x[i];
      offsets[index++] = ((anchorY - 1) * height) / 2 + y[i];
    }
    return offsets;
  };

  renderLayers() {
    const {
      startIndices,
      numInstances,
      getText,
      fontAtlasManager: {scale, atlas, mapping},
      styleVersion
    } = this.state;

    const {
      data,
      _dataDiff,
      getPosition,
      getColor,
      getSize,
      getAngle,
      getPixelOffset,
      getBackgroundColor,
      getBorderColor,
      getBorderWidth,
      backgroundPadding,
      background,
      billboard,
      fontSettings,
      outlineWidth,
      outlineColor,
      sizeScale,
      sizeUnits,
      sizeMinPixels,
      sizeMaxPixels,
      transitions,
      updateTriggers
    } = this.props;

    const CharactersLayerClass = this.getSubLayerClass('characters', MultiIconLayer);
    const BackgroundLayerClass = this.getSubLayerClass('background', TextBackgroundLayer);

    return [
      background &&
        new BackgroundLayerClass(
          {
            // background props
            getFillColor: getBackgroundColor,
            getLineColor: getBorderColor,
            getLineWidth: getBorderWidth,
            padding: backgroundPadding,

            // props shared with characters layer
            getPosition,
            getSize,
            getAngle,
            getPixelOffset,
            billboard,
            sizeScale,
            sizeUnits,
            sizeMinPixels,
            sizeMaxPixels,

            transitions: transitions && {
              getPosition: transitions.getPosition,
              getAngle: transitions.getAngle,
              getSize: transitions.getSize,
              getFillColor: transitions.getBackgroundColor,
              getLineColor: transitions.getBorderColor,
              getLineWidth: transitions.getBorderWidth,
              getPixelOffset: transitions.getPixelOffset
            }
          },
          this.getSubLayerProps({
            id: 'background',
            updateTriggers: {
              getPosition: updateTriggers.getPosition,
              getAngle: updateTriggers.getAngle,
              getSize: updateTriggers.getSize,
              getFillColor: updateTriggers.getBackgroundColor,
              getLineColor: updateTriggers.getBorderColor,
              getLineWidth: updateTriggers.getBorderWidth,
              getPixelOffset: updateTriggers.getPixelOffset,
              getBoundingRect: {
                getText: updateTriggers.getText,
                getTextAnchor: updateTriggers.getTextAnchor,
                getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
                styleVersion
              }
            }
          }),
          {
            data:
              // @ts-ignore (2339) attribute is not defined on all data types
              data.attributes && data.attributes.background
                ? // @ts-ignore (2339) attribute is not defined on all data types
                  {length: data.length, attributes: data.attributes.background}
                : data,
            _dataDiff,
            // Maintain the same background behavior as <=8.3. Remove in v9?
            autoHighlight: false,
            getBoundingRect: this.getBoundingRect
          }
        ),
      new CharactersLayerClass(
        {
          sdf: fontSettings.sdf,
          smoothing: Number.isFinite(fontSettings.smoothing)
            ? fontSettings.smoothing
            : DEFAULT_FONT_SETTINGS.smoothing,
          outlineWidth: outlineWidth / (fontSettings.radius || DEFAULT_FONT_SETTINGS.radius),
          outlineColor,
          iconAtlas: atlas,
          iconMapping: mapping,

          getPosition,
          getColor,
          getSize,
          getAngle,
          getPixelOffset,

          billboard,
          sizeScale: sizeScale * scale,
          sizeUnits,
          sizeMinPixels: sizeMinPixels * scale,
          sizeMaxPixels: sizeMaxPixels * scale,

          transitions: transitions && {
            getPosition: transitions.getPosition,
            getAngle: transitions.getAngle,
            getColor: transitions.getColor,
            getSize: transitions.getSize,
            getPixelOffset: transitions.getPixelOffset
          }
        },
        this.getSubLayerProps({
          id: 'characters',
          updateTriggers: {
            all: updateTriggers.getText,
            getPosition: updateTriggers.getPosition,
            getAngle: updateTriggers.getAngle,
            getColor: updateTriggers.getColor,
            getSize: updateTriggers.getSize,
            getPixelOffset: updateTriggers.getPixelOffset,
            getIconOffsets: {
              getTextAnchor: updateTriggers.getTextAnchor,
              getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
              styleVersion
            }
          }
        }),
        {
          data,
          _dataDiff,
          startIndices,
          numInstances,
          getIconOffsets: this.getIconOffsets,
          getIcon: getText
        }
      )
    ];
  }

  static set fontAtlasCacheLimit(limit: number) {
    setFontAtlasCacheLimit(limit);
  }
}
