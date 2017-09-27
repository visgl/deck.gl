import {PathLayer} from 'deck.gl';
import {GL, Framebuffer, registerShaderModules} from 'luma.gl';

import VS from './path-layer-vertex.glsl';
import VS64 from './path-layer-vertex-64.glsl';
import FS from './path-layer-fragment.glsl';

import outline from '../shaderlib/outline/outline';

registerShaderModules([outline]);

const VS_PROLOGUE = `\
#ifdef MODULE_OUTLINE
  attribute float instanceZLevel;
#endif
`;

const VS_EPILOGUE = `\
#ifdef MODULE_OUTLINE
  outline_setUV(gl_Position);
  outline_setZLevel(instanceZLevel);
#endif
`;

const FS_EPILOGUE = `\
#ifdef MODULE_OUTLINE
  gl_FragColor = outline_filterColor(gl_FragColor);
#endif
`;

// TODO - Build injection support into assembleShaders
const vs = VS
  .replace('// INJECT-PROLOGUE', VS_PROLOGUE)
  .replace('// INJECT-EPILOGUE', VS_EPILOGUE);
const vs64 = VS64
  .replace('// INJECT-PROLOGUE', VS_PROLOGUE)
  .replace('// INJECT-EPILOGUE', VS_EPILOGUE);
const fs = FS
  .replace('// INJECT-EPILOGUE', FS_EPILOGUE);

const defaultProps = {
  getZLevel: object => object.zLevel | 0
};

export default class SegmentLayer extends PathLayer {
  // Override getShaders to add the outline module
  getShaders() {
    return this.props.fp64 ?
      {vs: vs64, fs, modules: ['project64', 'outline']} :
      {vs, fs, modules: ['outline']};
  }

  initializeState(context) {
    super.initializeState(context);

    // Create an outline "shadow" map
    // TODO - we should create a single outlineMap for all layers
    this.setState({
      outlineFramebuffer: new Framebuffer(context.gl),
      dummyFramebuffer: new Framebuffer(context.gl)
    });

    // Create an attribute manager
    this.state.attributeManager.addInstanced({
      instanceZLevel: {size: 4, type: GL.UNSIGNED_BYTE,
        update: this.calculateZLevels, accessor: 'getZLevel'}
    });
  }

  // Override draw to add render module
  draw({moduleParameters = {}, uniforms, context}) {
    const {rounded, miterLimit, widthScale, widthMinPixels, widthMaxPixels} = this.props;
    const jointType = Number(rounded);

    uniforms = Object.assign({}, uniforms, {
      jointType,
      widthScale,
      miterLimit,
      widthMinPixels,
      widthMaxPixels
    });

    // Render the outline shadowmap (based on segment z orders)
    const {gl} = context;
    const {outlineFramebuffer, dummyFramebuffer} = this.state;

    // TODO - working around some framebuffer bugs, will clean up when  luma.gl fixes are available
    outlineFramebuffer.resize({width: gl.canvas.clientWidth, height: gl.canvas.clientHeight});
    dummyFramebuffer.resize({width: gl.canvas.clientWidth, height: gl.canvas.clientHeight});

    // withParameters(gl, {framebuffer: outlineFramebuffer},
    //   () => clear(context.gl, {framebuffer: outlineFramebuffer,
    // color: true, depth: true, stencil: true});

    const prevFramebuffer = gl.luma.getParameter(gl.FRAMEBUFFER_BINDING);
    gl.bindFramebuffer(gl.FRAMEBUFFER, outlineFramebuffer.handle);

    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    moduleParameters = Object.assign({}, moduleParameters, {
      outlineEnabled: true,
      outlineRenderShadowmap: true,
      outlineShadowmap: dummyFramebuffer.texture
    });
    this.state.model.updateModuleSettings(moduleParameters);

    this.state.model.draw({
      moduleParameters,
      uniforms: Object.assign({}, uniforms, {
        widthScale: this.props.widthScale * 1.2
      }),
      parameters: {
        depthTest: false
      },
      framebuffer: outlineFramebuffer
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, prevFramebuffer);

    // // Now use the outline shadowmap to render the lines (with outlines)

    moduleParameters = Object.assign({}, moduleParameters, {
      outlineEnabled: true,
      outlineRenderShadowmap: false,
      outlineShadowmap: outlineFramebuffer.texture
    });
    this.state.model.updateModuleSettings(moduleParameters);
    this.state.model.draw({
      moduleParameters,
      uniforms: Object.assign({}, uniforms, {
        widthScale: 1.0
      }),
      parameters: {
        depthTest: false,
        blendEquation: GL.MAX
      }
    });
  }

  calculateZLevels(attribute) {
    const {data, getZLevel} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      let zLevel = getZLevel(data[index], index);
      zLevel = isNaN(zLevel) ? 0 : zLevel;
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        value[i++] = zLevel;
        value[i++] = zLevel;
        value[i++] = zLevel;
        value[i++] = zLevel;
      }
    });
  }
}

SegmentLayer.layerName = 'SegmentLayer';
SegmentLayer.defaultProps = defaultProps;
