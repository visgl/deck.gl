import {Buffer} from 'luma.gl';
import {fillArray} from '../utils/flatten';

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

export function getShaders(transitions) {
  // Build shaders
  const varyings = [];
  const attributeDeclarations = [];
  const uniformsDeclarations = [];
  const varyingDeclarations = [];
  const calculations = [];

  for (const attributeName in transitions) {
    const transition = transitions[attributeName];
    const attributeType = ATTRIBUTE_MAPPING[transition.attribute.size];

    if (attributeType) {
      transition.bufferIndex = varyings.length;
      varyings.push(attributeName);

      attributeDeclarations.push(`attribute ${attributeType} ${attributeName}From;`);
      attributeDeclarations.push(`attribute ${attributeType} ${attributeName}To;`);
      uniformsDeclarations.push(`uniform float ${attributeName}Time;`);
      varyingDeclarations.push(`varying ${attributeType} ${attributeName};`);
      calculations.push(`${attributeName} = mix(${attributeName}From, ${attributeName}To,
        ${attributeName}Time);`);
    }
  }

  const vs = `
#define SHADER_NAME feedback-vertex-shader
${attributeDeclarations.join('\n')}
${uniformsDeclarations.join('\n')}
${varyingDeclarations.join('\n')}

void main(void) {
  ${calculations.join('\n')}
  gl_Position = vec4(0.0);
}
`;

  const fs = `\
#define SHADER_NAME feedback-fragment-shader

precision highp float;

${varyingDeclarations.join('\n')}

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;
  return {vs, fs, varyings};
}

export function getBuffers(transitions) {
  const sourceBuffers = {};
  const feedbackBuffers = {};
  for (const attributeName in transitions) {
    const {fromState, toState, buffer} = transitions[attributeName];
    sourceBuffers[`${attributeName}From`] = fromState;
    sourceBuffers[`${attributeName}To`] = toState;
    feedbackBuffers[`${attributeName}`] = buffer;
  }
  return {sourceBuffers, feedbackBuffers};
}

export function padBuffer({fromState, toState, fromLength, toLength, context}) {

  const hasBufferLayout = context && context.state && context.state.oldBufferLayout;

  // check if buffer needs to be padded
  if ((!hasBufferLayout && fromLength >= toLength) || !(fromState instanceof Buffer)) {
    return;
  }

  const data = new Float32Array(toLength);
  const fromData = fromState.getData({});

  if (hasBufferLayout) {
    fromLength = padArray({
      target: data,
      data: fromData,
      fromLayout: context.state.oldBufferLayout,
      toLayout: context.state.bufferLayout,
      size: toState.size
    });

    if (fromLength >= toLength) {
      fromState.setData({data: data.subarray(0, toLength)});
      return;
    }
  } else {
    // copy the currect values
    data.set(fromData);
  }

  if (toState.constant) {
    fillArray({
      target: data,
      source: toState.value,
      start: fromLength,
      count: (toLength - fromLength) / toState.size
    });
  } else {
    data.set(toState.buffer.data.subarray(fromLength, toLength), fromLength);
  }

  fromState.setData({data});
}

/*
 * A layout is an array of numbers: [chunkSize0, chunkSize1, ...]
 */
function padArray({data, target, size, fromLayout, toLayout}) {
  let fromIndex = 0;
  let toIndex = 0;

  const n = Math.min(fromLayout.length, toLayout.length);

  for (let i = 0; i < n; i++) {
    const fromChunk = fromLayout[i] * size;
    const toChunk = toLayout[i] * size;

    const overlap = Math.min(fromChunk, toChunk);
    target.set(data.subarray(fromIndex, fromIndex + overlap), toIndex);

    if (overlap < toChunk) {
      fillArray({
        target,
        // duplicate the last item
        source: target.subarray(toIndex + overlap - size, toIndex + overlap),
        start: toIndex + overlap,
        count: (toChunk - overlap) / size
      });
    }

    fromIndex += fromChunk;
    toIndex += toChunk;
  }

  return toIndex;
}
