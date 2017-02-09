// Copyright (c) 2015 Uber Technologies, Inc.
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
import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Geometry, Texture2D, loadTextures} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 0, 255];

/*
 * @param {object} props
 * @param {Texture2D | string} props.iconAtlas - atlas image url or texture
 * @param {object} props.iconMapping - icon names mapped to icon definitions
 * @param {object} props.iconMapping[icon_name].x - x position of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].y - y position of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].width - width of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].height - height of icon on the atlas image
 * @param {object} props.iconMapping[icon_name].anchorX - x anchor of icon on the atlas image,
 *   default to width / 2
 * @param {object} props.iconMapping[icon_name].anchorY - y anchor of icon on the atlas image,
 *   default to height / 2
 * @param {object} props.iconMapping[icon_name].mask - whether icon is treated as a transparency
 *   mask. If true, user defined color is applied. If false, original color from the image is
 *   applied. Default to false.
 * @param {number} props.size - icon size in pixels
 * @param {func} props.getPosition - returns anchor position of the icon, in [lng, lat, z]
 * @param {func} props.getIcon - returns icon name as a string
 * @param {func} props.getSize - returns icon size multiplier as a number
 * @param {func} props.getColor - returns color of the icon in [r, g, b, a]. Only works on icons
 *   with mask: true.
 */
const defaultProps = {
  getPosition: x => x.position,
  getIcon: x => x.icon,
  getColor: x => x.color || DEFAULT_COLOR,
  getSize: x => x.size || 1,
  iconAtlas: null,
  iconMapping: {},
  sizeScale: 1
};

export default class IconLayer extends Layer {
  initializeState() {
    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, accessor: 'getPosition', update: this.calculateInstancePositions},
      instanceSizes: {size: 1, accessor: 'getSize', update: this.calculateInstanceSizes},
      instanceOffsets: {size: 2, accessor: 'getIcon', update: this.calculateInstanceOffsets},
      instanceIconFrames: {size: 4, accessor: 'getIcon', update: this.calculateInstanceIconFrames},
      instanceColorModes: {size: 1, type: GL.UNSIGNED_BYTE, accessor: 'getIcon', update: this.calculateInstanceColorMode},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors}
    });
    /* eslint-enable max-len */

    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});
  }

  updateState({oldProps, props, changeFlags}) {
    const {iconAtlas} = props;

    if (oldProps.iconAtlas !== iconAtlas) {
      const icons = {};
      this.state.icons = icons;

      if (iconAtlas instanceof Texture2D) {
        icons.texture = iconAtlas;
      } else if (typeof iconAtlas === 'string') {
        loadTextures(this.context.gl, {
          urls: [iconAtlas]
        })
        .then(([texture]) => {
          icons.texture = texture;
        });
      }
    }
  }

  draw({uniforms}) {
    const {viewport: {width, height}, gl} = this.context;
    const {sizeScale} = this.props;
    const iconsTexture = this.state.icons && this.state.icons.texture;

    if (iconsTexture) {
      // transparency doesn't work with DEPTH_TEST on
      // tradeoff being we cannot guarantee that foreground icons will be rendered on top
      gl.disable(gl.DEPTH_TEST);

      this.state.model.render(Object.assign({}, uniforms, {
        iconsTexture,
        iconsTextureDim: [iconsTexture.width, iconsTexture.height],
        sizeScale: [sizeScale / width, -sizeScale / height]
      }));

      gl.enable(gl.DEPTH_TEST);
    }
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './icon-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './icon-layer-fragment.glsl'), 'utf8')
    };
  }

  getModel(gl) {
    const positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        positions: new Float32Array(positions)
      }),
      isInstanced: true
    });
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

  calculateInstanceSizes(attribute) {
    const {data, getSize} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getSize(object);
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
      value[i++] = (1 / 2 - rect.anchorX / rect.width) || 0;
      value[i++] = (1 / 2 - rect.anchorY / rect.height) || 0;
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
