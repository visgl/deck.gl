import { _MultiIconLayer, TextLayer } from '@deck.gl/layers';

import { AlignToViewportMode, clippingTextUniforms } from './clipping-text-layer-uniforms';

import type { ClippingTextProps } from './clipping-text-layer-uniforms';
import type { Accessor } from '@deck.gl/core';
import type { TextLayerProps } from '@deck.gl/layers';

type _ClippingTextLayerProps<DataT = any> = {
  /** Clip mask for each object, as meter offsets from the anchor position.
   * Characters that render outside of the clipped area are not displayed.
   * Use negative width/height to disable clipping.
   * @default [0, 0, -1, -1]
   */
  getClipRect?: Accessor<DataT, [x: number, y: number, width: number, height: number]>;

  /**
   * When clip rect's pixel size is smaller than the specified value, hide the corresponding text completely.
   * This prop can be used to set the minimum length of clipped texts to improve readability.
   * @default [0, 0]
   */
  clipRectCutoffPixels?: [width: number, height: number];

  /**
   * If the clip rect is partially visible, move the text horizontally into the visible region of the clip rect.
   * @default 'none'
   */
  scrollIntoViewHorizontal?: 'none' | 'start' | 'center' | 'end';

  /**
   * If the clip rect is partially visible, move the text vertically into the visible region of the clip rect.
   * @default 'none'
   */
  scrollIntoViewVertical?: 'none' | 'start' | 'center' | 'end';
};

export type ClippingTextLayerProps<DataT> = TextLayerProps<DataT> & _ClippingTextLayerProps<DataT>;

/** Add clipping support to text layer */
export class ClippingTextLayer<DataT = any, ExtraPropsT extends {} = {}> extends TextLayer<
  DataT,
  ExtraPropsT & _ClippingTextLayerProps<DataT>
> {
  static override componentName = 'ClippingTextLayer';

  protected override getSubLayerClass(subLayerId: string, DefaultLayerClass: any): any {
    if (subLayerId === 'characters') {
      return ClippingMultiIconLayer<DataT>;
    }
    return super.getSubLayerClass(subLayerId, DefaultLayerClass);
  }

  protected override getSubLayerProps(sublayerProps: any): any {
    const props = super.getSubLayerProps(sublayerProps);
    if (this.props.getClipRect) {
      props.getClipRect = this.props.getClipRect;
    }
    if (this.props.clipRectCutoffPixels) {
      props.clipRectCutoffPixels = this.props.clipRectCutoffPixels;
    }
    if (this.props.scrollIntoViewHorizontal) {
      props.scrollIntoViewHorizontal = this.props.scrollIntoViewHorizontal;
    }
    if (this.props.scrollIntoViewVertical) {
      props.scrollIntoViewVertical = this.props.scrollIntoViewVertical;
    }
    return props;
  }
}

class ClippingMultiIconLayer<DataT> extends _MultiIconLayer<
  DataT,
  Required<_ClippingTextLayerProps<DataT>>
> {
  static override defaultProps = {
    getClipRect: [0, 0, -1, -1],
    clipRectCutoffPixels: [0, 0],
    scrollIntoViewHorizontal: 'none',
    scrollIntoViewVertical: 'none',
  } as any;

  static override componentName = 'ClippingMultiIconLayer';

  override getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
in vec4 instanceClipRect;
vec2 anchorPosScreen;

#define ALGIN_MODE_START ${AlignToViewportMode.start}
#define ALGIN_MODE_CENTER ${AlignToViewportMode.center}
#define ALGIN_MODE_END ${AlignToViewportMode.end}

float getPixelOffsetFromAlignment(float anchor, float extent, vec2 clipRange, int mode) {
  if (extent < 0.) return 0.0;
  if (mode == ALGIN_MODE_START) {
    return max(0. - (anchor + clipRange.x), 0.0);
  }
  if (mode == ALGIN_MODE_CENTER) {
    float _min = max(0., anchor + clipRange.x);
    float _max = min(extent, anchor + clipRange.x + clipRange.y);
    return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
  }
  if (mode == ALGIN_MODE_END) {
    return min(extent - (anchor + clipRange.x + clipRange.y), 0.0);
  }
  return 0.0;
}
vec2 getPixelOffsetFromAlignment(vec4 pixelClipRect, ivec2 mode) {
  vec2 vp = project.viewportSize / project.devicePixelRatio;
  return vec2(
    getPixelOffsetFromAlignment(anchorPosScreen.x, vp.x, pixelClipRect.xz, mode.x),
    getPixelOffsetFromAlignment(anchorPosScreen.y, vp.y, pixelClipRect.yw, mode.y)
  );
}
`,
      'vs:DECKGL_FILTER_GL_POSITION': `
anchorPosScreen = (gl_Position.xy / gl_Position.w + 1.0) / 2.0 * project.viewportSize / project.devicePixelRatio;
`,
      'vs:#main-end': `
vec2 xy = project_size(instanceClipRect.xy) * project.scale;
vec2 wh = project_size(instanceClipRect.zw) * project.scale;

if (clippingText.scrollIntoView.x > 0 || clippingText.scrollIntoView.y > 0) {
  vec2 scrollPixels = getPixelOffsetFromAlignment(vec4(xy, wh), clippingText.scrollIntoView);
  pixelOffset += scrollPixels;
  gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels.xy);
}

if (wh.x >= 0.) {
  if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x || wh.x < clippingText.cutoffPixels.x) {
    gl_Position = vec4(0.0);
  }
}
if (wh.y >= 0.) {
  if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y || wh.y < clippingText.cutoffPixels.y) {
    gl_Position = vec4(0.0);
  }
}
`,
    };
    shaders.modules.push(clippingTextUniforms);
    return shaders;
  }

  override initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager!.addInstanced({
      instanceClipRect: {
        size: 4,
        accessor: 'getClipRect',
        defaultValue: [0, 0, -1, -1],
      },
    });
  }

  override draw(opts: any) {
    const { clipRectCutoffPixels, scrollIntoViewHorizontal, scrollIntoViewVertical } = this.props;
    const model = this.state.model!;
    const clippingTextProps: ClippingTextProps = {
      cutoffPixels: clipRectCutoffPixels,
      scrollIntoView: [
        AlignToViewportMode[scrollIntoViewHorizontal],
        AlignToViewportMode[scrollIntoViewVertical],
      ],
    };
    model.shaderInputs.setProps({ clippingText: clippingTextProps });
    super.draw(opts);
  }
}
