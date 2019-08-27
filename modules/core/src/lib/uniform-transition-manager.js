import {lerp} from 'math.gl';
import {normalizeTransitionSettings} from './attribute-transition-utils';

export default class UniformTransitionManager {
  constructor(timeline) {
    this.transitions = new Map();
    this.timeline = timeline;
  }

  get active() {
    return this.transitions.size > 0;
  }

  add(key, fromValue, toValue, settings) {
    const {transitions} = this;
    if (transitions.has(key)) {
      const transition = transitions.get(key);
      // start from interrupted position
      fromValue = this._getValue(transition);
      transition.onInterrupt();
      this.remove(key);
    }

    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }
    transitions.set(key, Object.assign({fromValue, toValue, handle: null}, settings));
  }

  remove(key) {
    const {transitions} = this;
    if (transitions.has(key)) {
      this.timeline.removeChannel(transitions.get(key).handle);
      transitions.delete(key);
    }
  }

  update() {
    const propsInTransition = {};
    const {timeline} = this;

    for (const [key, transition] of this.transitions) {
      if (transition.handle === null) {
        transition.onStart();
        transition.handle = timeline.addChannel({
          delay: timeline.getTime(),
          duration: transition.duration
        });
      }

      propsInTransition[key] = this._getValue(transition);

      if (timeline.isFinished(transition.handle)) {
        transition.onEnd();
        this.remove(key);
      }
    }

    return propsInTransition;
  }

  _getValue(transition) {
    const time = this.timeline.getTime(transition.handle);
    const {fromValue, toValue, duration, easing} = transition;
    return lerp(fromValue, toValue, easing(time / duration));
  }

  clear() {
    for (const key of this.transitions.keys()) {
      this.remove(key);
    }
  }
}
