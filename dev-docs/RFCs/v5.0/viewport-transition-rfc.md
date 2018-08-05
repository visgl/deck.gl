# RFC: Viewport Transition

* **Authors**: Ravi Akkenapally
* **Date**: Aug 2017
* **Status**: **Implemented**


## Motivation:

Deck.gl and react-map-gl frameworks support rendering data that can be visualized in a 3d world. There are several use cases where a user needs to change camera orientation or move the camera from point A to point B. Deck.gl and react-map.gl API provides a `viewport` prop, when user changes the `viewport` prop, the camera will jump to the new location/orientation and scene will up updated immediately, this behavior is not visually appealing  and could also confuse the user. One solution to this problem is, provide an API for viewport transition, that gives a smooth visual transition for the user. Such an API can also be extended to build custom flyover style animation where camera is transitioned over given set of points.

## Problem statement:

With current API user can set a viewport on DeckGL (deck.gl) and StaticMap (react-map-gl) component directly, but to provide animation support, we need a single component that lives above these two components in React hierarchy and provides animated viewport values to both components.

## Viewport Transition:

Viewport transition functionality will be added to `ViewportController` component using a set of props and a new pure Javascript class `TransitionManager`.

`ViewportController` takes all viewport parameters and additional transition props, for each render cycle gets transitioned viewport from `TransitionManager` and updates viewport props of all applicable children (DeckGL and MapGL).

For each viewport change, if a transition is requested, `TransitionManager` takes old and new props, interpolates the viewport and updates `ViewportController` using a callback.


### Transition props:

Following props of ViewportController can be used to control the animation :

1. **transitionDuration** {Number, default: 0} : Transition duration in milliseconds, default value 0, implies no transition.

2. **transitionEasing** {Function, default: t => t} : Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. (list of sample easing functions: http://easings.net/)
3. **transitionInterpolator** {Object, default: `LinearInterpolator`} : An interpolator object that defines the transition behavior between two viewports. We provide two interpolators, `LinearInterpolator` and `FlyToInterpolator`. By default `LinearInterpolator` is used where all viewport props are linearly animated. `FlyToInterpolator` animates viewports similar to MapBox `flyTo` API, this is pretty useful when camera center changes by long distance. But a user can provide any function for this prop to perform custom viewport interpolations.

4. **transitionInteruption** {TRANSITION_EVENTS (Number), default: BREAK} : This props controls how to process a new viewport change when the current transition is still active. This prop has no impact once transition is complete. Here is the list of all possible values with resulting behavior.

| TRANSITION_EVENTS | Result |
| --------------- | ------ |
| BREAK           | Current transition will stop at the current viewport state and next viewport update is processed. |
| SNAP_TO_END     | Current transition will skip remaining transition steps and viewport is updated to final value, transition is stopped and next viewport update is processed. |
| IGNORE          | Any viewport update is ignored until this transition is complete, this also includes viewport changes due to user interaction. |

5. **onTransitionStart** {Function, optional} : This callback will be fired when requested transition starts.

6. **onTransitionInterrupt** {Function, optional} : This callback will be fired when a current transition is interrupted by another update.

7. **onTransitionEnd** {Function, optional} : This callback will be fired when requested transition ends without any interruption. This prop can be used to generate continuous animations in a loop, that animate between set of viewports.

8. **onViewportChange** {Function} : Callback that is fired for each viewport update during transition. The object passed to the callback contains viewport properties such as
`longitude`, `latitude`, `zoom` etc.
