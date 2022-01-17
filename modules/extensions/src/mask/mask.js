import {log, Framebuffer, withParameters} from '@luma.gl/core';
import {LayerExtension} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {shaderModuleVs, shaderModuleFs} from './shader-module';
import {getMaskProjectionMatrix, getMaskViewport, splitMaskProjectionMatrix} from './utils';

const defaultProps = {
  maskEnabled: true
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
    const maskLayer = extension.getMaskLayer(this.props.maskId, layerManager);
    if (!maskLayer.state.maskFBO) {
      const [width, height] = [2048, 2048];
      const maskFBO = new Framebuffer(gl, {width, height, depth: false});
      maskLayer.setState({maskFBO});
      // TODO how to best dispose of the FBO?
    }
  }

  draw({uniforms}, extension) {
    const {maskEnabled = defaultProps.maskEnabled, maskId} = this.props;
    const {deck, gl, layerManager} = this.context;
    const maskLayer = extension.getMaskLayer(maskId, layerManager);
    const {maskFBO} = maskLayer.state;

    // Using the 'positions' attribute will work for the PolygonLayer,
    // but not for all layers
    const {positions} = maskLayer.state.attributeManager.attributes;
    const layerViewport = this.internalState.viewport;
    const maskViewport = getMaskViewport(positions, layerViewport, maskFBO);
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

  getMaskLayer(maskId, layerManager) {
    const layers = layerManager._nextLayers || layerManager.layers;
    const maskLayer = layers.find(layer => layer.id === maskId);
    log.assert(maskLayer, `{maskId: '${maskId}'} must match the id of another Layer`);
    log.assert(maskLayer instanceof SolidPolygonLayer, 'Mask Layer must be a SolidPolygonLayer');
    return maskLayer;
  }
}

MaskExtension.extensionName = 'MaskExtension';
MaskExtension.defaultProps = defaultProps;
