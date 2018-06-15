import originalProject from '@deck.gl/core/shaderlib/project/project';
import originalProject32 from '@deck.gl/core/shaderlib/project32/project32';

import {registerShaderModules, setDefaultShaderModules} from 'luma.gl';
import Viewport from '../viewports';

const project = {
  ...originalProject,
  vs: injectProjectShader(originalProject.vs)
};

const project32 = {
  ...originalProject32,
  dependencies: [project]
};

registerShaderModules([project, project32], {ignoreMultipleRegistrations: true});
setDefaultShaderModules([project]);

/* Viewport Overrides */

function injectProjectShader(source) {
  return source.replace(
    'vec4 project_position(vec4 position) {',
    `vec2 project_custom_(vec2 lnglat) {
  float x = radians(lnglat.x);
  float y = radians(lnglat.y);
  ${Viewport.glsl}
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
  }`
  );
}
