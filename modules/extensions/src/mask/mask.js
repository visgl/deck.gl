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

  initializeState({gl}, extension) {
    const [width, height] = [2048, 2048];
    const maskFBO = new Framebuffer(gl, {width, height, depth: false});
    const maskLayerManager = new LayerManager(gl);
    this.setState({maskFBO, maskLayerManager});
  }

  updateState({props, oldProps, context: {gl}}, extension) {
    const maskNeedsUpdate =
      props.maskByInstance !== oldProps.maskByInstance ||
      props.maskEnabled !== oldProps.maskEnabled ||
      JSON.stringify(props.maskPolygon) !== JSON.stringify(oldProps.maskPolygon);
    if (maskNeedsUpdate) {
      const maskLayer = new SolidPolygonLayer({
        id: 'mask-polygon',
        data: [{polygon: props.maskPolygon}],
        getFillColor: [255, 255, 255, 255]
      });
      this.state.maskLayerManager.setLayers([maskLayer]);
      this.setState({maskNeedsUpdate});
    }
  }

  draw({uniforms}, extension) {
    const {maskFBO, maskNeedsUpdate, maskLayerManager} = this.state;
    const {deck, gl} = this.context;
    const viewManagerNeedsRedraw = true;

    const {maskEnabled = defaultProps.maskEnabled} = this.props;
    const {maskPolygon} = maskEnabled ? this.props : defaultProps;
    const viewport = getMaskViewport(maskPolygon, this.internalState.viewport, maskFBO);
    const {maskProjectionMatrix, maskProjectCenter} = splitMaskProjectionMatrix(
      getMaskProjectionMatrix(viewport),
      this.internalState.viewport,
      this.props
    );

    if (maskNeedsUpdate && viewManagerNeedsRedraw) {
      withParameters(gl, {framebuffer: maskFBO}, () => {
        deck.deckRenderer.renderLayers({
          target: maskFBO,
          layers: maskLayerManager.getLayers(),
          viewports: [viewport],
          onViewportActive: maskLayerManager.activateViewport,
          moduleParameters: {
            devicePixelRatio: 1
          }
        });
      });
      uniforms.mask_enabled = Boolean(maskEnabled);
      uniforms.mask_texture = maskFBO;
      uniforms.mask_projectionMatrix = maskProjectionMatrix;
      uniforms.mask_projectCenter = maskProjectCenter;
    }
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
