import {lerp} from 'math.gl';
import {normalizeTransitionSettings} from './attribute-transition-utils';

export default class UniformTransitionManager {
  constructor(timeline) {
    this.transitions = new Map();
    this.timeline = timeline;
  }

  get size() {
    return this.transitions.size;
  }

  add(key, fromValue, toValue, settings) {
    const {transitions} = this;
    const existingTransition = transitions.get(key);
    if (existingTransition) {
      existingTransition.onInterrupt();
      this.remove(key);
    }

    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }
    transitions.set(key, Object.assign({fromValue, toValue}, settings));
  }

  remove(key) {
    const {transitions} = this;
    this.timeline.removeChannel(transitions.get(key).handle);
    transitions.delete(key);
  }

  update() {
    const propsInTransition = {};
    const {timeline} = this;

    for (const [key, transition] of this.transitions) {
      const {fromValue, toValue, duration, easing} = transition;
      let time = 0;
      if (transition.handle) {
        time = timeline.getTime(transition.handle);
      } else {
        transition.onStart();
        transition.handle = timeline.addChannel({
          delay: timeline.getTime(),
          duration: transition.duration
        });
      }

      if (time >= duration) {
        transition.onEnd();
        this.remove(key);
      }
      propsInTransition[key] = lerp(fromValue, toValue, easing(time / duration));
    }

    return propsInTransition;
  }

  clear() {
    for (const key of this.transitions.keys()) {
      this.remove(key);
    }
  }
}
