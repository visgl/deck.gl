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
