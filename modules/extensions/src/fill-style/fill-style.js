import {LayerExtension} from '@deck.gl/core';
import {Texture2D} from '@luma.gl/core';
import GL from '@luma.gl/constants';

import {patternShaders} from './shaders.glsl';

const defaultProps = {
  fillPatternEnabled: true,
  fillPatternAtlas: null,
  fillPatternMapping: null,
  fillPatternMask: true,
  getFillPattern: {type: 'accessor', value: d => d.pattern},
  getFillPatternScale: {type: 'accessor', value: 1},
  getFillPatternOffset: {type: 'accessor', value: [0, 0]}
};

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
  // GL.LINEAR is the default value but explicitly set it here
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  // for texture boundary artifact
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

export default class FillStyleExtension extends LayerExtension {
  constructor({pattern = false} = {}) {
    super({pattern});
  }

  isEnabled(layer) {
    return layer.getAttributeManager() && !layer.state.pathTesselator;
  }

  getShaders(extension) {
    if (!extension.isEnabled(this)) {
      return null;
    }

    return {
      modules: [extension.opts.pattern && patternShaders].filter(Boolean)
    };
  }

  initializeState(context, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const attributeManager = this.getAttributeManager();

    if (extension.opts.pattern) {
      attributeManager.add({
        fillPatternFrames: {
          size: 4,
          accessor: 'getFillPattern',
          transform: extension.getPatternFrame.bind(this),
          shaderAttributes: {
            fillPatternFrames: {
              divisor: 0
            },
            instanceFillPatternFrames: {
              divisor: 1
            }
          }
        },
        fillPatternScales: {
          size: 1,
          accessor: 'getFillPatternScale',
          defaultValue: 1,
          shaderAttributes: {
            fillPatternScales: {
              divisor: 0
            },
            instanceFillPatternScales: {
              divisor: 1
            }
          }
        },
        fillPatternOffsets: {
          size: 2,
          accessor: 'getFillPatternOffset',
          shaderAttributes: {
            fillPatternOffsets: {
              divisor: 0
            },
            instanceFillPatternOffsets: {
              divisor: 1
            }
          }
        }
      });
    }
    this.setState({
      emptyTexture: new Texture2D(this.context.gl, {
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }

  updateState({props, oldProps}, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }

    if (props.fillPatternAtlas && props.fillPatternAtlas !== oldProps.fillPatternAtlas) {
      extension.loadPatternAtlas.call(this, props);
    }
    if (props.fillPatternMapping && props.fillPatternMapping !== oldProps.fillPatternMapping) {
      extension.loadPatternMapping.call(this, props);
    }
  }

  draw(params, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const {patternTexture} = this.state;
    this.setModuleParameters({
      fillPatternTexture: patternTexture || this.state.emptyTexture
    });
  }

  finalizeState() {
    const {patternTexture, emptyTexture} = this.state;
    if (patternTexture) {
      patternTexture.delete();
    }
    if (emptyTexture) {
      emptyTexture.delete();
    }
  }

  async loadPatternAtlas({fillPatternAtlas, fetch}) {
    if (this.state.patternTexture) {
      this.state.patternTexture.delete();
    }
    this.setState({patternTexture: null});
    let image = fillPatternAtlas;
    if (typeof image === 'string') {
      image = await fetch(image, {propName: 'fillPatternAtlas', layer: this});
    }
    const patternTexture =
      image instanceof Texture2D
        ? image
        : new Texture2D(this.context.gl, {
            data: image,
            parameters: DEFAULT_TEXTURE_PARAMETERS
          });
    this.setState({patternTexture});
  }

  async loadPatternMapping({fillPatternMapping, fetch}) {
    this.setState({patternMapping: null});
    let patternMapping = fillPatternMapping;
    if (typeof patternMapping === 'string') {
      patternMapping = await fetch(patternMapping, {
        propName: 'fillPatternMapping',
        layer: this
      });
    }
    this.setState({patternMapping});
    this.getAttributeManager().invalidate('getFillPattern');
    this.setNeedsUpdate();
  }

  getPatternFrame(name) {
    const {patternMapping} = this.state;
    const def = patternMapping && patternMapping[name];
    return def ? [def.x, def.y, def.width, def.height] : [0, 0, 0, 0];
  }
}

FillStyleExtension.extensionName = 'FillStyleExtension';
FillStyleExtension.defaultProps = defaultProps;
