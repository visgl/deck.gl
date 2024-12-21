// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader

precision highp float;

uniform sampler2D iconsTexture;

in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  if (!bool(picking.isActive)) {
    float alpha = texture(iconsTexture, vTextureCoords).a;
    vec4 color = vColor;

    // if enable sdf (signed distance fields)
    if (sdf.enabled) {
      float distance = alpha;
      alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);

      if (sdf.outlineBuffer > 0.0) {
        float inFill = alpha;
        float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
        color = mix(sdf.outlineColor, vColor, inFill);
        alpha = inBorder;
      }
    }

    // Take the global opacity and the alpha from color into account for the alpha component
    float a = alpha * color.a;
    
    if (a < icon.alphaCutoff) {
      discard;
    }

    fragColor = vec4(color.rgb, a * layer.opacity);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
