import {GL, Program, Model, Geometry, Buffer, TransformFeedback} from 'luma.gl';

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const ANIMATION_STATE = {
  NONE: 0,
  PENDING: 1,
  STARTED: 2,
  COMPLETE: 3
};

const GL_COPY_READ_BUFFER = 0x8F36;

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

export class AttributeAnimationManager {

  constructor({id, gl}, opts) {
    this.id = id;
    this.gl = gl;
    this.opts = opts;

    this.attributeAnimations = {};

    this.needsRedraw = false;
    this.model = null;
    this.transformFeedback = new TransformFeedback(gl, {});
  }

  /* Public methods */
  setOptions(opts) {
    this.opts = opts;
  }

  // Called when attribute manager updates
  // Extracts the list of attributes that need animation
  update(attributes) {
    let needsNewModel = false;

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];

      if (attribute.animate) {
        let needsUpdate;
        let animation = this.attributeAnimations[attributeName];
        if (animation) {
          needsUpdate = attribute.changed;
        } else {
          // New animated attributes have been added
          animation = {name: attributeName, attribute};
          this.attributeAnimations[attributeName] = animation;
          needsUpdate = true;
          needsNewModel = true;
        }

        if (needsUpdate) {
          this._updateAnimation(animation, this.opts);
          this._updateModel(attributeName, animation);
          this.needsRedraw = true;
        }
      }
    }

    for (const attributeName in this.attributeAnimations) {
      const attribute = attributes[attributeName];

      if (!attribute || !attribute.animate) {
        // Animated attribute has been removed
        delete this.attributeAnimations[attributeName];
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

    for (const attributeName in this.attributeAnimations) {
      const animation = this.attributeAnimations[attributeName];

      if (animation.buffer) {
        animatedAttributes[attributeName] = animation.buffer;
      }
    }

    return animatedAttributes;
  }

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

    for (const attributeName in this.attributeAnimations) {
      const animation = this.attributeAnimations[attributeName];

      // Cannot bind to transform feedback if it's already used as attribute
      buffers[animation.bufferIndex] = animation.buffer;

      let time = 1;
      if (animation.state === ANIMATION_STATE.PENDING) {
        animation.startTime = currentTime;
        animation.state = ANIMATION_STATE.STARTED;
      }

      if (animation.state === ANIMATION_STATE.STARTED) {
        time = (currentTime - animation.startTime) / animation.duration;
        if (time > 1) {
          time = 1;
          animation.state = ANIMATION_STATE.COMPLETE;
        }
        needsRedraw = true;
      }

      uniforms[`${animation.name}Time`] = time;
    }

    if (needsRedraw) {
      this._runTransformFeedback({uniforms, buffers});
    }

    return needsRedraw;
  }

  _runTransformFeedback({uniforms, buffers}) {
    const {model, transformFeedback} = this;

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

  /* Private methods */
  _createModel() {
    // Build shaders
    const varyings = [];
    const attributeDeclarations = [];
    const uniformsDeclarations = [];
    const varyingDeclarations = [];
    const calculations = [];

    for (const attributeName in this.attributeAnimations) {
      const animation = this.attributeAnimations[attributeName];
      const attributeType = ATTRIBUTE_MAPPING[animation.attribute.size];

      if (attributeType) {
        animation.bufferIndex = varyings.length;
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

    this._updateModel(this.attributeAnimations);
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getCurrentAttributeState(animation) {
    const {attribute, buffer, bufferSize} = animation;
    const {value, type, size} = attribute;

    // Enter from 0
    const currentValues = new (value.constructor)(value.length);
    // No entrance animation
    // const currentValues = value.slice();
    if (buffer) {
      // Transfer old buffer data to the new one
      const oldBufferData = new Float32Array(bufferSize);

      // TODO - luma.gl's buffer.getData is not working
      this.gl.bindBuffer(GL_COPY_READ_BUFFER, buffer.handle);
      this.gl.getBufferSubData(GL_COPY_READ_BUFFER, 0, oldBufferData);
      this.gl.bindBuffer(GL_COPY_READ_BUFFER, null);

      const len = Math.min(bufferSize, currentValues.length);
      for (let i = 0; i < len; i++) {
        currentValues[i] = oldBufferData[i];
      }
    }

    return {size, type, value: currentValues};
  }

  // Updates animation from/to and buffer
  _updateAnimation(animation, settings) {
    const {attribute, buffer} = animation;
    const {accessor, value, type, size} = attribute;

    const animationSettings = Array.isArray(accessor) ?
      accessor.map(a => settings[a]).find(Boolean) :
      settings[accessor];

    const needsNewBuffer = !buffer || animation.bufferSize !== value.length;

    let fromState;
    if (animationSettings) {
      fromState = this._getCurrentAttributeState(animation);
    }
    const toState = {size, type, value};

    if (needsNewBuffer) {
      if (buffer) {
        buffer.unbind();
        buffer._deleteHandle();
      }

      animation.buffer = new Buffer(this.gl, {
        size,
        instanced: attribute.instanced,
        data: new Float32Array(value.length),
        usage: GL.DYNAMIC_COPY
      });
      animation.bufferSize = value.length;
    }

    if (animationSettings) {
      animation.fromState = fromState;
      animation.toState = toState;
      animation.duration = animationSettings.duration;
      animation.state = ANIMATION_STATE.PENDING;
    } else {
      // No animation needed
      animation.fromState = toState;
      animation.toState = toState;
      animation.state = ANIMATION_STATE.NONE;
    }
  }

  _updateModel(attributeName, animation) {
    if (animation === undefined) {
      const animations = attributeName;
      for (const name in animations) {
        this._updateModel(name, animations[name]);
      }
    } else if (this.model) {
      this.model.setAttributes({
        [`${attributeName}From`]: animation.fromState,
        [`${attributeName}To`]: animation.toState
      });
      this.model.setVertexCount(animation.bufferSize / animation.fromState.size);
    }
  }
}
