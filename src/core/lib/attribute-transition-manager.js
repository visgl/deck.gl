import {GL, Program, Model, Geometry, Buffer, TransformFeedback} from 'luma.gl';

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const TRANSITION_STATE = {
  NONE: 0,
  PENDING: 1,
  STARTED: 2,
  ENDED: 3
};

const noop = () => {};

class ProgramTransformFeedback extends Program {

  _compileAndLink() {
    const {gl} = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    // enable transform feedback for this program
    gl.transformFeedbackVaryings(this.handle, this.opts.varyings, gl.SEPARATE_ATTRIBS);
    gl.linkProgram(this.handle);
    gl.validateProgram(this.handle);
    const linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);
    if (!linked) {
      throw new Error(`Error linking ${gl.getProgramInfoLog(this.handle)}`);
    }
  }
}

export default class AttributeTransitionManager {

  constructor({id, gl}, opts) {
    this.id = id;
    this.gl = gl;
    this.opts = opts;

    this.attributeTransitions = {};

    this.needsRedraw = false;
    this.model = null;
    this.transformFeedback = new TransformFeedback(gl, {});
  }

  /* Public methods */
  setOptions(opts) {
    this.opts = opts || {};
  }

  // Called when attribute manager updates
  // Extracts the list of attributes that need transition
  update(attributes) {
    let needsNewModel = false;

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];

      if (attribute.transition) {
        let needsUpdate;
        let transition = this.attributeTransitions[attributeName];
        if (transition) {
          needsUpdate = attribute.changed;
        } else {
          // New animated attributes have been added
          transition = {name: attributeName, attribute};
          this.attributeTransitions[attributeName] = transition;
          needsUpdate = true;
          needsNewModel = true;
        }

        if (needsUpdate) {
          this._updateAnimation(transition);
          this._updateModel(attributeName, transition);
          this.needsRedraw = true;
        }
      }
    }

    for (const attributeName in this.attributeTransitions) {
      const attribute = attributes[attributeName];

      if (!attribute || !attribute.transition) {
        // Animated attribute has been removed
        delete this.attributeTransitions[attributeName];
        needsNewModel = true;
      }
    }

    if (needsNewModel) {
      this._createModel();
    }

  }

  // Get all the animated attributes
  getAttributes() {
    const animatedAttributes = {};

    for (const attributeName in this.attributeTransitions) {
      const transition = this.attributeTransitions[attributeName];

      if (transition.buffer) {
        animatedAttributes[attributeName] = transition.buffer;
      }
    }

    return animatedAttributes;
  }

  /* eslint-disable max-statements */
  // Called every render cycle, run transform feedback
  // Returns `true` if anything changes
  run() {
    if (!this.model) {
      return false;
    }

    const currentTime = Date.now();
    const uniforms = {};
    const buffers = {};

    let needsRedraw = this.needsRedraw;
    this.needsRedraw = false;

    for (const attributeName in this.attributeTransitions) {
      const transition = this.attributeTransitions[attributeName];

      buffers[transition.bufferIndex] = transition.buffer;

      let time = 1;
      if (transition.state === TRANSITION_STATE.PENDING) {
        transition.startTime = currentTime;
        transition.state = TRANSITION_STATE.STARTED;
        transition.onStart(transition);
      }

      if (transition.state === TRANSITION_STATE.STARTED) {
        time = (currentTime - transition.startTime) / transition.duration;
        if (time >= 1) {
          time = 1;
          transition.state = TRANSITION_STATE.ENDED;
          transition.onEnd(transition);
        }
        needsRedraw = true;
      }

      uniforms[`${transition.name}Time`] = transition.easing(time);
    }

    if (needsRedraw) {
      this._runTransformFeedback({uniforms, buffers});
    }

    return needsRedraw;
  }
  /* eslint-enable max-statements */

  /* Private methods */
  // Redraw the transform feedback
  _runTransformFeedback({uniforms, buffers}) {
    const {model, transformFeedback} = this;

    // Cannot bind to transform feedback if it's already used as attribute
    Object.values(buffers).forEach(buffer => buffer.unbind());

    model.program.use();
    transformFeedback.bindBuffers(buffers, {clear: true});
    transformFeedback.begin(GL.POINTS);

    const parameters = {
      [GL.RASTERIZER_DISCARD]: true
    };

    model.draw({uniforms, parameters});

    transformFeedback.end();
  }

  // Create a model for the transform feedback
  _createModel() {
    // Build shaders
    const varyings = [];
    const attributeDeclarations = [];
    const uniformsDeclarations = [];
    const varyingDeclarations = [];
    const calculations = [];

    for (const attributeName in this.attributeTransitions) {
      const transition = this.attributeTransitions[attributeName];
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

#ifdef GL_ES
precision highp float;
#endif

${varyingDeclarations.join('\n')}

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;

    if (this.model) {
      this.model.destroy();
    }

    this.model = new Model(this.gl, {
      id: this.id,
      program: new ProgramTransformFeedback(this.gl, {vs, fs, varyings}),
      geometry: new Geometry({
        id: this.id,
        drawMode: GL.POINTS
      }),
      vertexCount: 0,
      isIndexed: true
    });

    this._updateModel(this.attributeTransitions);
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getCurrentAttributeState(transition) {
    const {attribute, buffer, bufferSize} = transition;
    const {value, type, size} = attribute;

    const newBufferSize = value.length;
    // Enter from 0
    // const currentValues = new (value.constructor)(newBufferSize);
    // No entrance transition
    const currentValues = value.slice();
    if (buffer) {
      // Transfer old buffer data to the new one
      const oldBufferData = new Float32Array(bufferSize);

      buffer.getData({
        dstData: oldBufferData,
        srcByteOffset: 0
      });

      const len = Math.min(bufferSize, newBufferSize);
      for (let i = 0; i < len; i++) {
        currentValues[i] = oldBufferData[i];
      }
    }

    return {size, type, value: currentValues};
  }

  _getTransitionSettings(transition) {
    const {opts} = this;
    const {accessor} = transition.attribute;

    let settings = Array.isArray(accessor) ?
      accessor.map(a => opts[a]).find(Boolean) :
      opts[accessor];

    // Shorthand: use duration instead of parameter object
    if (Number.isFinite(settings) && settings > 0) {
      settings = {duration: settings};
    }

    return settings && settings.duration ? {
      duration: settings.duration,
      easing: settings.easing || (t => t),
      onStart: settings.onStart || noop,
      onEnd: settings.onEnd || noop,
      onInterrupt: settings.onInterrupt || noop
    } : null;
  }

  // Updates transition from/to and buffer
  _updateAnimation(transition) {
    const {attribute, buffer} = transition;
    const {value, size} = attribute;

    const transitionSettings = this._getTransitionSettings(transition);

    const needsNewBuffer = !buffer || transition.bufferSize !== value.length;

    let fromState;
    if (transitionSettings) {
      fromState = this._getCurrentAttributeState(transition);
    }
    const toState = new Buffer(this.gl, {size, data: value});

    if (needsNewBuffer) {
      if (buffer) {
        buffer.unbind();
        buffer._deleteHandle();
      }

      transition.buffer = new Buffer(this.gl, {
        size,
        instanced: attribute.instanced,
        data: new Float32Array(value.length),
        usage: GL.DYNAMIC_COPY
      });
      transition.bufferSize = value.length;
    }

    if (transitionSettings) {
      Object.assign(transition, transitionSettings);
      transition.fromState = fromState;
      transition.toState = toState;

      // Reset transition state
      const oldState = transition.state;
      transition.state = TRANSITION_STATE.PENDING;
      if (oldState === TRANSITION_STATE.STARTED) {
        transition.onInterrupt(transition);
      }
    } else {
      // No transition needed
      transition.fromState = toState;
      transition.toState = toState;
      transition.state = TRANSITION_STATE.NONE;
    }
  }

  // Update attributes and vertex count
  _updateModel(attributeName, transition) {
    if (transition === undefined) {
      for (const name in attributeName) {
        this._updateModel(name, attributeName[name]);
      }
    } else if (this.model) {
      this.model.setAttributes({
        [`${attributeName}From`]: transition.fromState,
        [`${attributeName}To`]: transition.toState
      });
      this.model.setVertexCount(transition.bufferSize / transition.fromState.size);
    }
  }
}
