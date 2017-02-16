#define SHADER_NAME extruded-hexagon-layer-vs

attribute vec3 positions;
attribute vec3 normals;

attribute vec3 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Custom uniforms
uniform float opacity;
uniform float radius;
uniform float angle;
uniform float extruded;
uniform float radiusScale;

// light uniforms
#define NUM_OF_LIGHTS 2
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix; // inverse transpose of modelViewMatrix
uniform vec3 cameraPos;
uniform vec3 lightsPosition[16];
uniform vec2 lightsStrength[16];
uniform float ambientRatio;
uniform float diffuseRatio;
uniform float specularRatio;

// Result
varying vec4 vColor;

// A magic number to scale elevation so that 1 unit approximate to 100 meter
#define ELEVATION_SCALE 80.

// Without specular lighting
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

void main(void) {

  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec2 rPos = rotationMatrix * positions.xz;
  vec2 rNorm = rotationMatrix * normals.xz;

  vec3 rotatedPositions = vec3(rPos.x, positions.y, rPos.y);
  vec3 rotatedNormals = vec3(rNorm.x, normals.y, rNorm.y);

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -0.5 to 0.5, transform it to between 0, 1
  float elevation =  mix(0., project_scale(instancePositions.z  * (positions.y + 0.5) * ELEVATION_SCALE), extruded);

  float dotRadius = radius * clamp(radiusScale, 0.0, 1.0);
  // project center of hexagon
  vec4 centroidPosition = vec4(project_position(instancePositions.xy), elevation, 0.0);

  vec4 position_worldspace = centroidPosition + vec4(vec2(rotatedPositions.xz * dotRadius), 0., 1.);

  gl_Position = project_to_clipspace(position_worldspace);

  // render display
  if (renderPickingBuffer < 0.5) {
    // check whether hexagon is currently picked
    float selected = isPicked(instancePickingColors, selectedPickingColor);

    // Light calculations
    // Worldspace is the linear space after Mercator projection

    vec3 normals_worldspace = rotatedNormals;
    float lightWeighting = getLightWeight(
      position_worldspace,
      normals_worldspace
    );

    vec3 lightWeightedColor = mix(1.0, lightWeighting, extruded) * (instanceColors.rgb / 255.0);

    // Color: Either opacity-multiplied instance color, or picking color
    vec4 color = vec4(lightWeightedColor, opacity * instanceColors.a / 255.);

    vColor = color;

  } else {

    vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
    vColor = pickingColor;

  }
}
