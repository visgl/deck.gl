import originalProject from '@deck.gl/core/dist/esm/shaderlib/project/project';
import originalProject32 from '@deck.gl/core/dist/esm/shaderlib/project32/project32';
import originalProject64 from '@deck.gl/core/dist/esm/shaderlib/project64/project64';

import {fp64, registerShaderModules, setDefaultShaderModules} from 'luma.gl';
import {COORDINATE_SYSTEM} from 'deck.gl';
import DefaultView from '../views';

import vec4_transformMat4 from 'gl-vec4/transformMat4';

const ZERO_VECTOR = [0, 0, 0, 0];

const project = {
  ...originalProject,
  vs: injectProjectShader(originalProject.vs),
  getUniforms: opts => {
    if (!opts || !opts.viewport) {
      return {};
    }

    return {
      ...originalProject.getUniforms(opts),
      project_uCenter: getProjectionCenter(opts)
    };
  }
};

const project32 = {
  ...originalProject32,
  dependencies: [project]
};

const project64 = {
  ...originalProject64,
  dependencies: [project, fp64]
};

registerShaderModules([project, project32, project64], {ignoreMultipleRegistrations: true});
setDefaultShaderModules([project]);

/* Viewport Overrides */

function injectProjectShader(source) {
  return source.replace('vec4 project_position(vec4 position) {', `vec2 project_custom_(vec2 lnglat) {
  float x = radians(lnglat.x);
  float y = radians(lnglat.y);
  ${DefaultView.vs}
}
vec4 project_position(vec4 position) {
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNG_LAT) {
    vec2 p = project_custom_(position.xy);
    p.x = p.x + PI;
    p.y = PI - p.y;
    return project_uModelMatrix * vec4(
      p * WORLD_SCALE * project_uScale,
      project_scale(position.z),
      position.w
    );
  }`);
}

function getProjectionCenter({coordinateSystem, coordinateOrigin, viewport}) {
  switch (coordinateSystem) {
  case COORDINATE_SYSTEM.METER_OFFSETS:
  case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
    const positionPixels = viewport.projectFlat(coordinateOrigin);

    return vec4_transformMat4(
      [],
      [positionPixels[0], positionPixels[1], 0.0, 1.0],
      viewport.viewProjectionMatrix
    );

  default:
    return ZERO_VECTOR;
  }
}
