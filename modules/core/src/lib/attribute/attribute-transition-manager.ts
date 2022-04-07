import {Transform} from '@luma.gl/core';
import GPUInterpolationTransition from '../../transitions/gpu-interpolation-transition';
import GPUSpringTransition from '../../transitions/gpu-spring-transition';
import log from '../../utils/log';

import type {TransitionSettings} from './attribute-transition-utils';
import type Attribute from './attribute';
import type {Timeline} from '@luma.gl/engine';
import type GPUTransition from '../../transitions/gpu-transition';
import type {ConstructorOf} from '../../types/types';

const TRANSITION_TYPES: Record<string, ConstructorOf<GPUTransition>> = {
  interpolation: GPUInterpolationTransition,
  spring: GPUSpringTransition
};

export default class AttributeTransitionManager {
  id: string;
  isSupported: boolean;

  private gl: WebGLRenderingContext;
  private timeline?: Timeline;

  private transitions: {[id: string]: GPUTransition};
  private needsRedraw: boolean;
  private numInstances: number;

  constructor(
    gl: WebGLRenderingContext,
    {
      id,
      timeline
    }: {
      id: string;
      timeline?: Timeline;
    }
  ) {
    this.id = id;
    this.gl = gl;
    this.timeline = timeline;

    this.transitions = {};
    this.needsRedraw = false;
    this.numInstances = 1;

    this.isSupported = Transform.isSupported(gl);
  }

  finalize(): void {
    for (const attributeName in this.transitions) {
      this._removeTransition(attributeName);
    }
  }

  /* Public methods */

  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update({
    attributes,
    transitions,
    numInstances
  }: {
    attributes: {[id: string]: Attribute};
    transitions: any;
    numInstances: number;
  }): void {
    // Transform class will crash if elementCount is 0
    this.numInstances = numInstances || 1;

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const settings = attribute.getTransitionSetting(transitions);

      // this attribute might not support transitions?
      if (!settings) continue; // eslint-disable-line no-continue
      this._updateAttribute(attributeName, attribute, settings);
    }

    for (const attributeName in this.transitions) {
      const attribute = attributes[attributeName];
      if (!attribute || !attribute.getTransitionSetting(transitions)) {
        // Animated attribute has been removed
        this._removeTransition(attributeName);
      }
    }
  }

  // Returns `true` if attribute is transition-enabled
  hasAttribute(attributeName: string): boolean {
    const transition = this.transitions[attributeName];
    return transition && transition.inProgress;
  }

  // Get all the animated attributes
  getAttributes(): {[id: string]: Attribute} {
    const animatedAttributes = {};

    for (const attributeName in this.transitions) {
      const transition = this.transitions[attributeName];
      if (transition.inProgress) {
        animatedAttributes[attributeName] = transition.attributeInTransition;
      }
    }

    return animatedAttributes;
  }

  /* eslint-disable max-statements */
  // Called every render cycle, run transform feedback
  // Returns `true` if anything changes
  run(): boolean {
    if (!this.isSupported || this.numInstances === 0) {
      return false;
    }

    for (const attributeName in this.transitions) {
      const updated = this.transitions[attributeName].update();
      if (updated) {
        this.needsRedraw = true;
      }
    }

    const needsRedraw = this.needsRedraw;
    this.needsRedraw = false;
    return needsRedraw;
  }
  /* eslint-enable max-statements */

  /* Private methods */
  private _removeTransition(attributeName: string): void {
    this.transitions[attributeName].cancel();
    delete this.transitions[attributeName];
  }

  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  private _updateAttribute(
    attributeName: string,
    attribute: Attribute,
    settings: TransitionSettings
  ): void {
    const transition = this.transitions[attributeName];
    // an attribute can change transition type when it updates
    // let's remove the transition when that happens so we can create the new transition type
    // TODO: when switching transition types, make sure to carry over the attribute's
    // previous buffers, currentLength, startIndices, etc, to be used as the starting point
    // for the next transition
    let isNew = !transition || transition.type !== settings.type;
    if (isNew) {
      if (!this.isSupported) {
        log.warn(
          `WebGL2 not supported by this browser. Transition for ${attributeName} is disabled.`
        )();
        return;
      }

      if (transition) {
        this._removeTransition(attributeName);
      }

      const TransitionType = TRANSITION_TYPES[settings.type];
      if (TransitionType) {
        this.transitions[attributeName] = new TransitionType({
          attribute,
          timeline: this.timeline,
          gl: this.gl
        });
      } else {
        log.error(`unsupported transition type '${settings.type}'`)();
        isNew = false;
      }
    }

    if (isNew || attribute.needsRedraw()) {
      this.needsRedraw = true;
      this.transitions[attributeName].start(settings, this.numInstances);
    }
  }
}
