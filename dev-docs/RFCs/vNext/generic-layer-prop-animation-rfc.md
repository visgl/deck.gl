# RFC: Generic Layer Prop Animation

* **Authors**: Xiaoji Chen
* **Date**: Sep 2018
* **Status**: **Draft**

References:
* [Animation Roadmap](/dev-docs/roadmaps/animation-roadmap.md)


## Abstract

This RFC proposes a new *Animation* class that expands the existing transition features to support keyframe-based animation. The goal is to offer a user-friendly API that is inspired by [CSS Animation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations) and [tween.js](https://github.com/tweenjs/tween.js/).

> This RFC assumes that property transition and attribute transition features are fully implemented.

## Code Example

Layers can accept an `Animation` instance provided to any prop:

```js
const elevationScaleAnimation = new Animation(0)
    .to({value: 100, time: 3000})
    .to({value: 0, time: 3000})
    .loop();

new HexagonLayer({
    ...
    elevationScale: elevationScaleAnimation
});
```

Attribute animation:

```js
const colorAnimation = new Animation([0, 0, 0, 0])
    .to({value: d => d.color, time: 3000});

new ScatterplotLayer({
    ...
    getColor: colorAnimation
});
```


## Proposal: Alternative to transitions and updateTriggers

To make this work, property and attribute transitions need to support an alternative way of supplying transitions and update triggers. Namely, from

```js
new ScatterplotLayer({
    ...
    radiusScale: 10,
    getColor: d => d.color,
    transitions: {
        radiusScale: {duration, easing},
        getColor: {duration, easing}
    },
    updateTriggers: {
        getColor: {color}
    }
});
```

To

```js
new ScatterplotLayer({
    ...
    radiusScale: {
        value: 10,
        transition: {duration, easing},
    },
    getColor: {
        value: d => d.color,
        transition: {duration, easing},
        updateTrigger: {color}
    }
});
```

This allows an animated prop to have full control of how its change is handled by the layer.


## Proposal: Animation Class

The instance will be evaluated to its runtime value using AnimationLoop's animation props.

Constructor:

```js
new Animation(startValue);
```

Methods:

- `to({value, time, [easing]})` - add a keyframe
  + `time` is relative to the starting time (first evaluation)
  + `easing` is an optional easing function
- `loop()` - restart from top when done
- `evaluate({time})` - get the current "leg" of the animation, in the form of `{value, transition: {duration, easing}, updateTrigger: {animationId}}`
- `isDone()` - returns `true` if animation is finished.


## Update Strategy and Performance

Currently, the `Deck` class requires the `_animation` prop being set to `true` to support animation. Because the `LayerManager` has no visibility into how the animated property callbacks behave, on every rendering frame, the animated properties must be re-evaluated.

With the proposed system, the `_animation` prop is no longer needed. `LayerManager` can check if any of the layer props is an unfinished `Animation`. This will result in a cleaner API, and perf gains by avoid excessive layer updates when the animations are done.

