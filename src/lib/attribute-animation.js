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
        const animation = this.attributeAnimations[attributeName];
        if (animation) {
          animation.needsUpdate = attribute.changed;
        } else {
          // New animated attributes have been added
          this.attributeAnimations[attributeName] = {
            name: attributeName,
            attribute,
            needsUpdate: true
          };
          needsNewModel = true;
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
      if (this.model) {
        this.model.destroy();
      }
      this.model = this._getModel();
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
      return {};
    }

    const currentTime = Date.now();
    const uniforms = {};
    const buffers = {};
    let needsRedraw = false;

    for (const attributeName in this.attributeAnimations) {
      const animation = this.attributeAnimations[attributeName];

      if (animation.needsUpdate) {
        this._updateAnimation(animation, this.opts);
        animation.needsUpdate = false;
        needsRedraw = true;
      }
      
      // Cannot bind to transform feedback if it's already used as attribute
      buffers[animation.bufferIndex] = animation.buffer;

      let time = 1;
      switch (animation.state) {
      case ANIMATION_STATE.PENDING:
        animation.startTime = currentTime;
        animation.state = ANIMATION_STATE.STARTED;

      case ANIMATION_STATE.STARTED:
        time = (currentTime - animation.startTime) / animation.duration;
        if (time > 1) {
          time = 1;
          animation.state = ANIMATION_STATE.COMPLETE;
        }
        needsRedraw = true;
        break;

      default:
      }

      uniforms[`${animation.name}Time`] = time;
    }

    if (needsRedraw) {
      Object.values(buffers).forEach(buffer => buffer.unbind());

      this.model.program.use();
      this.transformFeedback.bindBuffers(buffers, {clear: true});
      this.transformFeedback.begin(GL.POINTS);

      const parameters = {
        [GL.RASTERIZER_DISCARD]: true
      };

      this.model.draw({uniforms, parameters});

      this.transformFeedback.end();
    }

    return needsRedraw;
  }

  /* Private methods */
  _getModel() {
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
        calculations.push(`${attributeName} = mix(${attributeName}From, ${attributeName}To, ${attributeName}Time);`);
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

    const fs =  `\
#define SHADER_NAME feedback-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

${varyingDeclarations.join('\n')}

void main(void) {
  gl_FragColor = vec4(0.0);
}
`;

    return new Model(this.gl, {
      id: this.id,
      program: new ProgramTransformFeedback(this.gl, {vs, fs, varyings}),
      geometry: new Geometry({
        id: this.id,
        drawMode: GL.POINTS
      }),
      vertexCount: 0,
      isIndexed: true
    });

  }

  // Updates animation from/to and buffer
  _updateAnimation(animation, settings) {
    const {attribute, name, buffer} = animation;
    const {accessor, value, type, size} = attribute;

    const animationSettings = Array.isArray(accessor) ?
      accessor.map(name => settings[name]).find(Boolean) :
      settings[accessor];

    let fromValues;
    const oldBufferSize = buffer ? buffer.bytes / Float32Array.BYTES_PER_ELEMENT : 0;
    const needsNewBuffer = !buffer || oldBufferSize !== value.length;

    if (animationSettings) {
      // Enter from 0
      fromValues = new (value.constructor)(value.length);
      // No entrance animation
      // fromValues = value.slice();
      if (buffer) {
        // Transfer old buffer data to the new one
        const oldBufferData = new Float32Array(oldBufferSize);

        // TODO - luma.gl's buffer.getData is not working
        this.gl.bindBuffer(GL_COPY_READ_BUFFER, buffer.handle);
        this.gl.getBufferSubData(GL_COPY_READ_BUFFER, 0, oldBufferData);
        this.gl.bindBuffer(GL_COPY_READ_BUFFER, null);

        const len = Math.min(oldBufferSize, fromValues.length);
        for (let i = 0; i < len; i++) {
          fromValues[i] = oldBufferData[i];
        }
      }
    }

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
    }

    if (animationSettings) {
      this._updateAttribute(name, {
        fromState: {size, type, value: fromValues},
        toState: {size, type, value}
      });
      animation.duration = animationSettings.duration;
      animation.state = ANIMATION_STATE.PENDING;
    } else {
      // No animation needed
      this._updateAttribute(name, {
        fromState: {size, type, value},
        toState: {size, type, value}
      });
      animation.state = ANIMATION_STATE.NONE;
    }
  }

  _updateAttribute(name, {fromState, toState}) {
    if (this.model) {
      this.model.setAttributes({
        [`${name}From`]: fromState,
        [`${name}To`]: toState
      });
      this.model.setVertexCount(fromState.value.length / fromState.size);
    }
  }
}
