// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME wind-layer-fragment-shader

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;
varying float vAltitude;

void main(void) {
  if (vColor.a == 0.) {
    discard;
  }
  // TODO: this is not needed since we should remove vAltitude,
  // but commenting this out renders wind outside of us too. (check boundingBox prop.)
  // if (vAltitude < -90.) {
  //   discard;
  // }
  float lightWeight = getLightWeight(vPosition.xyz, vNormal.xzy);
  gl_FragColor = vec4(vColor.xyz * lightWeight, 1);
}
`;
