// lighting

#define NUM_OF_LIGHTS 2
uniform vec3 cameraPos;
uniform vec3 lightsPosition[16];
uniform vec2 lightsStrength[16];
uniform float ambientRatio;
uniform float diffuseRatio;
uniform float specularRatio;

float getLightWeight(vec4 position_worldspace, vec3 normals_worldspace) {
  float lightWeight = 0.0;

  vec3 position_worldspace_vec3 = position_worldspace.xyz / position_worldspace.w;
  vec3 normals_worldspace_vec3 = normals_worldspace.xzy;

  vec3 camera_pos_worldspace = cameraPos;
  vec3 view_direction = normalize(camera_pos_worldspace - position_worldspace_vec3);

  for (int i = 0; i < NUM_OF_LIGHTS; i++) {
    vec3 light_position_worldspace = project_position(lightsPosition[i]);
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace_vec3);

    vec3 halfway_direction = normalize(light_direction + view_direction);
    float lambertian = dot(light_direction, normals_worldspace_vec3);
    float specular = 0.0;
    if (lambertian > 0.0) {
      float specular_angle = max(dot(normals_worldspace_vec3, halfway_direction), 0.0);
      specular = pow(specular_angle, 32.0);
    }
    lambertian = max(lambertian, 0.0);
    lightWeight += (ambientRatio + lambertian * diffuseRatio + specular * specularRatio) * lightsStrength[i].x;

  }

  return lightWeight;
}

