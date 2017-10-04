// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {COORDINATE_SYSTEM, Layer, experimental} from '../../core';
const {fp64ify, enable64bitSupport} = experimental;
import {GL, Model, Geometry, Texture2D, loadTextures} from 'luma.gl';

import vs from './icon-layer-vertex.glsl';
import vs64 from './icon-layer-vertex-64.glsl';
import fs from './icon-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];
const DEFAULT_TEXTURE_MIN_FILTER = GL.LINEAR_MIPMAP_LINEAR;
const DEFAULT_TEXTURE_MAG_FILTER = GL.LINEAR; // GL.LINEAR is default, but explicitly set it here

const defaultProps = {
  iconAtlas: null,
  iconMapping: {},
  sizeScale: 1,
  fp64: false,

  getPosition: x => x.position,
  getIcon: x => x.icon,
  getColor: x => x.color || DEFAULT_COLOR,
  getSize: x => x.size || 1,
  getAngle: x => x.angle || 0
};

export default class IconLayer extends Layer {
  getShaders() {
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64', 'picking']} :
      {vs, fs, modules: ['picking']};  // 'project' module added by default.
  }

  initializeState() {
    const {attributeManager} = this.state;
    const {gl} = this.context;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: 'getPosition', update: this.calculateInstancePositions},
      instanceSizes: {size: 1, accessor: 'getSize', update: this.calculateInstanceSizes},
      instanceOffsets: {size: 2, accessor: 'getIcon', update: this.calculateInstanceOffsets},
      instanceIconFrames: {size: 4, accessor: 'getIcon', update: this.calculateInstanceIconFrames},
      instanceColorModes: {size: 1, type: GL.UNSIGNED_BYTE, accessor: 'getIcon', update: this.calculateInstanceColorMode},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors},
      instanceAngles: {size: 1, accessor: 'getAngle', update: this.calculateInstanceAngles}
    });
    /* eslint-enable max-len */

    this.setState({model: this._getModel(gl)});
  }

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.invalidateAll();

      if (props.fp64 && props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        attributeManager.addInstanced({
          instancePositions64xyLow: {
            size: 2,
            accessor: 'getPosition',
            update: this.calculateInstancePositions64xyLow
          }
        });
      } else {
        attributeManager.remove([
          'instancePositions64xyLow'
        ]);
      }

    }
  }

  updateState({oldProps, props, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});

    if (changeFlags.propsChanged) {
      const {sizeScale} = this.props;
      this.state.model.setUniforms({
        sizeScale
      });
    }

    const {iconAtlas, iconMapping} = props;

    if (oldProps.iconMapping !== iconMapping) {
      const {attributeManager} = this.state;
      attributeManager.invalidate('instanceOffsets');
      attributeManager.invalidate('instanceIconFrames');
      attributeManager.invalidate('instanceColorModes');
    }

    if (oldProps.iconAtlas !== iconAtlas) {

      const setIconsTexture = texture => {
        texture.setParameters({
          [GL.TEXTURE_MIN_FILTER]: DEFAULT_TEXTURE_MIN_FILTER,
          [GL.TEXTURE_MAG_FILTER]: DEFAULT_TEXTURE_MAG_FILTER
        });
        this.setState({
          iconsTexture: texture
        });
        this.state.model.setUniforms({
          iconsTexture: texture,
          iconsTextureDim: [texture.width, texture.height]
        });
      };

      if (iconAtlas instanceof Texture2D) {
        setIconsTexture(iconAtlas);
      } else if (typeof iconAtlas === 'string') {
        loadTextures(this.context.gl, {
          urls: [iconAtlas]
        })
        .then(([texture]) => {
          setIconsTexture(texture);
        });
      }
    }
  }

  draw(opts) {
    if (this.state.iconsTexture) {
      this.state.model.draw(opts);
    }
  }

  _getModel(gl) {
    const positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const position = getPosition(object);
      value[i++] = position[0];
      value[i++] = position[1];
      value[i++] = position[2] || 0;
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64ify(position[0])[1];
      value[i++] = fp64ify(position[1])[1];
    }
  }

  calculateInstanceSizes(attribute) {
    const {data, getSize} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getSize(object);
    }
  }

  calculateInstanceAngles(attribute) {
    const {data, getAngle} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getAngle(object);
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getColor(object);

      value[i++] = color[0];
      value[i++] = color[1];
      value[i++] = color[2];
      value[i++] = isNaN(color[3]) ? 255 : color[3];
    }
  }

  calculateInstanceOffsets(attribute) {
    const {data, iconMapping, getIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const icon = getIcon(object);
      const rect = iconMapping[icon] || {};
      value[i++] = (rect.width / 2 - rect.anchorX) || 0;
      value[i++] = (rect.height / 2 - rect.anchorY) || 0;
    }
  }

  calculateInstanceColorMode(attribute) {
    const {data, iconMapping, getIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const icon = getIcon(object);
      const colorMode = iconMapping[icon] && iconMapping[icon].mask;
      value[i++] = colorMode ? 1 : 0;
    }
  }

  calculateInstanceIconFrames(attribute) {
    const {data, iconMapping, getIcon} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const icon = getIcon(object);
      const rect = iconMapping[icon] || {};
      value[i++] = rect.x || 0;
      value[i++] = rect.y || 0;
      value[i++] = rect.width || 0;
      value[i++] = rect.height || 0;
    }
  }
}

IconLayer.layerName = 'IconLayer';
IconLayer.defaultProps = defaultProps;
