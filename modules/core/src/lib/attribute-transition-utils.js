import {Buffer} from '@luma.gl/core';
import {padArray} from '../utils/array-utils';

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const noop = () => {};
const DEFAULT_TRANSITION_SETTINGS = {
  duration: 0,
  easing: t => t,
  onStart: noop,
  onEnd: noop,
  onInterrupt: noop
};

export function normalizeTransitionSettings(settings) {
  if (!settings) {
    return null;
  }
  if (Number.isFinite(settings)) {
    settings = {duration: settings};
  }
  if (!settings.duration) {
    return null;
  }
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS, settings);
}

const vs = `
#define SHADER_NAME feedback-vertex-shader

uniform float time;
attribute ATTRIBUTE_TYPE aFrom;
attribute ATTRIBUTE_TYPE aTo;
varying ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, time);
  gl_Position = vec4(0.0);
}
`;

const fs = `\
#define SHADER_NAME feedback-fragment-shader

precision highp float;

varying ATTRIBUTE_TYPE vCurrent;

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;

export function getShaders(transition) {
  const attributeType = ATTRIBUTE_MAPPING[transition.attribute.size];

  return {
    vs,
    fs,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  };
}

export function getBuffers(transition) {
  const {fromState, toState, buffer} = transition;

  return {
    sourceBuffers: {
      aFrom:
        fromState instanceof Buffer ? [fromState, {divisor: 0, offset: toState.offset}] : fromState,
      aTo: toState
    },
    feedbackBuffers: {
      vCurrent: {buffer, byteOffset: toState.offset}
    }
  };
}

export function padBuffer({
  fromState,
  toState,
  fromLength,
  toLength,
  fromBufferLayout,
  toBufferLayout,
  offset,
  getData = x => x
}) {
  const hasBufferLayout = fromBufferLayout && toBufferLayout;

  // check if buffer needs to be padded
  if ((!hasBufferLayout && fromLength >= toLength) || !(fromState instanceof Buffer)) {
    return;
  }

  const data = new Float32Array(toLength);
  const fromData = fromState.getData({});

  const {size, constant} = toState;
  const toData = constant ? toState.getValue() : toState.getBuffer().getData({});

  const getMissingData = constant
    ? (i, chunk) => getData(toData, chunk)
    : (i, chunk) => getData(toData.subarray(i, i + size), chunk);

  padArray({
    source: fromData,
    target: data,
    sourceLayout: fromBufferLayout,
    targetLayout: toBufferLayout,
    offset,
    size: toState.size,
    getData: getMissingData
  });

  fromState.setData({data});
}
