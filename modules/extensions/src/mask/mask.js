import {Framebuffer, withParameters} from '@luma.gl/core';
import {LayerExtension, LayerManager} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {shaderModuleVs, shaderModuleFs} from './shader-module';
import {getMaskProjectionMatrix, getMaskViewport, splitMaskProjectionMatrix} from './utils';

const MAX_LAT = 85.05113;
const MAX_LNG = 180;
const defaultProps = {
  maskEnabled: true,
  maskPolygon: [
    [-MAX_LNG, MAX_LAT],
    [MAX_LNG, MAX_LAT],
    [MAX_LNG, -MAX_LAT],
    [-MAX_LNG, -MAX_LAT],
    [-MAX_LNG, MAX_LAT]
  ]
};

export default class MaskExtension extends LayerExtension {
  getShaders() {
    // If `maskByInstance: true`, the entire object is shown/hidden based on its anchor position (done by vertex shader)
    // Otherwise, the object is trimmed by the mask bounds (done by fragment shader)

    // Default behavior: consider a layer instanced if it has attribute `instancePositions`
    let maskByInstance = 'instancePositions' in this.getAttributeManager().attributes;
    // Users can override by setting the `maskByInstance` prop
    if ('maskByInstance' in this.props) {
      maskByInstance = this.props.maskByInstance;
    }

    return {
      modules: [maskByInstance ? shaderModuleVs : shaderModuleFs]
    };
  }

  initializeState({gl, layerManager}, extension) {
    const layers = layerManager._nextLayers || layerManager.layers;
    const {maskId} = this.props;
    const maskLayer = layers.find(layer => layer.id === maskId);
    if (maskLayer && !maskLayer.state.maskFBO) {
      const [width, height] = [2048, 2048];
      const maskFBO = new Framebuffer(gl, {width, height, depth: false});
      maskLayer.setState({maskFBO});
    }
  }

  draw({uniforms}, extension) {
    const {maskEnabled = defaultProps.maskEnabled, maskId} = this.props;
    const {deck, gl, layerManager} = this.context;
    const maskLayer = layerManager.layers.find(layer => layer.id === maskId);
    const {maskFBO} = maskLayer.state;

    const maskPolygon = maskEnabled ? maskLayer.props.data[0].polygon : defaultProps.maskPolygon;
    const layerViewport = this.internalState.viewport;
    const maskViewport = getMaskViewport(maskPolygon, layerViewport, maskFBO);
    const {maskProjectionMatrix, maskProjectCenter} = splitMaskProjectionMatrix(
      getMaskProjectionMatrix(maskViewport),
      layerViewport,
      this.props
    );

    const needsRedraw = maskLayer.getNeedsRedraw({clearRedrawFlags: true});
    if (needsRedraw) {
      withParameters(gl, {framebuffer: maskFBO}, () => {
        deck.deckRenderer.renderLayers({
          target: maskFBO,
          layers: [maskLayer],
          viewports: [maskViewport],
          onViewportActive: layerManager.activateViewport,
          moduleParameters: {
            devicePixelRatio: 1
          }
        });
      });
    }

    uniforms.mask_enabled = Boolean(maskEnabled);
    uniforms.mask_texture = maskFBO;
    uniforms.mask_projectionMatrix = maskProjectionMatrix;
    uniforms.mask_projectCenter = maskProjectCenter;
  }

  finalizeState() {
    const {maskFBO} = this.state;
    if (maskFBO) {
      maskFBO.color.delete();
      maskFBO.delete();
    }
  }
}

MaskExtension.extensionName = 'MaskExtension';
MaskExtension.defaultProps = defaultProps;
