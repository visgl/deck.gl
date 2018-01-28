import {GL, Buffer, TransformFeedback} from 'luma.gl';
import AttributeTransitionModel from './attribute-transition-model';
import log from '../utils/log';
import assert from 'assert';

const TRANSITION_STATE = {
  NONE: 0,
  PENDING: 1,
  STARTED: 2,
  ENDED: 3
};

const noop = () => {};

export default class AttributeTransitionManager {
  constructor(gl, {id}) {
    this.id = id;
    this.gl = gl;

    this.isSupported = TransformFeedback.isSupported(gl);

    this.attributeTransitions = {};
    this.needsRedraw = false;
    this.model = null;

    if (this.isSupported) {
      this.transformFeedback = new TransformFeedback(gl);
    } else {
      log.warn(0, 'WebGL2 not supported by this browser. Transition animation is disabled.');
    }
  }

  /* Public methods */

  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update(attributes, opts = {}) {
    this.opts = opts;

    if (!this.isSupported) {
      return;
    }

    let needsNewModel = false;
    const {attributeTransitions} = this;
    const changedTransitions = {};

    for (const attributeName in attributes) {
      const transition = this._updateAttribute(attributeName, attributes[attributeName]);

      if (transition) {
        if (!attributeTransitions[attributeName]) {
          // New animated attribute is added
          attributeTransitions[attributeName] = transition;
          needsNewModel = true;
        }
        changedTransitions[attributeName] = transition;
      }
    }

    for (const attributeName in attributeTransitions) {
      const attribute = attributes[attributeName];

      if (!attribute || !attribute.transition) {
        // Animated attribute has been removed
        delete attributeTransitions[attributeName];
        needsNewModel = true;
      }
    }

    if (needsNewModel) {
      this._createModel();
    } else if (this.model) {
      this.model.setTransitions(changedTransitions);
    }
  }

  // Returns `true` if attribute is transition-enabled
  hasAttribute(attributeName) {
    return attributeName in this.attributeTransitions;
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
  setCurrentTime(currentTime) {
    if (!this.model) {
      return false;
    }

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

  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  _updateAttribute(attributeName, attribute) {
    const settings = this._getTransitionSettings(attribute);

    if (settings) {
      let hasChanged;
      let transition = this.attributeTransitions[attributeName];
      if (transition) {
        hasChanged = attribute.changed;
      } else {
        // New animated attributes have been added
        transition = {name: attributeName, attribute};
        hasChanged = true;
      }

      if (hasChanged) {
        this._triggerTransition(transition, settings);
        return transition;
      }
    }

    return null;
  }

  // Redraw the transform feedback
  _runTransformFeedback({uniforms, buffers}) {
    const {model, transformFeedback} = this;

    transformFeedback.bindBuffers(buffers, {});

    model.draw({
      uniforms,
      transformFeedback,
      parameters: {
        [GL.RASTERIZER_DISCARD]: true
      }
    });
  }

  // Create a model for the transform feedback
  _createModel() {
    if (this.model) {
      this.model.destroy();
    }

    this.model = new AttributeTransitionModel(this.gl, {
      id: this.id,
      transitions: this.attributeTransitions
    });
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getCurrentAttributeState(transition) {
    const {attribute, buffer} = transition;
    const {value, type, size} = attribute;

    if (buffer) {
      // If new buffer is bigger than old buffer, back fill with destination values
      let oldBufferData = new Float32Array(value);
      buffer.getData({dstData: oldBufferData});
      // Hack/Xiaoji: WebGL2 throws error if TransformFeedback does not render to
      // a buffer of type Float32Array.
      // Therefore we need to read data as a Float32Array then re-cast to attribute type
      if (!(value instanceof Float32Array)) {
        oldBufferData = new value.constructor(oldBufferData);
      }
      return {size, type, value: oldBufferData};
    }
    return {size, type, value};
  }

  // Returns transition settings object if transition is enabled, otherwise `null`
  _getTransitionSettings(attribute) {
    const {opts} = this;
    const {transition, accessor} = attribute;

    if (!transition) {
      return null;
    }

    return Array.isArray(accessor) ? accessor.map(a => opts[a]).find(Boolean) : opts[accessor];
  }

  // Normalizes transition settings object, merge with default settings
  _normalizeTransitionSettings(settings) {
    // Shorthand: use duration instead of parameter object
    if (Number.isFinite(settings)) {
      settings = {duration: settings};
    }

    // Check if settings is valid
    assert(settings && settings.duration > 0);

    return {
      duration: settings.duration,
      easing: settings.easing || (t => t),
      onStart: settings.onStart || noop,
      onEnd: settings.onEnd || noop,
      onInterrupt: settings.onInterrupt || noop
    };
  }

  // Start a new transition using the current settings
  // Updates transition state and from/to buffer
  _triggerTransition(transition, settings) {
    this.needsRedraw = true;

    const {attribute, buffer} = transition;
    const {value, size} = attribute;

    const transitionSettings = this._normalizeTransitionSettings(settings);

    const needsNewBuffer = !buffer || transition.bufferSize < value.length;

    // Attribute descriptor to transition from
    // _getCurrentAttributeState must be called before the current buffer is deleted
    const fromState = this._getCurrentAttributeState(transition);

    // Attribute descriptor to transition to
    // Pre-converting to buffer to reuse in the case where no transition is needed
    const toState = new Buffer(this.gl, {size, data: value});

    if (needsNewBuffer) {
      if (buffer) {
        buffer.delete();
      }

      transition.buffer = new Buffer(this.gl, {
        size,
        instanced: attribute.instanced,
        // WebGL2 throws error if `value` is not cast to Float32Array:
        // `transformfeedback buffers : buffer or buffer range not large enough`
        data: new Float32Array(value.length),
        usage: GL.DYNAMIC_COPY
      });
      transition.bufferSize = value.length;
    }

    Object.assign(transition, transitionSettings);
    transition.fromState = fromState;
    transition.toState = toState;

    // Reset transition state
    if (transition.state === TRANSITION_STATE.STARTED) {
      transition.onInterrupt(transition);
    }
    transition.state = TRANSITION_STATE.PENDING;
  }
}
