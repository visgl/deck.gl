// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BrushingExtension} from '@deck.gl/extensions';

const spotlight = {
  name: 'taxiSpotlight',
  fs: `\
layout(std140) uniform taxiSpotlightUniforms {
  vec4 pointer;
  float enabled;
} taxiSpotlight;
`,
  uniformTypes: {pointer: 'vec4<f32>', enabled: 'f32'}
};

const spotlightPlugin = {
  name: 'taxiSpotlight',
  module: spotlight,
  injections: {
    'glsl:fs:DECKGL_FILTER_COLOR': `
      if (taxiSpotlight.enabled > 0.0) {
        vec2 offset = (gl_FragCoord.xy - taxiSpotlight.pointer.xy) / taxiSpotlight.pointer.zw;
        float light = 1.0 - smoothstep(18.0, 175.0, length(offset));
        color.rgb = mix(color.rgb, vec3(1.0), light * 0.35);
        color.a *= 1.0 + light * 1.5;
      }
    `
  }
};

// Keep the brushing extension's pointer redraw handling and use a feathered screen-space glow.
export default class TaxiSpotlightExtension extends BrushingExtension {
  static extensionName = 'TaxiSpotlightExtension';

  getShaders() {
    return {plugins: [spotlightPlugin]};
  }

  draw({context: {device, mousePosition, viewport}}) {
    if (!this.props.brushingEnabled || !mousePosition || !viewport.containsPixel(mousePosition)) {
      this.setShaderModuleProps({taxiSpotlight: {enabled: 0}});
      return;
    }

    const canvasContext = device.getDefaultCanvasContext();
    const [width, height] = canvasContext.getCSSSize();
    const [bufferWidth, bufferHeight] = canvasContext.getDrawingBufferSize();
    const scaleX = bufferWidth / width;
    const scaleY = bufferHeight / height;
    this.setShaderModuleProps({
      taxiSpotlight: {
        pointer: [
          mousePosition.x * scaleX,
          bufferHeight - mousePosition.y * scaleY,
          scaleX,
          scaleY
        ],
        enabled: 1
      }
    });
  }
}
