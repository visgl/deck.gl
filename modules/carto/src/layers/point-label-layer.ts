import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  Layer,
  LayersList
} from '@deck.gl/core';
import {
  TextLayer,
  TextLayerProps,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';

const [LEFT, TOP, RIGHT, BOTTOM] = [0, 1, 2, 3];

class EnhancedTextBackgroundLayer extends TextBackgroundLayer {
  static layerName = 'EnhancedTextBackgroundLayer';

  getShaders() {
    const shaders = super.getShaders();
    let vs = shaders.vs;

    // Modify shader so that the padding is offset by the pixel offset to ensure the padding
    // always captures the anchor point. As padding is uniform we cannot pass it a per-label value
    vs = vs.replaceAll('padding.', '_padding.');
    vs = vs.replace(
      'void main(void) {',
      'void main(void) {\n  vec4 _padding = padding + instancePixelOffsets.xyxy * vec4(1.0, 1.0, -1.0, -1.0);'
    );

    return {...shaders, vs};
  }
}

// TextLayer which includes modified text-background-layer-vertex shader and only renders the
// primary background layer in the collision pass
class EnhancedTextLayer extends TextLayer {
  static layerName = 'EnhancedTextLayer';

  filterSubLayer({layer, renderPass}) {
    const background = layer.id.includes('primary-background');
    if (renderPass === 'collision') {
      return background; // Only draw primary background layer in collision pass
    }

    return !background; // Do not draw background layer in other passes
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
      getSecondaryText,
      radiusScale,
      secondarySizeScale,
      sizeScale
    } = this.props;
    const xMult = anchor === 'middle' ? 0 : anchor === 'start' ? 1 : -1;
    const yMult = alignment === 'center' ? 0 : alignment === 'bottom' ? 1 : -1;

    // Padding based on font size (font size / 4)
    const xPadding = sizeScale / 4;
    const yPadding = sizeScale * (1 + 1 / 4);

    // Place secondary label under main label (secondary label always 'top' baseline aligned)
    const secondaryOffset = 0.6 * (1 - yMult) * sizeScale;
    let yOffset = secondary ? secondaryOffset : 0;

    // Special case, position relative to secondary label
    if (anchor === 'middle' && alignment === 'top' && getSecondaryText) {
      yOffset -= secondaryOffset;
      yOffset -= secondarySizeScale;
      yOffset += sizeScale;
    }

    // Padding based on point radius (radius/ 4)
    const radiusPadding = 1 + 1 / 4;

    return typeof getRadius === 'function'
      ? (d, info) => {
          const r = (info ? getRadius(d, info) : 1) * radiusScale * radiusPadding;
          return [xMult * (r + xPadding), yMult * (r + yPadding) + yOffset];
        }
      : [
          xMult * (getRadius * radiusScale * radiusPadding + xPadding),
          yMult * (getRadius * radiusScale * radiusPadding + yPadding) + yOffset
        ];
  }

  calculateBackgroundPadding() {
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
        data,

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
        getSize: 1,
        _subLayerProps: {background: {type: EnhancedTextBackgroundLayer}}
      },
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
    const backgroundPadding = this.calculateBackgroundPadding();
    const out = [
      // Text doesn't update via updateTrigger for some reason
      this.renderTextLayer(`${updateTriggers.getText}-primary`, {
        backgroundPadding,
        getText,
        getPixelOffset,
        background: true // Only use background for primary label for faster collisions
      }),
      Boolean(getSecondaryText) &&
        this.renderTextLayer(`${updateTriggers.getSecondaryText}-secondary`, {
          getText: getSecondaryText,
          getPixelOffset: this.calculatePixelOffset(true),
          getAlignmentBaseline: 'top',
          // updateTriggers: {getText: updateTriggers.getSecondaryText},

          // Optional overrides
          ...(getSecondaryColor && {getColor: getSecondaryColor}),
          ...(secondarySizeScale && {sizeScale: secondarySizeScale}),
          ...(secondaryOutlineColor && {outlineColor: secondaryOutlineColor})
        })
    ];

    return out;
  }
}
