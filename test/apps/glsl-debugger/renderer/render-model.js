import {compileVertexShader, compileFragmentShader} from './compile-shader';
import {clamp, lerp} from 'math.gl';

const shaderCache = {};

export const COLOR_MODE = {
  NONE: 0,
  DEPTH: 1,
  FRAGMENT: 2
};

const MIN_DEPTH_COLOR = [1, 1, 0, 1];
const MAX_DEPTH_COLOR = [0, 0, 1, 1];
const DISCARDED_FRAG_COLOR = [1, 0, 0, 1];

export default ({model, context, colorMode = COLOR_MODE.NONE}) => {
  const shaders = getShaders(model);

  // draw params
  const {uniforms} = model;
  const {instancedAttributes, vertexAttributes, indices, vertexCount} = sortAttributes(
    model._attributes
  );
  const drawMode = model.getDrawMode();
  const instanceCount = model.instanceCount || 1;

  // iterate through all instances
  for (let i = 0; i < instanceCount; i++) {
    const ai = getAttributeAtIndex(instancedAttributes, i);
    const positions = [];
    const colors = [];

    // iterate through all vertices
    for (let j = 0; j < vertexCount; j++) {
      const aj = Object.assign({}, ai, getAttributeAtIndex(vertexAttributes, j));

      const {position, color} = renderVertex(shaders, uniforms, aj, colorMode);
      positions[j] = position;
      colors[j] = color;
    }

    context.draw({indices, drawMode, positions, colors});
  }
};

// Transpile shaders of a model to JavaScript
function getShaders(model) {
  const {id, program} = model;

  let vs = shaderCache[program.vs.source];
  if (!vs) {
    vs = compileVertexShader(`${id}-vs`, program.vs.source);
    shaderCache[program.vs.source] = vs;
  }

  let fs = shaderCache[program.fs.source];
  if (!fs) {
    fs = compileFragmentShader(`${id}-fs`, program.fs.source);
    shaderCache[program.fs.source] = fs;
  }

  return {vs, fs};
}

// Sort attributes by instanced and indexed
function sortAttributes(attributes) {
  const instancedAttributes = {};
  const vertexAttributes = {};
  let indexAttribute = null;
  let vertexCount = 1;

  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    if (attribute.isIndexed) {
      indexAttribute = attribute;
    } else if (attribute.instanced) {
      instancedAttributes[attributeName] = attribute;
    } else {
      vertexAttributes[attributeName] = attribute;
      if (!attribute.isGeneric) {
        vertexCount = attribute.getBuffer().data.length / attribute.size;
      }
    }
  }

  let indices;
  if (indexAttribute) {
    indices = indexAttribute.getBuffer().data;
  } else {
    indices = Array.from({length: vertexCount}, (d, i) => i);
  }

  return {instancedAttributes, vertexAttributes, indices, vertexCount};
}

// Get single attribute value by vertex index
function getAttributeAtIndex(attributes, i) {
  const result = {};

  for (const attributeName in attributes) {
    const attribute = attributes[attributeName];
    if (attribute.isGeneric) {
      result[attributeName] = attribute.value;
    } else {
      const {size} = attribute;
      const buffer = attribute.getBuffer();
      const value = buffer.data.subarray(i * size, (i + 1) * size);
      result[attributeName] = Array.from(value);
    }
  }

  return result;
}

// Get the position and color of a single vertex
function renderVertex(shaders, uniforms, attributes, colorMode) {
  // Run vertex shader
  const {gl_Position, varyings} = shaders.vs(uniforms, attributes);

  let color;
  switch (colorMode) {
    case COLOR_MODE.DEPTH: {
      const depth = clamp(gl_Position[2] / gl_Position[3], -1, 1);
      color = lerp(MIN_DEPTH_COLOR, MAX_DEPTH_COLOR, (depth + 1) / 2);
      break;
    }

    case COLOR_MODE.FRAGMENT: {
      // Run fragment shader
      const {gl_FragColor, isDiscarded} = shaders.fs(uniforms, varyings);
      color = isDiscarded ? DISCARDED_FRAG_COLOR : gl_FragColor;
      break;
    }

    default:
  }

  return {position: gl_Position, color};
}
