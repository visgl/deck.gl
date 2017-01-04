uniform vec3 uAmbientColor;

uniform float uPointLightAmbientCoefficient;
uniform vec3 uPointLightLocation;
uniform vec3 uPointLightColor;
uniform float uPointLightAttenuation;

uniform vec3 uMaterialSpecularColor;
uniform float uMaterialShininess;

vec3 applyLighting(vec3 position_modelspace, vec3 normal_modelspace, vec3 color) {
  // vec3 eyeDirection = vec3(-position_modelspace);

  vec3 pointLightLocation_modelspace = vec3(preproject(uPointLightLocation));
  vec3 lightDirection = normalize(pointLightLocation_modelspace - position_modelspace);

  // vec3 reflectionDirection = reflect(-lightDirection, normal_modelspace);

  vec3 ambient = uPointLightAmbientCoefficient * color / 255.0 * uAmbientColor / 255.0;

  // float specularCoefficient = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
  // vec3 specular = specularCoefficient * uMaterialSpecularColor / 255.0;

  float diffuseCoefficient = max(dot(normal_modelspace, lightDirection), 0.0);
  vec3 diffuse = diffuseCoefficient * uPointLightColor / 255. * color / 255.;

  return ambient + uPointLightAttenuation * diffuse;

  // return specular * 0.1;
  // vec3 gamma = vec3(1.0/2.2);
  // return vec3(pow(ambient + specular + diffuse, gamma));
}
