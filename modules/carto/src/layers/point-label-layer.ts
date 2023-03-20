import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  Layer,
  LayersList
} from '@deck.gl/core';
import {TextLayer, TextLayerProps} from '@deck.gl/layers';

// TODO remove prior to release
const SHOW_TEXT_BORDER = false;

const [LEFT, TOP, RIGHT, BOTTOM] = [0, 1, 2, 3];
class EnhancedTextLayer extends TextLayer {
  filterSubLayer({layer, renderPass}) {
    const background = layer.id.includes('primary-background');
    if (renderPass === 'collision') {
      return background; // Only draw primary background layer in collision pass
    } else {
      return !background || (SHOW_TEXT_BORDER && this.props.getBorderWidth); // Do not draw background layer in other passes
    }
  }
}

const defaultProps: DefaultProps<PointLabelLayerProps> = {
  ...TextLayer.defaultProps,
  getRadius: {type: 'accessor', value: 1},
  radiusScale: {type: 'number', min: 0, value: 1}
};

/** All properties supported by PointLabelLayer. */
export type PointLabelLayerProps<DataT = any> = _PointLabelLayerProps<DataT> &
  TextLayerProps &
  CompositeLayerProps;

/** Properties added by PointLabelLayer. */
type _PointLabelLayerProps<DataT> = TextLayerProps<DataT> & {
  /**
   * Radius multiplier.
   * @default 1
   */
  radiusScale?: number;
  /**
   * Radius accessor.
   * @default 1
   */
  getRadius?: Accessor<DataT, number>;
  /**
   * Secondary label text accessor
   */
  getSecondaryText?: Accessor<DataT, string>;
  /**
   * Secondary label color accessor
   * @default [0, 0, 0, 255]
   */
  getSecondaryColor?: Accessor<DataT, Color>;
  /**
   * Secondary label color of outline around the text, in `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.
   * @default [0, 0, 0, 255]
   */
  secondaryOutlineColor?: Color;
  /**
   * Secondary label text size multiplier.
   * @default 1
   */
  secondarySizeScale?: number;
};

export default class PointLabelLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_PointLabelLayerProps<DataT>>> {
  static layerName = 'PointLabelLayer';
  static defaultProps = defaultProps;

  calculatePixelOffset(secondary) {
    const {
      getTextAnchor: anchor,
      getAlignmentBaseline: alignment,
      getRadius,
      radiusScale,
      sizeScale
    } = this.props;
    const xMult = anchor === 'middle' ? 0 : anchor === 'start' ? 1 : -1;
    const yMult = alignment === 'center' ? 0 : alignment === 'bottom' ? 1 : -1;

    // Place secondary label under main label (spacing 1 / 3 main label font size)
    const yOffset = secondary ? (1 + 1 / 3) * sizeScale : 0;

    // Padding based on font size (font size / 4)
    const xPadding = sizeScale / 4;
    const yPadding = sizeScale * (1 + 1 / 4);

    // Padding based on point radius (radius/ 4)
    const radiusPadding = 1 + 1 / 4;

    return typeof getRadius === 'function'
      ? (d, info) => {
          const r = (d ? getRadius(d, info) : 1) * radiusScale * radiusPadding;
          return [xMult * (r + xPadding), yMult * (r + yPadding) + yOffset];
        }
      : [
          xMult * (getRadius * radiusScale * radiusPadding + xPadding),
          yMult * (getRadius * radiusScale * radiusPadding + yPadding) + yOffset
        ];
  }

  calculateBackgroundPadding(getPixelOffset) {
    const {getTextAnchor: anchor, getAlignmentBaseline: alignment, sizeScale} = this.props;

    // Heuristics to avoid label overlap
    const paddingX = 12 * sizeScale;
    const paddingY = 3 * sizeScale;
    const backgroundPadding = [0, 0, 0, 0];
    if (alignment === 'top') {
      backgroundPadding[TOP] = paddingY;
    } else if (alignment === 'bottom') {
      backgroundPadding[BOTTOM] = paddingY;
    } else {
      backgroundPadding[TOP] = 0.5 * paddingY;
      backgroundPadding[BOTTOM] = 0.5 * paddingY;
    }
    if (anchor === 'start') {
      backgroundPadding[LEFT] = paddingX;
    } else if (anchor === 'end') {
      backgroundPadding[RIGHT] = paddingX;
    } else {
      backgroundPadding[LEFT] = 0.5 * paddingX;
      backgroundPadding[RIGHT] = 0.5 * paddingX;
    }

    // For getRadius function, invoke without data, as there is no backgroundPadding accessor
    const pixelOffset = Array.isArray(getPixelOffset) ? getPixelOffset : getPixelOffset();
    backgroundPadding[LEFT] += pixelOffset[0];
    backgroundPadding[RIGHT] -= pixelOffset[0];
    backgroundPadding[TOP] += pixelOffset[1];
    backgroundPadding[BOTTOM] -= pixelOffset[1];

    return backgroundPadding;
  }

  renderTextLayer(id, {updateTriggers: updateTriggersOverride = {}, ...props}): EnhancedTextLayer {
    const {
      data,

      characterSet,
      fontFamily,
      fontSettings,
      fontWeight,
      outlineColor,
      outlineWidth,
      sizeScale,
      radiusScale,

      getAlignmentBaseline,
      getColor,
      getPosition,
      getTextAnchor,

      updateTriggers
    } = this.props;

    return new EnhancedTextLayer(
      this.getSubLayerProps({
        id,
        data: data,

        characterSet,
        fontFamily,
        fontSettings,
        fontWeight,
        outlineColor,
        outlineWidth,
        sizeScale,

        getAlignmentBaseline,
        getColor,
        getPosition,
        getTextAnchor,

        updateTriggers: {
          ...updateTriggers,
          ...updateTriggersOverride,
          getPixelOffset: [
            updateTriggers.getRadius,
            updateTriggers.getTextAnchor,
            updateTriggers.getAlignmentBaseline,
            radiusScale,
            sizeScale
          ]
        }
      }),
      {
        getSize: 1
      },
      // DEBUG
      SHOW_TEXT_BORDER
        ? {getBackgroundColor: [0, 0, 0, 0], getBorderColor: [255, 0, 0, 80], getBorderWidth: 1}
        : {},
      props
    );
  }

  renderLayers(): Layer | null | LayersList {
    const {
      getText,
      getSecondaryColor,
      getSecondaryText,
      secondaryOutlineColor,
      secondarySizeScale,
      updateTriggers
    } = this.props;
    const getPixelOffset = this.calculatePixelOffset(false);
    const backgroundPadding = this.calculateBackgroundPadding(getPixelOffset);
    const out = [
      this.renderTextLayer('primary', {
        backgroundPadding,
        getText,
        getPixelOffset,
        background: true // Only use background for primary label for faster collisions
      }),
      Boolean(getSecondaryText) &&
        this.renderTextLayer('secondary', {
          getText: getSecondaryText,
          getPixelOffset: this.calculatePixelOffset(true),
          updateTriggers: {getText: updateTriggers.getSecondaryText},

          // Optional overrides
          ...(getSecondaryColor && {getColor: getSecondaryColor}),
          ...(secondarySizeScale && {sizeScale: secondarySizeScale}),
          ...(secondaryOutlineColor && {outlineColor: secondaryOutlineColor})
        })
    ];

    return out;
  }
}
