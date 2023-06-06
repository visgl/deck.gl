import {BitmapLayer} from '@deck.gl/layers/typed';
import type {GetPickingInfoParams, Texture} from '@deck.gl/core/typed';
import type {Texture2D} from '@luma.gl/webgl';

export class Tensor2DLayer extends BitmapLayer<{
  colorScale: string | Texture | null;
  colorDomain?: [min: number, max: number];
  uv?: number[][] | number[];
}> {
  static layerName = 'Tensor2DLayer';

  static defaultProps: any = {
    image: null,
    colorScale: {type: 'image', async: true},
    uv: {type: 'array', value: [0, 0, 1, 1]},
    colorDomain: {type: 'array', compare: true, optional: true, value: [0, 1]}
  };

  getPickingInfo(params: GetPickingInfoParams) {
    const info = super.getPickingInfo(params);

    // @ts-expect-error bitmap is not defined on PickingInfo
    if (info.bitmap) {
      const {
        pixel: [x, y]
        // @ts-expect-error
      } = info.bitmap;
      const {image} = this.props;
      // @ts-expect-error
      const {width, data} = image as Texture2D;

      if (data) {
        info.object = data[y * width + x];
      }
    }
    return info;
  }

  getShaders() {
    return {
      ...super.getShaders(),
      inject: {
        'fs:#decl': `
            uniform sampler2D colorScale;
            uniform vec2 colorDomain;
        `,
        'fs:DECKGL_FILTER_COLOR': `
            float normalizedValue = (color.a - colorDomain.x) / (colorDomain.y - colorDomain.x);
            vec2 coord = vec2(normalizedValue, 0.5);
            color = texture2D(colorScale, coord);
        `
      }
    };
  }

  _createMesh() {
    const mesh = super._createMesh();
    let {uv} = this.props;

    if (typeof uv === 'number') {
      // Same logic as rectangular `bounds` prop
      uv = [
        [uv[0], uv[1]],
        [uv[0], uv[3]],
        [uv[2], uv[3]],
        [uv[2], uv[1]]
      ];
    }

    mesh.texCoords = new Float32Array(uv.flat());
    return mesh;
  }

  draw(params: any) {
    const {colorScale, colorDomain} = this.props;

    if (!colorScale) return;
    params.uniforms.colorScale = colorScale;
    params.uniforms.colorDomain = colorDomain;

    return super.draw(params);
  }
}
