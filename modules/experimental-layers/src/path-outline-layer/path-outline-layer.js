import {PathLayer} from '@deck.gl/layers';
import GL from 'luma.gl/constants';
import {Framebuffer, Texture2D} from 'luma.gl';
import outline from '../shaderlib/outline/outline';

// TODO - this should be built into assembleShaders
function injectShaderCode({source, declarations = '', code = ''}) {
  const INJECT_DECLARATIONS = /^/;
  const INJECT_CODE = /}[^{}]*$/;

  return source
    .replace(INJECT_DECLARATIONS, declarations)
    .replace(INJECT_CODE, code.concat('\n}\n'));
}

const VS_DECLARATIONS = `\
#ifdef MODULE_OUTLINE
  attribute float instanceZLevel;
#endif
`;

const VS_CODE = `\
#ifdef MODULE_OUTLINE
  outline_setUV(gl_Position);
  outline_setZLevel(instanceZLevel);
#endif
`;

const FS_CODE = `\
#ifdef MODULE_OUTLINE
  gl_FragColor = outline_filterColor(gl_FragColor);
#endif
`;

const defaultProps = {
  getZLevel: {type: 'accessor', value: 0}
};

export default class PathOutlineLayer extends PathLayer {
  // Override getShaders to inject the outline module
  getShaders() {
    const shaders = super.getShaders();
    return Object.assign({}, shaders, {
      modules: shaders.modules.concat([outline]),
      vs: injectShaderCode({source: shaders.vs, declarations: VS_DECLARATIONS, code: VS_CODE}),
      fs: injectShaderCode({source: shaders.fs, code: FS_CODE})
    });
  }

  initializeState(context) {
    super.initializeState(context);

    // Create an outline "shadow" map
    // TODO - we should create a single outlineMap for all layers
    this.setState({
      outlineFramebuffer: new Framebuffer(context.gl),
      dummyTexture: new Texture2D(context.gl)
    });

    // Create an attribute manager
    this.state.attributeManager.addInstanced({
      instanceZLevel: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        update: this.calculateZLevels,
        accessor: 'getZLevel'
      }
    });
  }

  // Override draw to add render module
  draw({moduleParameters = {}, parameters, uniforms, context}) {
    // Need to calculate same uniforms as base layer
    const {
      rounded,
      miterLimit,
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      dashJustified
    } = this.props;

    uniforms = Object.assign({}, uniforms, {
      jointType: Number(rounded),
      alignMode: Number(dashJustified),
      widthScale,
      miterLimit,
      widthMinPixels,
      widthMaxPixels
    });

    // Render the outline shadowmap (based on segment z orders)
    const {outlineFramebuffer, dummyTexture} = this.state;
    outlineFramebuffer.resize();
    outlineFramebuffer.clear({color: true, depth: true});

    this.state.model.updateModuleSettings({
      outlineEnabled: true,
      outlineRenderShadowmap: true,
      outlineShadowmap: dummyTexture
    });

    this.state.model.draw({
      uniforms: Object.assign({}, uniforms, {
        jointType: 0,
        widthScale: this.props.widthScale * 1.3
      }),
      parameters: {
        depthTest: false,
        blendEquation: GL.MAX // Biggest value needs to go into buffer
      },
      framebuffer: outlineFramebuffer
    });

    // Now use the outline shadowmap to render the lines (with outlines)
    this.state.model.updateModuleSettings({
      outlineEnabled: true,
      outlineRenderShadowmap: false,
      outlineShadowmap: outlineFramebuffer
    });
    this.state.model.draw({
      uniforms: Object.assign({}, uniforms, {
        jointType: Number(rounded),
        widthScale: this.props.widthScale
      }),
      parameters: {
        depthTest: false
      }
    });
  }

  calculateZLevels(attribute) {
    const {getZLevel} = this.props;
    const {pathTesselator} = this.state;

    attribute.value = pathTesselator._updateAttribute({
      target: attribute.value,
      size: 1,
      getValue: (object, index) => [getZLevel(object, index) || 0]
    });
  }
}

PathOutlineLayer.layerName = 'PathOutlineLayer';
PathOutlineLayer.defaultProps = defaultProps;
