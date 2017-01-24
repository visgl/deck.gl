// LIGHTING
uniform bool uLightingEnabled;
uniform vec3 uAmbientColor;
uniform float uPointLightAmbientCoefficient;
uniform vec3 uPointLightLocation;
uniform vec3 uPointLightColor;
uniform float uPointLightAttenuation;

uniform vec3 uMaterialSpecularColor;
uniform float uMaterialShininess;

vec3 lighting_filterColor(vec3 position_modelspace, vec3 normal_modelspace, vec3 color) {
  if (!uLightingEnabled) {
    return color;
  }

  vec3 pointLightLocation_modelspace = vec3(project_position(uPointLightLocation));
  vec3 lightDirection = normalize(pointLightLocation_modelspace - position_modelspace);

  vec3 ambient = uPointLightAmbientCoefficient * color * uAmbientColor / 255.0;

  float diffuseCoefficient = max(dot(normal_modelspace, lightDirection), 0.0);
  vec3 diffuse = diffuseCoefficient * uPointLightColor / 255. * color;

  return ambient + uPointLightAttenuation * diffuse;
}
