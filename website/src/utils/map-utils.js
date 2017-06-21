/* global window */
import TWEEN from '@tweenjs/tween.js';

let viewportTween;

const animate = () => {
  TWEEN.update();
  window.requestAnimationFrame(animate);
};

// get a linear tween
const ease = (fromState, toState, duration) =>
  new TWEEN.Tween(fromState).to(toState, duration);

// fly to new viewport
const fly = (fromViewport, toViewport, duration, onUpdate) => {
  const fromState = {};
  const nanState = {};
  const toState = {};

  Object.keys(toViewport).forEach(key => {
    const v0 = fromViewport[key];
    const v1 = toViewport[key];
    if (Number.isFinite(v0) && Number.isFinite(v1)) {
      fromState[key] = v0;
      toState[key] = v1;
    } else {
      nanState[key] = v1;
    }
  });

  if (viewportTween) {
    TWEEN.remove(viewportTween);
  }

  viewportTween = new TWEEN.Tween(fromState)
    .to(toState, duration)
    .onUpdate(function update() {
      onUpdate({...this, ...nanState}); // eslint-disable-line no-invalid-this
    });

  return viewportTween;
};

export default {
  init: animate,
  Easing: TWEEN.Easing,
  ease,
  fly
};
