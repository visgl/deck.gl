// get lighitng from position normals and lighting config

vec3 getLightWeight(
  mat4 viewMatrix,
  mat4 worldMatrix,
  mat4 worldInverseTransposeMatrix,
  vec3 positions,
  vec3 normals,
  float selected,

  vec3 ambientColor,
  vec3 pointLocation,
  vec3 pointColor,
  vec3 pointSpecularColor,
  float pointLightAmbientCoefficient,
  float shininess
) {
  vec4 vPosition = worldMatrix * vec4(positions, 1.0);
  vec4 vTransformedNormal = worldInverseTransposeMatrix * vec4(normals, 1);
  vec3 normal = vTransformedNormal.xyz;
  vec3 eyeDirection = normalize(-vPosition.xyz);

  vec3 transformedPointLocation = (viewMatrix * vec4(pointLocation, 1.0)).xyz;
  vec3 lightDirection = normalize(transformedPointLocation - vPosition.xyz);
  vec3 reflectionDirection = reflect(-lightDirection, normal);

  float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), clamp(shininess, 1., 32.));
  vec3 specularLight = specularLightWeighting * pointSpecularColor;

  float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
  vec3 diffuseLight = diffuseLightWeighting * pointColor;


  float factor = mix(0., 1., selected);
  return (ambientColor * pointLightAmbientCoefficient + factor) + diffuseLight + specularLight;
}
