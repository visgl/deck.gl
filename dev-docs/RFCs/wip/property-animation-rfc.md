# RFC: Animation Support in deck.gl

* **Authors**: Ib Green, ...
* **Date**: Aug 2017
* **Status**: Early draft, not ready for formal review.


## Ideas

The topic of animation is quite complex. There are many ways animnation can be implemented and facilitated, and people often expect different things. Some examples are:

* Time based animation - layers respond to time, often "pulsating or undulating" through calling a sine or similar function.
* Interpolation based animation - application sets a new state on layers, and they gradually adapt their visuals over time
* Interpolation of uniforms...
* Interpolation of gl parameters...
* interpolation of attributes...
* Support for "Easings" - interpolate values at non-constant speed

* Automatic animation as result of user interaction
* Declarative setup
* Limited impact on application structure


## Detailed Requirements

## Background

In deck.gl v4.1:
* layers are only redrawn when the dirty flag of at least one layer is set, or when the viewport changes.
* layer dirty flags are only set when new layers are actually provided by the application (which typically happens when application state changes).

For time based


## Proposals

### Proposal: Support time-based animation

Animation that is not driven by property updates.

Layers can mark themselves as animated. The layers that are marked as animated will be updated every *browser animation frame* (i.e. 60 times per second), even if the application has not created layers with new props.



Question: Call `updateState` every frame, or provide a new function life cycle function `animateState` to allow for optimized treatment of the animation case?


### Proposal: Layer props can be functions (in addition to constant values)

The individual functions would take a context parameter (see the luma.gl [AnimationLoop](https://uber.github.io/luma.gl/#/documentation/api-reference/animation-loop) for a good reference on how this would work).

```js
const layer = new Layer {
  radius: ({tick}) => Math.sin(tick * 0.1),
  color: ({tick}) => [128, 128, tick % 255, 255]
}
```

Animating the `modelMatrix` `prop` could be very powerful, 


### Proposal: Layer `parameters` can also be functions (in addition to constant values)

WebGL parameters could also be "animated" just like other props.

const layer = new Layer {
  radius: ({tick}) => Math.sin(tick * 0.1),
  color: ({tick}) => [128, 128, tick % 255, 255]
}




### Proposal: Layer accessors can be constant values (in additions to functions)

NOTE: This is really an "anti-animation" feature but kind of fits with some of the other overloads to the attribute

This would allow for a nice optimization where a vertex attribute could simply be set to a single value (using a so called “generic vertex attribute” from luma.gl)

Assuming we keep accessors, allowing an accessor to be set to a value instead of a function could be a nice way to enable generic vertex attributes. I.e.
```js
   new Layer({getColor: x => [255, 0, 0]}) // would create a full array/WebGLBuffer with colors, each set to [255, 0, 0], just like today
```
while
```js
   new Layer({getColor: [255, 0, 0]}) // would set a generic vertex attribute (one value shared by all verts, not allocating any array/buffers at all)
```

Likewise:
```js
  new Layer({color: [255, 0, 0]}) - would set the uniform once, as today
```
while
```js
  new Layer({color: ({tick}) => [tick % 255, 0, 0]}) - would activate animation of this layer and update this prop every frame with an incremented tick value.
```


### Proposal: Deep-equal on short arrays?

A big complication with reactive 3D programming in JavaScript, is short arrays (representing colors, positions, normals etc) are very common “primitive” objects. Even if two arrays contain the same values, they will not compare as equal using default shallow comparisons.

These failed comparisons trigger updates of the reactive state (needlessly resetting uniforms or even recalculating attributes) which hurt performance.

So an app would have to be careful to supply the same array every render to avoid triggering an update. E.g. this innocent looking code:

```js
new Layer({
  color: [255, 0, 0]
});
```

will trigger an update on every render.

Changing this would require special equality handling for different type of props - and it feels like this could lead to a lot of extra complexity (React certainly appears to have avoided it), but maybe it is worth it?

Proposals:
Check values and if they are arrays with length <=4 do deep comparisons, otherwise shallow.
+ Simple to implement and use, would automatically cover most cases.
- Could have unintended side effects for (rare) longer arrays (data is already handle separately)
- Makes already confusing reactive shallow equality priniciple even harder to teach.
Introduce a prop type system in which a layer can declare certain props as Vector2, Vector3, Vector4. Use deep equality for those.
+ we could also do optional type checking like react
const propTypes = {
   getColor: Props.Vector4,
   getPosition: Props.Vector3
};
