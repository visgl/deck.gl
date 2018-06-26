import GL from 'luma.gl/constants';
import {Buffer, _Transform as Transform} from 'luma.gl';
import {getShaders, getBuffers, padBuffer} from './attribute-transition-utils';
import Attribute from './attribute';
import Transition from '../transitions/transition';
import log from '../utils/log';
import assert from '../utils/assert';

const noop = () => {};

export default class AttributeTransitionManager {
  constructor(gl, {id}) {
    this.id = id;
    this.gl = gl;

    this.attributeTransitions = {};
    this.needsRedraw = false;
    this.transform = null;
    this.numInstances = 0;

    this._bufferLayout = null;

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
    for (const attributeName in this.attributeTransitions) {
      this._removeTransition(attributeName);
    }
  }

  /* Public methods */

  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update({attributes, transitions = {}, numInstances, bufferLayout}) {
    this.opts = transitions;
    this.numInstances = numInstances;

    if (!this.isSupported) {
      return;
    }

    const {attributeTransitions} = this;
    const changedTransitions = {};

    for (const attributeName in attributes) {
      const hasChanged = this._updateAttribute(
        attributeName,
        attributes[attributeName],
        bufferLayout
      );

      if (hasChanged) {
        changedTransitions[attributeName] = attributeTransitions[attributeName];
      }
    }

    for (const attributeName in attributeTransitions) {
      const attribute = attributes[attributeName];

      if (!attribute || !attribute.supportsTransition()) {
        // Animated attribute has been removed
        this._removeTransition(attributeName);
      }
    }

    if (!this.transform) {
      this._createModel();
    } else if (this.transform) {
      const {sourceBuffers, feedbackBuffers} = getBuffers(changedTransitions);
      this.transform.update({
        elementCount: this.numInstances,
        sourceBuffers,
        feedbackBuffers
      });
    }

    this._bufferLayout = bufferLayout;
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
        animatedAttributes[attributeName] = transition.attributeInTransition;
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
      const updated = transition.update(currentTime);
      if (updated) {
        uniforms[`${attributeName}Time`] = transition.time;
        needsRedraw = true;
      }
    }

    if (needsRedraw) {
      this.transform.run({uniforms});
    }

    return needsRedraw;
  }
  /* eslint-enable max-statements */

  /* Private methods */
  _createTransition(attributeName, attribute) {
    let transition = this.attributeTransitions[attributeName];
    if (!transition) {
      transition = new Transition({
        name: attributeName,
        attribute,
        attributeInTransition: new Attribute(this.gl, attribute)
      });
      this.attributeTransitions[attributeName] = transition;
      this._invalidateModel();
      return transition;
    }
    return null;
  }

  _removeTransition(attributeName) {
    const transition = this.attributeTransitions[attributeName];
    if (transition) {
      if (transition.buffer) {
        transition.buffer.delete();
      }
      if (transition._swapBuffer) {
        transition._swapBuffer.delete();
      }
      delete this.attributeTransitions[attributeName];
      this._invalidateModel();
    }
  }

  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  _updateAttribute(attributeName, attribute, bufferLayout) {
    const settings = this._getTransitionSettings(attribute);

    if (settings) {
      let hasChanged;
      let transition = this.attributeTransitions[attributeName];
      if (transition) {
        hasChanged = attribute.needsRedraw();
      } else {
        // New animated attributes have been added
        transition = this._createTransition(attributeName, attribute);
        hasChanged = true;
      }

      if (hasChanged) {
        this._triggerTransition({transition, settings,
          fromBufferLayout: this._bufferLayout,
          toBufferLayout: bufferLayout
        });
        return true;
      }
    }

    return false;
  }

  // Invalidates the current model
  _invalidateModel() {
    if (this.transform) {
      this.transform.delete();
      this.transform = null;
    }
  }

  // Create a model for the transform feedback
  _createModel() {
    if (Object.keys(this.attributeTransitions).length === 0) {
      // no transitions
      return;
    }
    this.transform = new Transform(
      this.gl,
      Object.assign(
        {
          elementCount: this.numInstances
        },
        getBuffers(this.attributeTransitions),
        getShaders(this.attributeTransitions)
      )
    );
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getNextTransitionStates({transition, fromBufferLayout, toBufferLayout}) {
    const {attribute} = transition;
    const {size} = attribute;

    let toState;
    if (attribute.constant) {
      toState = {constant: true, value: attribute.value, size};
    } else {
      toState = {constant: false, buffer: attribute.getBuffer(), size};
    }
    const fromState = transition.buffer || toState;
    const toLength = this.numInstances * size;
    const fromLength = (fromState.data && fromState.data.length) || toLength;

    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the destination buffer.
    let buffer = transition._swapBuffer;
    transition._swapBuffer = transition.buffer;

    if (!buffer) {
      buffer = new Buffer(this.gl, {
        data: new Float32Array(toLength),
        usage: GL.DYNAMIC_COPY
      });
    }

    transition.attributeInTransition.update({buffer});

    // Pad buffers to be the same length
    if (buffer.data.length < toLength) {
      buffer.setData({
        data: new Float32Array(toLength)
      });
    }
    padBuffer({fromState, toState, fromLength, toLength, fromBufferLayout, toBufferLayout});

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
  _triggerTransition({transition, settings, fromBufferLayout, toBufferLayout}) {
    this.needsRedraw = true;

    const transitionSettings = this._normalizeTransitionSettings(settings);

    // Attribute descriptor to transition from
    transition.start(Object.assign({},
      this._getNextTransitionStates({transition, fromBufferLayout, toBufferLayout}),
      transitionSettings
    ));
  }
}
