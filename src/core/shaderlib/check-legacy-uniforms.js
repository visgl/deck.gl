import log from '../utils/log';

const legacyUniforms = [
  // Removed custom picking uinforms
  {old: 'vec3 selectedPickingColor', new: 'luma.gl\'s picking module'},
  {old: 'vec3 renderPickingBuffer', new: 'luma.gl\'s picking module'},
  {old: 'vec3 pickingEnabled', new: 'luma.gl\'s picking module'},

  // Removed project uniforms
  {old: 'float projectionMode', new: 'project_uCoordinateSystem'},
  {old: 'vec4 projectionCenter', new: 'project_uCenter'},
  {old: 'vec2 projectionOrigin'},
  {old: 'mat4 modelMatrix', new: 'project_uModelMatrix'},
  {old: 'mat4 viewMatrix'},
  {old: 'mat4 projectionMatrix', new: 'project_uViewProjectionMatrix'},
  {old: 'vec3 projectionPixelsPerUnit', new: 'project_uPixelsPerUnit'},
  {old: 'float projectionScale', new: 'project_uScale'},
  {old: 'vec2 viewportSize', new: 'project_uViewportSize'},
  {old: 'float devicePixelRatio', new: 'project_uDevicePixelRatio'},
  {old: 'vec3 cameraPos', new: 'project_uCameraPosition'},

  // Removed project64 uniforms
  {old: 'vec2 projectionFP64[16]', new: 'project_uViewProjectionMatrixFP64'},
  {old: 'vec2 projectionScaleFP64', new: 'project64_uScale'}
].map(def => {
  def.regex = new RegExp(`^\s*uniform ${def.old};`, 'm');
  return def;
});

export default shaderSource => {
  legacyUniforms
    .filter(def => def.regex.test(shaderSource))
    .forEach(def => {
      if (def.deprecated) {
        log.deprecated(def.old, def.new);
      } else {
        log.removed(def.old, def.new);
      }
    });
};
