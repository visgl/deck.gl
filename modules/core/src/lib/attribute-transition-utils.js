import {Buffer} from '@luma.gl/core';
import {padArray} from '../utils/array-utils';

const noop = () => {};
const DEFAULT_TRANSITION_SETTINGS = {
  type: 'interpolation',
  duration: 0,
  easing: t => t,
  onStart: noop,
  onEnd: noop,
  onInterrupt: noop,
  enter: x => x
};

export function normalizeTransitionSettings(userSettings, layerSettings = {}) {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = {
      type: 'interpolation',
      duration: userSettings
    };
  }
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS, layerSettings, userSettings);
}

// This helper is used when transitioning attributes from a set of values in one buffer layout
// to a set of values in a different buffer layout. (Buffer layouts are used when attribute values
// within a buffer should be grouped for drawElements, like the Polygon layer.) For example, a
// buffer layout of [3, 4] might have data [A1, A2, A3, B1, B2, B3, B4]. If it needs to transition
// to a buffer layout of [4, 2], it should produce a buffer, using the transition setting's `enter`
// function, that looks like this: [A1, A2, A3, A4 (user `enter` fn), B1, B2, 0]. Note: the final
// 0 in this buffer is because we never shrink buffers, only grow them, for performance reasons.
export function padBuffer({
  fromState,
  toState,
  fromLength,
  toLength,
  fromBufferLayout,
  toBufferLayout,
  size,
  offset,
  getData = x => x
}) {
  const hasBufferLayout = fromBufferLayout && toBufferLayout;

  // check if buffer needs to be padded
  if ((!hasBufferLayout && fromLength >= toLength) || !(fromState instanceof Buffer)) {
    return;
  }

  const data = new Float32Array(toLength);
  const fromData = fromState.getData({length: fromLength});

  const toData = toState.constant ? toState.getValue() : toState.getBuffer().getData({});

  if (toState.normalized) {
    const getter = getData;
    getData = (value, chunk) => toState._normalizeConstant(getter(value, chunk));
  }

  const getMissingData = toState.constant
    ? (i, chunk) => getData(toData, chunk)
    : (i, chunk) => getData(toData.subarray(i, i + size), chunk);

  padArray({
    source: fromData,
    target: data,
    sourceLayout: fromBufferLayout,
    targetLayout: toBufferLayout,
    offset,
    size,
    getData: getMissingData
  });

  fromState.setData({data});
}
