import {getResolution} from 'quadbin';

import {SolidPolygonLayer} from '@deck.gl/layers';

import {heatmap} from './heatmap';
import {OffscreenModifier, PostProcessModifier} from './post-process-layer';
import QuadbinTileLayer from './quadbin-tile-layer';
import {CompositeLayer, Layer} from '@deck.gl/core';

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
class QuadbinHeatmapTileLayer extends CompositeLayer {
  static layerName = 'QuadbinHeatmapTileLayer';

  renderLayers(): Layer {
    const {aggregationExp, aggregationResLevel, getFillColor, palette, radius, rangeScale} =
      this.props;
    return new PostProcessQuadbinTileLayer(
      this.getSubLayerProps({
        id: 'heatmap',
        data: this.props.data,

        aggregationExp,
        aggregationResLevel,
        getFillColor,
        palette,
        radius,
        rangeScale
      })
    );
  }
}

// Inject modified polygon layer as sublayer into TileLayer
const _subLayerProps = {cell: {_subLayerProps: {fill: {type: OffscreenSolidPolygonLayer}}}};
QuadbinHeatmapTileLayer.defaultProps._subLayerProps = _subLayerProps;

export default QuadbinHeatmapTileLayer;

// Can also work with H3 in theory
// const PostProcessH3TileLayer = PostProcessModifier(H3TileLayer, heatmap);
// const _subLayerProps = {'hexagon-cell-hifi': {_subLayerProps: {fill: {type: OffscreenSolidPolygonLayer}}}};
