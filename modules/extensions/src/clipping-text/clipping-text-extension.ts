// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';

import {clippingTextUniforms, AlignToViewportModes} from './clipping-text-layer-uniforms';

import type {ClippingTextProps} from './clipping-text-layer-uniforms';
import type {Accessor, Layer, LayerContext, OrthographicViewport} from '@deck.gl/core';

const defaultProps = {
  getClipRect: {type: 'accessor', value: [0, 0, -1, -1]},
  clipRectCutoffPixels: [0, 0],
  clipRectAlignHorizontal: 'none',
  clipRectAlignVertical: 'none'
};

type AlignToViewportMode = keyof typeof AlignToViewportModes;

export type ClippingTextExtensionProps<DataT = any> = {
  /** Clip mask for each object, as meter offsets from the anchor position.
   * Characters that render outside of the clipped area are not displayed.
   * Use negative width/height to disable clipping.
   * @default [0, 0, -1, -1]
   */
  getClipRect?: Accessor<DataT, [x: number, y: number, width: number, height: number]>;

  /**
   * When clip rect's visible size is smaller than the specified value, hide the corresponding text completely.
   * This prop can be used to set the minimum length of clipped texts to improve readability.
   * @default [0, 0]
   */
  clipRectCutoffPixels?: [width: number, height: number];

  /**
   * Align the text horizontally to the visible region of the clip rectangle.
   * @default 'none'
   */
  clipRectAlignHorizontal?: AlignToViewportMode;

  /**
   * Align the text vertically to the visible region of the clip rectangle.
   * @default 'none'
   */
  clipRectAlignVertical?: AlignToViewportMode;
};

/** Adds clipping support to TextLayer's `characters` sublayer (`MultiIconLayer`). */
export default class ClippingTextExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'ClippingTextExtension';

  isEnabled(layer: Layer<ClippingTextExtensionProps>): boolean {
    return (
      // MultiIconLayer own prop name, assigned by TextLayer
      (layer.id.endsWith('characters') && (layer.props as any).getIconOffsets) ||
      // TextBackgroundLayer own prop name, assigned by TextLayer
      (layer.id.endsWith('background') && (layer.props as any).getBoundingRect)
    );
  }

  getShaders(this: Layer<ClippingTextExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }

    if (this.id.endsWith('background')) {
      return {
        modules: [clippingTextUniforms],
        inject: {
          'vs:#decl': `\
in vec4 instanceClipRect;
bool usePixelSize;
`,
          'vs:DECKGL_FILTER_SIZE': `
vec2 xy = project_size(instanceClipRect.xy);
vec2 wh = project_size(instanceClipRect.zw);
if (clippingText.flipY) {
  xy.y -= wh.y;
}
size = vec3(xy + geometry.uv * wh, 0.0);
if (usePixelSize) {
  size *= project.scale;
}
`,
          'vs:#main-start': `
usePixelSize = textBackground.billboard;
`
        }
      };
    }

    return {
      modules: [clippingTextUniforms],
      inject: {
        'vs:#decl': `\
in vec4 instanceClipRect;
vec2 anchorPosScreen;

#define ALGIN_MODE_START ${AlignToViewportModes.start}
#define ALGIN_MODE_CENTER ${AlignToViewportModes.center}
#define ALGIN_MODE_END ${AlignToViewportModes.end}

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
    -getPixelOffsetFromAlignment(anchorPosScreen.y, vp.y, vec2(-pixelClipRect.y - pixelClipRect.w, pixelClipRect.w), mode.y)
  );
}
`,
        'vs:DECKGL_FILTER_GL_POSITION': `
anchorPosScreen = vec2(
  gl_Position.x / gl_Position.w + 1.0,
  1.0 - gl_Position.y / gl_Position.w
) / 2.0 * project.viewportSize / project.devicePixelRatio;
`,
        'vs:#main-end': `
vec2 xy = project_size(instanceClipRect.xy) * project.scale;
vec2 wh = project_size(instanceClipRect.zw) * project.scale;
if (clippingText.flipY) {
  xy.y -= wh.y;
}
if (clippingText.align.x > 0 || clippingText.align.y > 0) {
  vec2 scrollPixels = getPixelOffsetFromAlignment(vec4(xy, wh), clippingText.align);
  pixelOffset += scrollPixels;
  gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels.xy);
}

if (instanceClipRect.z >= 0.) {
  if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
    gl_Position = vec4(0.0);
  }
}
if (clippingText.cutoffPixels.x > 0.) {
  float vpWidth = project.viewportSize.x / project.devicePixelRatio;
  float l = max(anchorPosScreen.x + xy.x, 0.0);
  float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
  if (r - l < clippingText.cutoffPixels.x) {
    gl_Position = vec4(0.0);
  }
}
if (instanceClipRect.w >= 0.) {
  if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
    gl_Position = vec4(0.0);
  }
}
if (clippingText.cutoffPixels.y > 0.) {
  float vpHeight = project.viewportSize.y / project.devicePixelRatio;
  float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
  float b = min(anchorPosScreen.y - xy.y, vpHeight);
  if (b - t < clippingText.cutoffPixels.y) {
    gl_Position = vec4(0.0);
  }
}
`
      }
    };
  }

  initializeState(
    this: Layer<ClippingTextExtensionProps>,
    _context: LayerContext,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }
    const attributeManager = this.getAttributeManager();
    attributeManager?.addInstanced({
      instanceClipRect: {
        size: 4,
        accessor: 'getClipRect',
        defaultValue: [0, 0, -1, -1]
      }
    });
  }

  draw(this: Layer<Required<ClippingTextExtensionProps>>, _params: any, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const {clipRectCutoffPixels, clipRectAlignHorizontal, clipRectAlignVertical} = this.props;
    const clippingTextProps: ClippingTextProps = {
      cutoffPixels: clipRectCutoffPixels,
      align: [
        AlignToViewportModes[clipRectAlignHorizontal],
        AlignToViewportModes[clipRectAlignVertical]
      ],
      flipY: Boolean((this.context.viewport as OrthographicViewport).flipY)
    };
    this.setShaderModuleProps({clippingText: clippingTextProps});
  }
}
