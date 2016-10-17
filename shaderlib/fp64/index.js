/* eslint-disable quote-props, no-path-concat, prefer-template */
const fs = require('fs');
import fp64source from './math-fp64';

module.exports = {
  'fp64': {
    // TODO - this should not have a source, but be compose from its
    // dependencies (it could be precomposed on registration, if all
    // dependencies are availble, or cached when requested).
    source: fp64source,
    dependencies: [
      'cos-fp64',
      'cos-taylor-fp64',
      'div-fp64',
      'exp-fp64',
      'log-fp64',
      'mat4-vec4-mul-fp64',
      'mul-fp64',
      'nint-fp64',
      'project-fp64',
      'quickTwoSum',
      'radians-fp64',
      'sin-fp64',
      'sin-taylor-fp64',
      'sincos-taylor-fp64',
      'split',
      'sqrt-fp64',
      'sub-fp64',
      'sum-fp64',
      'tan-fp64',
      'twoProd',
      'twoSqr',
      'twoSub',
      'twoSum',
      'vec2-length-fp64',
      'vec2-mix-fp64',
      'vec2-sub-fp64',
      'vec3-distance-fp64',
      'vec3-length-fp64',
      'vec3-sub-fp64',
      'vec3-sum-fp64',
      'vec4-dot-fp64',
      'vec4-fp64',
      'vec4-scalar-mul-fp64',
      'vec4-sum-fp64'
    ]
  },
  'uniforms-fp64': {
    source: fs.readFileSync(__dirname + '/cos-fp64.glsl')
  },
  'cos-fp64': {
    source: fs.readFileSync(__dirname + '/cos-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'cos-taylor-fp64': {
    source: fs.readFileSync(__dirname + '/cos-taylor-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'div-fp64': {
    source: fs.readFileSync(__dirname + '/div-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'exp-fp64': {
    source: fs.readFileSync(__dirname + '/exp-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'log-fp64': {
    source: fs.readFileSync(__dirname + '/log-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'mat4-vec4-mul-fp64': {
    source: fs.readFileSync(__dirname + '/mat4-vec4-mul-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'mul-fp64': {
    source: fs.readFileSync(__dirname + '/mul-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'nint-fp64': {
    source: fs.readFileSync(__dirname + '/nint-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'project-fp64': {
    source: fs.readFileSync(__dirname + '/project-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'quickTwoSum': {
    source: fs.readFileSync(__dirname + '/quickTwoSum.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'radians-fp64': {
    source: fs.readFileSync(__dirname + '/radians-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sin-fp64': {
    source: fs.readFileSync(__dirname + '/sin-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sin-taylor-fp64': {
    source: fs.readFileSync(__dirname + '/sin-taylor-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sincos-taylor-fp64': {
    source: fs.readFileSync(__dirname + '/sincos-taylor-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'split': {
    source: fs.readFileSync(__dirname + '/split.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sqrt-fp64': {
    source: fs.readFileSync(__dirname + '/sqrt-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sub-fp64': {
    source: fs.readFileSync(__dirname + '/sub-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'sum-fp64': {
    source: fs.readFileSync(__dirname + '/sum-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'tan-fp64': {
    source: fs.readFileSync(__dirname + '/tan-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'twoProd': {
    source: fs.readFileSync(__dirname + '/twoProd.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'twoSqr': {
    source: fs.readFileSync(__dirname + '/twoSqr.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'twoSub': {
    source: fs.readFileSync(__dirname + '/twoSub.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'twoSum': {
    source: fs.readFileSync(__dirname + '/twoSum.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec2-length-fp64': {
    source: fs.readFileSync(__dirname + '/vec2-length-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec2-mix-fp64': {
    source: fs.readFileSync(__dirname + '/vec2-mix-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec2-sub-fp64': {
    source: fs.readFileSync(__dirname + '/vec2-sub-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec3-distance-fp64': {
    source: fs.readFileSync(__dirname + '/vec3-distance-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec3-length-fp64': {
    source: fs.readFileSync(__dirname + '/vec3-length-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec3-sub-fp64': {
    source: fs.readFileSync(__dirname + '/vec3-sub-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec3-sum-fp64': {
    source: fs.readFileSync(__dirname + '/vec3-sum-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec4-dot-fp64': {
    source: fs.readFileSync(__dirname + '/vec4-dot-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec4-fp64': {
    source: fs.readFileSync(__dirname + '/vec4-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec4-scalar-mul-fp64': {
    source: fs.readFileSync(__dirname + '/vec4-scalar-mul-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  },
  'vec4-sum-fp64': {
    source: fs.readFileSync(__dirname + '/vec4-sum-fp64.glsl'),
    dependencies: ['uniforms-fp64']
  }
};
