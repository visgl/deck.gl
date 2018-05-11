import {GL, Buffer, experimental} from 'luma.gl';
import {getShaders, getBuffers} from './attribute-transition-utils';
import log from '../utils/log';
import assert from '../utils/assert';

const {Transform} = experimental;

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

    this.attributeTransitions = {};
    this.needsRedraw = false;
    this.transform = null;

    if (Transform.isSupported(gl)) {
      this.isSupported = true;
    } else {
      log.warn('WebGL2 not supported by this browser. Transition animation is disabled.')();
    }
  }

  finalize() {
    if (this.transform) {
      this.transform.delete();
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

      if (!attribute || !attribute.userData.transition) {
        // Animated attribute has been removed
        delete attributeTransitions[attributeName];
        needsNewModel = true;
      }
    }

    if (needsNewModel) {
      this._createModel();
    } else if (this.transform) {
      const {sourceBuffers, destinationBuffers, elementCount} = getBuffers(changedTransitions);
      this.transform.elementCount = Math.min(this.transform.elementCount, elementCount);
      this.transform.update({
        sourceBuffers,
        destinationBuffers
      });
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
    if (!this.transform) {
      return false;
    }

    const uniforms = {};

    let needsRedraw = this.needsRedraw;
    this.needsRedraw = false;

    for (const attributeName in this.attributeTransitions) {
      const transition = this.attributeTransitions[attributeName];

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
      this.transform.run({uniforms});
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
        hasChanged = attribute.needsRedraw();
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

  // Create a model for the transform feedback
  _createModel() {
    if (this.transform) {
      this.transform.delete();
    }
    this.transform = new Transform(
      this.gl,
      Object.assign(
        {},
        getBuffers(this.attributeTransitions),
        getShaders(this.attributeTransitions)
      )
    );
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getNextTransitionStates(transition) {
    const {attribute} = transition;
    const {value, size} = attribute;

    // TODO - support attribute in Transform class
    const toState = attribute.getBuffer();
    toState.setDataLayout({size});
    const fromState = transition.buffer || toState;

    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the destination buffer.
    let buffer = transition._swapBuffer;
    transition._swapBuffer = transition.buffer;

    if (!buffer) {
      buffer = new Buffer(this.gl, {
        size,
        data: new Float32Array(value.length),
        usage: GL.DYNAMIC_COPY
      });
    }

    // Pad buffers to be the same length
    if (buffer.data.length < value.length) {
      buffer.setData({
        data: new Float32Array(value.length)
      });
    }
    if (fromState.data.length < value.length) {
      const data = new Float32Array(value.length);
      data.set(fromState.getData({}));
      data.set(value.subarray(fromState.data.length), fromState.data.length);

      fromState.setData({data});
    }

    return {fromState, toState, buffer};
  }

  // Returns transition settings object if transition is enabled, otherwise `null`
  _getTransitionSettings(attribute) {
    const {opts} = this;
    const {transition, accessor} = attribute.userData;

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

    const transitionSettings = this._normalizeTransitionSettings(settings);

    // Attribute descriptor to transition from
    // _getCurrentAttributeState must be called before the current buffer is deleted
    Object.assign(transition, this._getNextTransitionStates(transition), transitionSettings);

    // Reset transition state
    if (transition.state === TRANSITION_STATE.STARTED) {
      transition.onInterrupt(transition);
    }
    transition.state = TRANSITION_STATE.PENDING;
  }
}
