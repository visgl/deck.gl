# RFC: Viewport Animation

* **Authors**: Ravi Akkenapally
* **Date**: Aug 2017
* **Status**: **Draft**


## Motivation:

Deck.gl and react-map-gl frameworks support rendering data that can be visualized in a 3d world. There are several use cases where a user needs to change camera orientation or move the camera from point A to point B. Deck.gl and react-map.gl API provides a `viewport` prop, when user changes the `viewport` prop, the camera will jump to the new location/orientation and scene will up updated immediately, this behavior is not visually appealing  and could also confuse the user. One solution to this problem is, provide an API for animation, that gives a smooth visual transition for the user. Such an API can also be extended to build custom flyover style animation where camera is animated over given set of points.

## Problem statement:

With current API user can set a viewport on DeckGL (deck.gl) and StaticMap (react-map-gl) component directly, but to provide animation support, we need a single component that lives above these two components in React hierarchy and provides animated viewport values to both components.

## AnimationMapController:

We support viewport animation by providing new controller component, `AnimationMapController`, it takes `viewport` as a prop, maintains animation state and provides animated viewport to its children (DeckGL and MapGL). Additional props that control animation are discussed below.

When any of the following viewport props are changed, the change is animated over a specified time with specified easing. Viewport props that are animated are, 'longitude', 'latitude', 'zoom', 'bearing', and 'pitch'.

### Component hierarchy:

In a react application following hierarchy should be used :

When rendering deck.gl layers on top of Mapbox map.
```js
      <AnimationMapController
         {...viewport}
         // Any other AnimationMapController props
         <StaticMap
            {...viewport}
            // Any other StaticMap props
           <DeckGL
              {...viewport}
          	  // Any other DeckGL props
            </DeckGL>
         </StaticMap>
      </AnimationMapController>
```

When rendering deck.gl layers without map.
```js
      <AnimationMapController
         {...viewport}
         // Any other AnimationMapController props
         <DeckGL
            {...viewport}
          	// Any other DeckGL props
          </DeckGL>
      </AnimationMapController>
```

### Animation props:

Following props of AnimationMapController can be used to control the animation :

animateViewport : (bool) Flag to control viewport animation. Viewport props are animated when this flag is true, default value is false.
viewportAnimationDuration: (Number) Animation duration in milliseconds, default value is 5000

1. **animationDuration** {Number, default: 0} : Animation duration in milliseconds, default value disables animation.

2. **animationEasing** {Function, default: t => t} : Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. (list of sample easing functions: http://easings.net/)

3. **animationInterpolator** {Function, default: `viewportLinearAnimation`} : Function that gets called for each animation step to calculated animated viewport. It takes start, end viewports and animation step, returns animated viewport. We provide couple of utility functions, `viewportLinearAnimation` and `viewportFlyToAnimation`. By default `viewportLinearAnimation` is used where all viewport props are linearly animated. `viewportFlyToAnimation` animates viewports similar to MapBox `flyTo` API, this is pretty useful when camera center changes. But a user can provide any function for this prop to perform custom viewport animations.

4. **onAnimationInteruption** {ANIMATION_EVENTS (Number), default: BREAK} : This props controls how to process a new viewport change while it is still animating current change. This prop has no impact once animation is complete. Here is the list of all possible values with resulting behavior.

| ANIMATION_EVENTS | Result |
| --------------- | ------ |
| BREAK           | Current animation will stop at the current viewport state and next viewport update is processed. |
| SNAP_TO_END     | Current animation will skip remaining animation steps and viewport is updated to final value, animation is stopped and next viewport update is processed. |
| IGNORE          | Any viewport update is ignored until this animation is complete, this also includes viewport changes due to user interaction. |

5. **onAnimationStop** {Function, optional} : This callback will be fired when requested animation is stopped. The object ({animationStep}) will be passed as an argument, which can be used to whether animation was interrupted or completed. This prop can be used to generate continuous animations, that loop animating between set of viewports.

## Open questions:

1. Should this be part of deck.gl or react-map-gl ?
