export default `
#define SHADER_NAME mesh-layer-fs

#ifdef GL_ES
precision highp float;
#endif

uniform bool hasTexture;
uniform sampler2D sampler;
uniform vec4 color;

varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

void main(void) {
  // TODO - restore color rendering

  gl_FragColor = vColor / 255.;

  // hasTexture ? texture2D(sampler, vTexCoord) : color / 255.;
  // color = vec4(color_transform(color.rgb), color.a * opacity);

  // gl_FragColor = gl_FragColor * vLightWeight;

  // use highlight color if this fragment belongs to the selected object.
  // gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  // gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
