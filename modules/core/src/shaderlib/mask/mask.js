import {Vector3, Matrix4} from '@math.gl/core';
import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../../lib/constants';
import project from '../project/project';

const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

const vs = `
uniform mat4 mask_projectionMatrix;
uniform vec4 mask_projectCenter;
uniform bool mask_maskByInstance;
vec2 mask_clipspace_to_texCoords(vec4 position) {
 return (position.xy / position.w + vec2(1.0)) / 2.0;
}
`;

const fs = `
uniform sampler2D mask_texture;
uniform bool mask_enabled;
bool mask_isInBounds(vec2 texCoords) {
  if (!mask_enabled) {
    return true;
  }
  vec4 maskColor = texture2D(mask_texture, texCoords);
  return maskColor.g > 0.5;
}
`;

const inject = {
  'vs:#decl': `
varying vec2 mask_texCoords;
`,
  'vs:DECKGL_FILTER_GL_POSITION': `
   vec4 mask_common_position;
   if (mask_maskByInstance) {
     mask_common_position = project_position(vec4(geometry.worldPosition, 1.0));
   } else {
     mask_common_position = geometry.position;
   }
   vec4 mask_position = project_common_position_to_clipspace(
     mask_common_position,
     mask_projectionMatrix,
     mask_projectCenter
   );
   mask_texCoords = mask_clipspace_to_texCoords(mask_position);
`,
  'fs:#decl': `
varying vec2 mask_texCoords;
`,
  'fs:DECKGL_FILTER_COLOR': `
  if (mask_enabled) {
    bool mask = mask_isInBounds(mask_texCoords);

    // Debug: show extent of render target
    // if (!mask) color.a = 0.1;
    // if (mask_texCoords.x < 0.001 || mask_texCoords.x > 0.999 ||
    //     mask_texCoords.y < 0.001 || mask_texCoords.y > 0.999) {
    //   color = vec4(0.0, 0.0, 0.0, 0.5);
    // }
    // color = vec4(mask_texCoords.xy, 0.0, 1.0);

    if (!mask) discard;
  }
`
};

/*
 * Splits the projection matrix into a centered matrix and a center offset.
 * This ensures the correct transformation is used when the `WEB_MERCATOR_AUTO_OFFSET`
 * projection mode is used at higher zoom levels
 */
function splitMaskProjectionMatrix(
  projectionMatrix,
  viewport,
  {project_uCenter, project_uCoordinateSystem, project_uProjectionMode}
) {
  // Obtain center relative to which coordinates will be drawn (in common space)
  const center = project_uCenter;
  const projectionMatrixCentered = projectionMatrix.clone().translate(new Vector3(center).negate());

  let maskProjectionMatrix = projectionMatrix;
  let maskProjectCenter = new Matrix4(viewport.viewProjectionMatrix).invert().transform(center);

  if (
    project_uCoordinateSystem === COORDINATE_SYSTEM.LNGLAT &&
    project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR
  ) {
    maskProjectionMatrix = projectionMatrixCentered;
  }

  if (project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET) {
    maskProjectionMatrix = maskProjectionMatrix.clone().multiplyRight(VECTOR_TO_POINT_MATRIX);
    maskProjectCenter = projectionMatrixCentered.transform(maskProjectCenter);

    const t = new Matrix4();
    t.translate(center);
    maskProjectionMatrix.multiplyRight(t);
  }

  return {maskProjectionMatrix, maskProjectCenter};
}

const getMaskUniforms = (opts = {}, context = {}) => {
  const uniforms = {};
  if (opts.maskEnabled && opts.maskProjectionMatrix) {
    uniforms.mask_enabled = true;
    uniforms.mask_maskByInstance = opts.maskByInstance;
    uniforms.mask_texture = opts.maskMap;

    const {maskProjectionMatrix, maskProjectCenter} = splitMaskProjectionMatrix(
      opts.maskProjectionMatrix,
      opts.viewport,
      context
    );
    uniforms.mask_projectCenter = maskProjectCenter;
    uniforms.mask_projectionMatrix = maskProjectionMatrix;
  } else if (opts.drawToMaskMap || opts.pickingActive || opts.maskId) {
    uniforms.mask_enabled = false;
    uniforms.mask_texture = opts.dummyMaskMap;
  }
  return uniforms;
};

export default {
  name: 'mask',
  dependencies: [project],
  vs,
  fs,
  inject,
  getUniforms: getMaskUniforms
};
