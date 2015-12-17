/* vertex shader for the arc-layer */

#define N 49.0

attribute vec3 vertices;
attribute vec4 positions;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying float ratio;

float paraboloid(float index, float delta, vec2 from, vec2 to) {
  delta /= N;
  vec2 a = mix(from, to, 0.5);
  float b = (from.x - a.x) * (from.x - a.x) + (from.y - a.y) * (from.y - a.y);
  vec2 x = mix(from, to, delta);
  return (-((x.x - a.x) * (x.x - a.x) + (x.y - a.y) * (x.y - a.y)) + b);
}

void main(void) {
  float index = vertices.x;

  // non-timeline, delta === 0.5
  float delta = index;

  // dist between [x0, y0] and [x1, y1]
  float dist = distance(positions.xy, positions.zw);

  vec3 p = vec3(0);
  // linear interpolate [x, y]
  p.xy = mix(positions.xy, positions.zw, delta / N);
  // paraboloid interpolate [x, y]
  p.z = sqrt(paraboloid(index, delta, positions.xy, positions.zw));

  ratio = clamp(dist / 1000., 0., 1.);

  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
