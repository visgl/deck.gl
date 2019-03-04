export default `
#define SHADER_NAME mesh-layer-fs

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform vec4 color;

varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

void main(void) {
  vec4 color = hasTexture ? texture2D(sampler, vTexCoord) : vColor / 255.;
  gl_FragColor = vec4(color.rgb * vLightWeight, color.a);

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
