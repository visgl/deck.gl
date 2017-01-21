import {createGLContext} from 'luma.gl';

/**
 * Covert all numbers in a deep structure to a given precision, allowing
 * reliable float comparisons. Converts data in-place.
 * @param  {mixed} input      Input data
 * @param  {Number} [precision] Desired precision
 * @return {mixed}            Input data, with all numbers converted
 */
export function toLowPrecision(input, precision = 11) {
  /* eslint-disable guard-for-in */
  if (typeof input === 'number') {
    input = Number(input.toPrecision(precision));
  }
  if (Array.isArray(input)) {
    input = input.map(item => toLowPrecision(item, precision));
  }
  if (typeof input === 'object') {
    for (const key in input) {
      input[key] = toLowPrecision(input[key], precision);
    }
  }
  return input;
}

// Create and reuse a default context if none is supplied
let glContext = null;

function getGLContext() {
  glContext = glContext || createGLContext();
  return glContext;
}

export function testInitializeLayer({gl, layer}) {
  gl = gl || getGLContext();

  const oldContext = {gl};
  const context = {gl};
  let failures = 0;
  try {
    layer.context = context;

    layer.initializeLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });

    layer.updateLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });
  } catch (error) {
    failures++;
  }
  return failures;
}
