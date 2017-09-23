import {GL, Program, Model, Geometry, Buffer, TransformFeedback} from 'luma.gl';
import {glArrayFromType} from './attribute-manager';

const vertexTF = `
#define SHADER_NAME feedback-vertex-shader

attribute <attributeType> fromValues;
attribute <attributeType> toValues;

uniform float duration;
uniform float time;

varying <attributeType> value;

void main(void) {
  value = mix(fromValues, toValues, time / duration);
  gl_Position = vec4(0.0);
}
`;

const fragmentTF = `\
#define SHADER_NAME feedback-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

varying <attributeType> value;

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

class ProgramTransformFeedback extends Program {

  _compileAndLink() {
    const {gl} = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    // enable transform feedback for this program
    gl.transformFeedbackVaryings(this.handle, ['value'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(this.handle);
    gl.validateProgram(this.handle);
    const linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);
    if (!linked) {
      throw new Error(`Error linking ${gl.getProgramInfoLog(this.handle)}`);
    }
  }
}

function getTFShaders(attribute) {
  const {size} = attribute;
  const attributeType = ATTRIBUTE_MAPPING[size];

  if (!attributeType) {
    return null;
  }

  return {
    vs: vertexTF.replace(/<attributeType>/g, attributeType),
    fs: fragmentTF.replace(/<attributeType>/g, attributeType)
  };
}

const GL_COPY_READ_BUFFER = 0x8F36;

function createTransformFeedbackAnimation({gl, attribute, model, transformFeedback, duration}) {
  let startTime = -1;
  let complete = false;
  const {type, size, value} = attribute;
  const ArrayType = glArrayFromType(type || GL.FLOAT);

  const targetBuffers = [
    new Buffer(gl, {size, data: new Float32Array(value.length), usage: gl.DYNAMIC_COPY}),
    new Buffer(gl, {size, data: new Float32Array(value.length), usage: gl.DYNAMIC_COPY})
  ];
  let bufferIndex = 0;

  // Runs animation. Returns an updated buffer if successful.
  const run = (forced = false) => {
    if (complete && !forced) {
      // No need to run
      return null;
    }

    const currentTime = Date.now();
    if (startTime < 0) {
      // first call
      startTime = currentTime;
    }
    let time = currentTime - startTime;
    if (time > duration) {
      time = duration;
      complete = true;
    }

    // Swap buffer
    bufferIndex = 1 - bufferIndex;
    const buffer = targetBuffers[bufferIndex];

    model.program.use();

    transformFeedback.bindBuffers({0: buffer}, {clear: true});

    transformFeedback.begin(GL.POINTS);

    const uniforms = {duration, time};

    const parameters = {
      [GL.RASTERIZER_DISCARD]: true
    };

    model.draw({uniforms, parameters});

    transformFeedback.end();

    return buffer;
  };

  const getData = () => {
    const buffer = run(true);

    const dstData = new Float32Array(value.length);

    // luma.gl's buffer.getData is not working
    buffer.gl.bindBuffer(GL_COPY_READ_BUFFER, buffer.handle);
    buffer.gl.getBufferSubData(GL_COPY_READ_BUFFER, 0, dstData);
    buffer.gl.bindBuffer(GL_COPY_READ_BUFFER, null);

    return dstData;
  };

  return {model, transformFeedback, run, getData};
}

export function getAttributeAnimation({gl, attribute, animationDuration, id}) {

  if (!animationDuration || attribute.noAnimation) {
    return null;
  }

  const {value, type, size} = attribute;
  const fromValues = value.slice();

  if (attribute.animation) {
    // Transfer old buffer data to the new one
    const oldBufferData = attribute.animation.getData();
    const len = Math.min(oldBufferData.length, fromValues.length);
    for (let i = 0; i < len; i++) {
      fromValues[i] = oldBufferData[i];
    }
  }

  const shaders = getTFShaders(attribute);

  if (!shaders) {
    return null;
  }

  let {model, transformFeedback} = attribute.animation || {};

  if (!model || !transformFeedback) {
    model = new Model(gl, {
      id,
      program: new ProgramTransformFeedback(gl, shaders),
      geometry: new Geometry({
        id,
        drawMode: GL.POINTS
      }),
      vertexCount: 0,
      isIndexed: true
    });

    transformFeedback = new TransformFeedback(gl, {});
  }

  model.setAttributes({
    fromValues: {size, type, value: fromValues},
    toValues: {size, type, value}
  });
  model.setVertexCount(value.length / size);

  return createTransformFeedbackAnimation({
    gl,
    attribute,
    duration: animationDuration,
    model,
    transformFeedback
  });
}
