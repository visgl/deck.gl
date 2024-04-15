import {getResolution} from 'quadbin';

import {SolidPolygonLayer} from '@deck.gl/layers';

import {heatmap} from './heatmap';
import {OffscreenModifier, PostProcessModifier} from './post-process-layer';
import QuadbinTileLayer, {QuadbinTileLayerProps} from './quadbin-tile-layer';
import {
  Accessor,
  AccessorFunction,
  Color,
  CompositeLayer,
  DefaultProps,
  Layer
} from '@deck.gl/core';

// Modified polygon layer to draw offscreen and output value expected by heatmap
class OffscreenSolidPolygonLayer extends OffscreenModifier(SolidPolygonLayer) {
  getShaders(type) {
    const shaders = super.getShaders(type);
    shaders.inject = {
      'vs:#decl': 'uniform float cellResolution;',
      'vs:DECKGL_FILTER_COLOR': `
  const vec3 RGB = vec3(256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
  float value = dot(RGB, color.rgb);

  // Keep "power" delivered to screen constant when tiles update
  float relativeZoom = log2(project_uScale) - cellResolution + 3.5; // range 0-1
  float relativeArea = pow(2.0, -2.0 * relativeZoom); // range 0.25-1
  value *= relativeArea;

  // Pack float into 3 channels to pass to heatmap shader
  color = vec4(mod(value, 256.0), floor(value / RGB.rg), 255.0) / 255.0;
      `
    };
    return shaders;
  }

  draw(this, opts: any) {
    const cell0 = this.props!.data[0];
    const cellResolution = Number(getResolution(cell0.id));
    for (const model of this.state.models) {
      model.setUniforms({cellResolution});
    }

    super.draw(opts);
  }
}

// Modify QuadbinTileLayer to apply heatmap post process effect
const PostProcessQuadbinTileLayer = PostProcessModifier(QuadbinTileLayer, heatmap);

const defaultProps: DefaultProps<QuadbinHeatmapTileLayerProps> = {
  ...QuadbinTileLayer.defaultProps,

  getWeight: {type: 'accessor', value: 1}
};

/** All properties supported by QuadbinHeatmapTileLayer. */
export type QuadbinHeatmapTileLayerProps<DataT = unknown> = _QuadbinHeatmapTileLayerProps<DataT> &
  QuadbinTileLayerProps;

/** Properties added by QuadbinHeatmapTileLayer. */
type _QuadbinHeatmapTileLayerProps<DataT> = QuadbinTileLayerProps<DataT> & {
  /**
   * Radius of the circle in pixels, to which the weight of an object is distributed.
   *
   * @default 30
   */
  radiusPixels?: number;

  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];

  /**
   * Value that is multiplied with the total weight at a pixel to obtain the final weight.
   *
   * @default 1
   */
  intensity?: number;

  /**
   * Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].
   *
   * @default null
   */
  colorDomain?: [number, number] | null;

  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
};

class QuadbinHeatmapTileLayer<DataT = any, ExtraProps extends {} = {}> extends CompositeLayer<
  ExtraProps & Required<_QuadbinHeatmapTileLayerProps<DataT>>
> {
  static layerName = 'QuadbinHeatmapTileLayer';
  static defaultProps = defaultProps;

  renderLayers(): Layer {
    const {getWeight, palette, radiusPixels, rangeScale, _subLayerProps} = this.props;

    // Inject modified polygon layer as sublayer into TileLayer
    const subLayerProps = {
      ..._subLayerProps,
      cell: {
        ..._subLayerProps?.cell,
        _subLayerProps: {
          ..._subLayerProps?.cell?._subLayerProps,
          fill: {
            ..._subLayerProps?.cell?._subLayerProps?.fill,
            type: OffscreenSolidPolygonLayer
          }
        }
      }
    };

    function encodeWeight(w: number) {
      return [w % 256, Math.floor(w / 256), Math.floor(w / (256 * 256))];
    }

    const getFillColor =
      typeof getWeight === 'function'
        ? (d, info) => encodeWeight(getWeight(d, info))
        : encodeWeight(getWeight);

    return new PostProcessQuadbinTileLayer(
      this.getSubLayerProps({
        id: 'heatmap',
        data: this.props.data,

        getFillColor,
        palette,
        radiusPixels,
        rangeScale,
        _subLayerProps: subLayerProps
      })
    );
  }
}

export default QuadbinHeatmapTileLayer;
