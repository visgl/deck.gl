# RFC: Spring-Based Transitions

* **Authors**: Taylor Baldwin
* **Date**: July 2019
* **Status**: **Draft**


## Abstract

As previous animation- and transition-related RFCs have pointed out, easy-to-use animation /
transition systems are often-requested features. This RFC proposes, as an alternative to the
existing interpolation-based transition system, a physics-based method using parameterized springs.


## Background

The existing interpolation-based transition API allows users to define transitions much like you'd
define one with CSS. Given a duration and  easing method, the transition system will interpolate
between a `from` value and a `to` value. For natural-looking transitions, an easing method (e.g.
`ease-in-out`) is often used to make the animating object or value appear to accelerate and
decelerate, maintaining some sense of momentum, as moving objects tend to do in the real world.
Interrupting these transitions can break this illusion, however, as the object's position at the
time of interruption then becomes the new `from` value for a new transition. The object often
abrubtly changes its direction and speed as it suddenly jumps to the beginning of the new
transition's easing curve. Physics-based animations, like the spring-based transition system
proposed here, can get around this problem by maintaining an animating value's "momentum".


## About spring-based transitions

This RFC proposes one specific kind of physics-based transition adapted from [Hooke's law](https://en.wikipedia.org/wiki/Hooke%27s_law)
for describing the movements of springs. A spring-based transition system defines a transition
with two parameters: `stiffness` and `damping`. Spring-based transition systems generally model an
animating value as a spring which pulls towards the `to` value (i.e. the spring's resting state) by
a `stiffness` factor, the force of which is countered by "friction" (i.e. the inverse of the
animating value's velocity scaled by a `damping` factor). This is the logic for each tick, in pseudocode:

```
distance_to_destination = destination_value - current_value
velocity = current_value - previous_value
acceleration = distance_to_destination * stiffness - velocity * damping
next_value = current_value + velocity + acceleration
```

It's important to note that spring-based transition systems are useful primarily because they can make
animations more natural-looking (e.g. transitions may be interrupted without abrupt changes in speed
or direction, etc) and *not* because they can make "springy" animation visuals. (One can select
`stiffness` and `damping` parameters which do not result in "springy" animations.)


## Approach

The current transition API has the user passing a `transitions` property to the layer. This property
is an `Object` which contains a transition config for each attribute name/accessor which should enable
transitions between values. Each transition config contains `duration`, `easing`, and `enter`
values/getters to be used for interpolating the transitioning value during a render. An example:


```js
new Layer({
  transitions: {
    getPositions: 600,
    getColors: {
      duration: 300,
      easing: d3.easeCubicInOut,
      enter: value => [value[0], value[1], value[2], 0], // fade in
      onStart: () => {},
      onEnd: () => {},
      onInterrupt: () => {}
    }
  }
});
```

A spring-based transition, by contrast, accomplishes a transition in an attribute's value not by
interpolation but by using a physics simulation which, in any given frame, relies on (1) the
property's current value, (2) the property's current velocity, and (3) the value the property is
animating towards. The configuration for a spring-based simulation is made up of two constants
which define how the spring moves, namely, `stiffness` and `dampening`. These constants (or sensible
defaults) will need to be provided for each attribute which uses a spring-based transition. An API
for setting such a config could look like this:

```js
new Layer({
  transitions: {
    getPositions: {
      spring: {
        type: 'spring',
        stiffness: 0.001,
        dampening: 0.05
      }
    },
    getColors: {
      spring: {
        type: 'spring',
        stiffness: 0.001,
        dampening: 0.05
      },
      enter: value => [value[0], value[1], value[2], 0], // fade in
      onStart: () => {},
      onEnd: () => {},
      onInterrupt: () => {}
    }
  }
});
```

Note the addition of the `type` field which may be either `'spring'`, for spring transitions, or `'interpolation'`,
for the existing interpolation-based transitions. If no `type` is given, `'interpolation'` is used by default.

## Implementation

Spring animation logic can be fairly simple. Here's an example (Note: this is not the proposed API, which can be found in the "Approach" section):

```js
function createSpring (stiffness, damping, initialValue) {
  let currentValue = initialValue
  let previousValue = initialValue
  return function tick (destinationValue) {
    const velocity = currentValue - previousValue
    const distanceToDestination = destinationValue - currentValue
    const acceleration = distanceToDestination * stiffness - velocity * damping
    const nextVal = currentValue + velocity + acceleration
    previousValue = currentValue
    currentValue = nextVal
    return nextVal
  }
}
```

This requires the user to provide three values when defining the transition, `stiffness`, `damping`, and
`initialValue` (i.e. `enter`), and a `destinationValue` on each tick. The library is then responsible for
maintaining the current and previous values, from which it derives the velocity.

For scalar uniforms, performing the transition on the CPU is as simple as the above example. Not much extra
work is required to make this support vec2, vec3, and vec4 values. An `isAtDestination` function, which returns
`true` when the `distance_to_destination` and `length(velocity)` are below some threshold, could be used to
fire the `onEnd` callback and to stop the animation when the destination has been reached (though the
calculation has such low overhead, I might be inclined to just run it on every frame).

For attributes, the transition should be performed in a transform feedback pass. Three buffers are required to
maintain the animating state: two read buffers for the `currentValue`s and `previousValue`s and one write buffer
for the `nextValue`s. On each frame, the buffers are rotated. In other words: the `nextValue` buffers can become
the `currentValue`, and the `currentValue` buffers can become the `previousValue`. This then frees up the
`previousValue` buffers to be used as the write buffers for the `nextValue`s. The attribute buffers as they exist
in the current implementation can become the `to` (or `destinationValue`) buffers.
