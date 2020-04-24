# Viewport Transition Interpolator Class RFC

## Motivation

Users may want to make slight modifications to the behavior of a built-in interpolator without writing too much code.

### Example Use case

`viewportLinearInterpolator` transitions all of `latitude`, `longitude`, `zoom`, `pitch` and `bearing`. During viewport transition, an application only wants to interpolate a subset of the props (e.g. `pitch` and `bearing`).

### Problems in the Current Solution

The solution introduced in [PR1111](https://github.com/visgl/deck.gl/pull/1111) added a new prop `transitionProps` to the viewport controller. Unfortunately, this introduced new issues. `FlyToInterpolator` and `viewportLinearInterpolator` require different `transitionProps`. `FlyToInterpolator` requires `width` and `height` to be included to calculate the transition correctly. `viewportLinearInterpolator` by default leaves out `width` and `height` to avoid expensive updates to the canvas size. Current multi-viewport implementation also makes width and height unavailable to the Viewport class as they are calculated outside of viewport. Therefore, significant knowledge regarding the specific interpolator classes is required for user to provide valid values to viewport controller and providing a good default value for `transitionProps` also becomes a challenge. Failing to conform to the hidden requirement of `transitionProps` will cause the application to break (`FlyToInterpolator` checks the extracted viewport, which is set by `transitionProps`, and throws an error if any required field is missing).

Another concern is that `transitionProps` is specific to `viewportLinearInterpolator`. We may encounter other use cases in the future. Adding a new prop every time will make the API more cluttered, harder to debug, and affect existing applications and interpolators in unintended ways.


## Proposal

There are 3 key steps in TransitionManager that define the transition behavior:
- *compare viewports* - determines whether a new transition should be triggered. 
- *extract viewport* - saves start and end viewports for use in the interpolation.
- *interpolate viewport* - given the start and end viewports and a time factor between `[0, 1]`, outputs the viewport props in transition.

This RFC proposes:
1. Add a `ViewportTransitionInterpolator` class that has the following methods:
    - `areViewportsEqual(startViewport, endViewport)`
    - `extractViewportFromProps(props)`
    - `interpolateViewports(startViewport, endViewport, t)`

2. Change the current controller prop `transitionInterpolator` from a function to an instance of `ViewportTransitionInterpolator`. Remove the `transitionProps` prop.

3. Replace the experimental exports `viewportLinearInterpolator` and `FlyToInterpolator` with classes `ViewportLinearInterpolator` and `FlyToInterpolator` that extend `ViewportTransitionInterpolator`. To use them, the user would supply:

```
<MapController transitionInterpolator={new FlyToInterpolator()} />
```

An interpolator class may also offer further customization:

```
<MapController transitionInterpolator={new ViewportLinearInterpolator(TRANSITION_PROPS)} />
```


## Benefits

1. The proposed `ViewportTransitionInterpolator` class abstracts away two existing props that have dependency on each other. It will also help keep the API stable as we add new customization features in the future.

2. Once this proposal is implemented, `TransitionManager` should be completely viewport agnostic. In time, we will be able to provide new `ViewportTransitionInterpolator` classes to handle transition of first-person or non-geospatial viewports.

