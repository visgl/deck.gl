import {getResolution} from 'quadbin';

import {Accessor, CompositeLayer, CompositeLayerProps, DefaultProps, Layer} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';

import {HeatmapProps, heatmap} from './heatmap';
import {RTTModifier, PostProcessModifier} from './post-process-utils';
import QuadbinTileLayer, {QuadbinTileLayerProps} from './quadbin-tile-layer';
import {TilejsonPropType} from './utils';
import {TilejsonResult} from '../sources';

// Modified polygon layer to draw offscreen and output value expected by heatmap
class RTTSolidPolygonLayer extends RTTModifier(SolidPolygonLayer) {
  static layerName = 'RTTSolidPolygonLayer';

  getShaders(type) {
    const shaders = super.getShaders(type);
    shaders.inject = {
      'vs:#decl': 'uniform float cellResolution;',
      'vs:DECKGL_FILTER_COLOR': `
  const vec3 SHIFT = vec3(1.0, 256.0, 256.0 * 256.0);
  float value = 255.0 * dot(SHIFT, color.rgb);

  // Keep "power" delivered to screen constant when tiles update
  float relativeZoom = log2(project.scale) - cellResolution + 3.5; // range 0-1
  float relativeArea = pow(2.0, -2.0 * relativeZoom); // range 0.25-1
  value *= relativeArea;

  // Pack float into 3 channels to pass to heatmap shader
  color = vec4(mod(vec3(value, floor(value / SHIFT.yz)), 256.0), 255.0) / 255.0;
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

function encodeWeight(w: number) {
  return [w % 256, Math.floor(w / 256), Math.floor(w / (256 * 256))];
}

const defaultProps: DefaultProps<QuadbinHeatmapTileLayerProps> = {
  data: TilejsonPropType,
  getWeight: {type: 'accessor', value: 1}
};

/** All properties supported by QuadbinHeatmapTileLayer. */
export type QuadbinHeatmapTileLayerProps<DataT = unknown> = _QuadbinHeatmapTileLayerProps<DataT> &
  CompositeLayerProps & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

/** Properties added by QuadbinHeatmapTileLayer. */
type _QuadbinHeatmapTileLayerProps<DataT> = QuadbinTileLayerProps<DataT> &
  HeatmapProps & {
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
    const {
      data,
      getWeight,
      colorDomain,
      colorRange,
      radiusPixels,
      _subLayerProps,
      updateTriggers,
      ...tileLayerProps
    } = this.props;

    // Inject modified polygon layer as sublayer into TileLayer
    const subLayerProps = {
      ..._subLayerProps,
      cell: {
        ..._subLayerProps?.cell,
        _subLayerProps: {
          ..._subLayerProps?.cell?._subLayerProps,
          fill: {
            ..._subLayerProps?.cell?._subLayerProps?.fill,
            type: RTTSolidPolygonLayer
          }
        }
      }
    };

    const getFillColor =
      typeof getWeight === 'function'
        ? (d, info) => encodeWeight(getWeight(d, info))
        : encodeWeight(getWeight);

    return new PostProcessQuadbinTileLayer(
      tileLayerProps as Omit<QuadbinTileLayerProps, 'data'>,
      this.getSubLayerProps({
        id: 'heatmap',
        data,

        getFillColor,

        colorDomain,
        colorRange,
        radiusPixels,
        _subLayerProps: subLayerProps,

        updateTriggers: {
          getPosition: updateTriggers.getWeight
        }
      })
    );
  }
}

export default QuadbinHeatmapTileLayer;
