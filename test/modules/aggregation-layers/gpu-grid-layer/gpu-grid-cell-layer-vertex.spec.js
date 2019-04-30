import test from 'tape-catch';
// import VS from '@deck.gl/experimental-layers/gpu-grid-layer/gpu-grid-cell-layer-vertex.glsl';
import {gl} from '@deck.gl/test-utils';
import {Transform, Buffer} from '@luma.gl/core';
import {experimental} from '@deck.gl/core';
const {getQuantizeScale} = experimental;

test('gpu-grid-cell-layer-vertex#quantizeScale', t => {
  if (!Transform.isSupported(gl)) {
    t.comment('Transform not supported skipping the test');
    t.end();
    return;
  }

  const vs = `\
#define RANGE_COUNT 6
#define ROUNDING_ERROR 0.00001
attribute float inValue;
uniform vec2 domain;
varying vec4 outColor;
uniform vec4 colorRange[RANGE_COUNT];
vec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {
  vec4 outColor = vec4(-1., 0., 0., 0.);
  if (value >= (domain.x - ROUNDING_ERROR) && value <= (domain.y + ROUNDING_ERROR)) {
    float domainRange = domain.y - domain.x;
    if (domainRange <= 0.) {
      outColor = colorRange[0];
    } else {
      float rangeCount = float(RANGE_COUNT);
      float rangeStep = domainRange / rangeCount;
      float idx = floor(((value - domain.x) / rangeStep) + ROUNDING_ERROR);
      idx = clamp(idx, 0., rangeCount - 1.);
      int intIdx = int(idx);
      outColor = colorRange[intIdx];
    }
  }
  // outColor = outColor / 255.;
  return outColor;
}

void main(void) {
  outColor = quantizeScale(domain, colorRange, inValue);
}
`;

  //    const inject = {
  //     'vs:#decl': `
  // attribute vec3 inValue;
  // uniform vec2 domain;
  // varying vec4 outColor;
  // `,
  //     'vs:#main-start': '  if (true) { outColor = quantizeScale(domain, colorRange, inValue); } else {\n',
  //     'vs:#main-end': '  }\n'
  //   };
  // const values = [0.001, 10.5, 15.0021, 24.9981];
  /*
  GPU colorValues: 2,2,2,2,2,2,20.999998092651367,2,20,2,2,2,2,2,4,2,2,2,2
  gpu-grid-layer.js:173 GPU colorDomain: 2 20.999998092651367
  */
  const values = [2, 2, 2, 2, 2, 2, 20.999998092651367, 2, 20, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2];
  const valueBuffer = new Buffer(gl, new Float32Array(values));
  const outBuffer = new Buffer(gl, values.length * 4 * 4);
  const domain = [2, 20.999998092651367];
  const colorRange = [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [3, 3, 3, 3],
    [4, 4, 4, 4],
    [5, 5, 5, 5]
  ];
  const cpuFunc = getQuantizeScale(domain, colorRange);
  const expected = [];
  values.forEach(v => {
    cpuFunc(v).forEach(vv => expected.push(vv));
  });
  const colorRangeUniform = [];
  colorRange.forEach(color => {
    const c = color.map(v => v);
    colorRangeUniform.push(c[0], c[1], c[2], c[3]);
  });
  const transform = new Transform(gl, {
    sourceBuffers: {
      inValue: valueBuffer
    },
    vs,
    // inject,
    feedbackBuffers: {
      outColor: outBuffer
    },
    varyings: ['outColor'],
    elementCount: values.length
  });
  transform.run({uniforms: {colorRange: colorRangeUniform, domain}});
  const result = transform.getData({varyingName: 'outColor'});
  t.deepEqual(result, expected, 'quantizeScale: should return correct value');
  t.end();
});
