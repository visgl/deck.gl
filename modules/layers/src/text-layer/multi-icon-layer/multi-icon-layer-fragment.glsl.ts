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
#ifdef MODULE_COLLISION
  if (collision.visibilityPass) {
    // Run other extensions' fragment tests, so parts of the label that ClipExtension discards are
    // not tested. The color itself is not used. The greedy placement pass skips them, so a clipped
    // label still writes all of its placement data.
    if (!collision.placementPass) {
      geometry.uv = uv;
      vec4 filteredColor = vec4(1.0);
      DECKGL_FILTER_COLOR(filteredColor, geometry);
    }
    fragColor = collision_getBoundsData();
    return;
  }
#endif
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
