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

animate();

export default {
  Easing: TWEEN.Easing,
  ease
};
