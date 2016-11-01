import TWEEN from 'tween.js';

let viewportTween;

function animate() {
  TWEEN.update();
  requestAnimationFrame(animate);
}

// get a linear tween
function ease(fromState, toState, duration) {
  return new TWEEN.Tween(fromState).to(toState, duration);
}

// fly to new viewport
function fly(fromViewport, toViewport, duration, onUpdate) {
  const fromState = {};
  const nanState = {};
  const toState = {};

  Object.keys(toViewport).forEach(key => {
    const v0 = fromViewport[key];
    const v1 = toViewport[key];
    if (isNaN(v0) || isNaN(v1)) {
      nanState[key] = v1;
    } else {
      fromState[key] = v0;
      toState[key] = v1;
    }
  });

  if (viewportTween) {
    TWEEN.remove(viewportTween);
  }

  viewportTween = new TWEEN.Tween(fromState)
    .to(toState, duration)
    .onUpdate(function() {
      onUpdate({...this, ...nanState});
    });

  return viewportTween;
}

export default {
  init: animate,
  Easing: TWEEN.Easing,
  ease,
  fly
};
