import GL from '@luma.gl/constants';
import {Buffer, Transform} from '@luma.gl/core';
import {getShaders, getBuffers, padBuffer} from './attribute-transition-utils';
import Attribute from './attribute';
import BaseAttribute from './base-attribute';
import Transition from '../transitions/transition';
import log from '../utils/log';
import assert from '../utils/assert';

export default class AttributeTransitionManager {
  constructor(gl, {id, timeline}) {
    this.id = id;
    this.gl = gl;
    this.timeline = timeline;

    this.transitions = {};
    this.transforms = {};
    this.needsRedraw = false;
    this.numInstances = 0;

    if (Transform.isSupported(gl)) {
      this.isSupported = true;
    } else if (gl) {
      // This class may be instantiated without a WebGL context (e.g. web worker)
      log.warn('WebGL2 not supported by this browser. Transition animation is disabled.')();
    }
  }

  finalize() {
    for (const attributeName in this.transitions) {
      this._removeTransition(attributeName);
    }
  }

  /* Public methods */

  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update({attributes, transitions = {}, numInstances}) {
    this.opts = transitions;
    // Transform class will crash if elementCount is 0
    this.numInstances = numInstances || 1;

    if (!this.isSupported) {
      return;
    }

    const changedTransitions = {};

    for (const attributeName in attributes) {
      const hasChanged = this._updateAttribute(attributeName, attributes[attributeName]);

      if (hasChanged) {
        changedTransitions[attributeName] = this.transitions[attributeName];
      }
    }

    for (const attributeName in this.transitions) {
      const attribute = attributes[attributeName];

      if (!attribute || !attribute.supportsTransition()) {
        // Animated attribute has been removed
        this._removeTransition(attributeName);
      }
    }
  }

  // Returns `true` if attribute is transition-enabled
  hasAttribute(attributeName) {
    return attributeName in this.transitions;
  }

  // Get all the animated attributes
  getAttributes() {
    const animatedAttributes = {};

    for (const attributeName in this.transitions) {
      const transition = this.transitions[attributeName];

      if (transition.buffer) {
        animatedAttributes[attributeName] = transition.attributeInTransition;
      }
    }

    return animatedAttributes;
  }

  /* eslint-disable max-statements */
  // Called every render cycle, run transform feedback
  // Returns `true` if anything changes
  run() {
    if (!this.isSupported || this.numInstances === 0) {
      return false;
    }

    const {transitions, transforms} = this;
    let needsRedraw = this.needsRedraw;
    this.needsRedraw = false;

    for (const attributeName in transitions) {
      const transition = transitions[attributeName];
      const updated = transition.update();
      if (updated) {
        transforms[attributeName].run({
          uniforms: {time: transition.time}
        });
        needsRedraw = true;
      }
    }

    return needsRedraw;
  }
  /* eslint-enable max-statements */

  /* Private methods */
  _createTransition(attributeName, attribute) {
    let transition = this.transitions[attributeName];
    if (!transition) {
      transition = new Transition({
        name: attributeName,
        timeline: this.timeline,
        attribute,
        // `attribute.userData` is the original options passed when constructing the attribute.
        // This ensures that we set the proper `doublePrecision` flag and shader attributes.
        attributeInTransition: new Attribute(this.gl, attribute.userData),
        bufferLayout: attribute.bufferLayout
      });
      this.transitions[attributeName] = transition;
      return transition;
    }
    return null;
  }

  _removeTransition(attributeName) {
    const transition = this.transitions[attributeName];
    if (transition) {
      transition.cancel();
      this.transforms[attributeName].delete();
      if (transition.buffer) {
        transition.buffer.delete();
      }
      if (transition._swapBuffer) {
        transition._swapBuffer.delete();
      }
      delete this.transforms[attributeName];
      delete this.transitions[attributeName];
    }
  }

  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  _updateAttribute(attributeName, attribute) {
    const settings = attribute.getTransitionSetting(this.opts);

    if (settings) {
      let hasChanged;
      let transition = this.transitions[attributeName];
      if (transition) {
        hasChanged = attribute.needsRedraw();
      } else {
        // New animated attributes have been added
        transition = this._createTransition(attributeName, attribute);
        hasChanged = true;
      }

      if (hasChanged) {
        this._triggerTransition(transition, settings);
        return true;
      }
    }

    return false;
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _getNextTransitionStates(transition, settings) {
    const {attribute} = transition;
    const {size, normalized} = attribute;
    const multiplier = attribute.doublePrecision ? 2 : 1;

    let toState;
    if (attribute.constant) {
      toState = new BaseAttribute(this.gl, {constant: true, value: attribute.value, size});
    } else {
      toState = new BaseAttribute(this.gl, {
        constant: false,
        buffer: attribute.getBuffer(),
        divisor: 0,
        size,
        normalized
      });
    }
    const fromState = transition.buffer || toState;
    const toLength =
      (attribute.userData.noAlloc ? attribute.value.length : this.numInstances * size) * multiplier;
    const fromLength = transition.length || toLength;

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
    } else if (buffer.getElementCount() < toLength) {
      // Pad buffers to be the same length with 32-bit floats
      buffer.reallocate(toLength * 4);
    }

    transition.length = toLength;
    transition.attributeInTransition.update({
      buffer,
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: attribute.value
    });

    padBuffer({
      fromState,
      toState,
      fromLength,
      toLength,
      size: size * multiplier,
      fromBufferLayout: transition.bufferLayout,
      toBufferLayout: attribute.bufferLayout,
      offset: attribute.elementOffset * multiplier,
      getData: settings.enter
    });

    transition.bufferLayout = attribute.bufferLayout;

    return {fromState, toState, buffer};
  }

  // Start a new transition using the current settings
  // Updates transition state and from/to buffer
  _triggerTransition(transition, settings) {
    // Check if settings is valid
    assert(settings && settings.duration > 0);

    this.needsRedraw = true;

    // Attribute descriptor to transition from
    transition.start(
      Object.assign({}, this._getNextTransitionStates(transition, settings), settings)
    );
    let transform = this.transforms[transition.name];
    const elementCount = Math.floor(transition.length / transition.attribute.size);

    if (transform) {
      transform.update({
        ...getBuffers(transition),
        elementCount
      });
    } else {
      // Buffers must be supplied to the transform constructor
      transform = new Transform(this.gl, {
        elementCount,
        ...getShaders(transition),
        ...getBuffers(transition)
      });
      this.transforms[transition.name] = transform;
    }
  }
}
