# View State Transitions

View state transitions provide smooth and visually appealing transitions when ViewState change from one state to the other.

Transitions are supported by adding the following fields when setting `Deck`'s `viewState` or `initialViewState` prop:

* `transitionDuration` (Number|String, optional, default: 0) - Transition duration in milliseconds, default value 0, implies no transition.
When using `FlyToInterpolator`, it can also be set to `'auto'` where actual duration is auto calculated based on start and end viewports and is linear to the distance between them. This duration can be further customized using `speed` parameter to `FlyToInterpolator` constructor.
* `transitionEasing` (Function, optional, default: `t => t`) - Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. (list of sample easing functions: <http://easings.net/>)
* `transitionInterpolator` (Object, optional, default: `LinearInterpolator`) - An interpolator object that defines the transition behavior between two viewports, deck.gl provides `LinearInterpolator` and `FlyToInterpolator`. Default value, `LinearInterpolator`, performs linear interpolation on view state fields. `FlyToInterpolator` animates `ViewStates` similar to MapBox `flyTo` API and applicable for `MapState`, this is pretty useful when camera center changes by long distance. But a user can provide any custom implementation for this object using `TrasitionInterpolator` base class.    
* `transitionInterruption` (Enum, optional, default: `TRANSITION_EVENTS.BREAK`) - This field controls how to process a new view state change that occurs while performing an existing transition. This field has no impact once transition is complete. Here is the list of all possible values with resulting behavior.

| `TRANSITION_EVENTS` | Result |
| ---------------   | ------ |
| `BREAK`             | Current transition will stop at the current state and next view state update is processed. |
| `SNAP_TO_END`       | Current transition will skip remaining transition steps and view state is updated to final value, transition is stopped and next view state update is processed. |
| `IGNORE`            | Any view state update is ignored until current transition is complete, this also includes view state changes due to user interaction. |

* `onTransitionStart` (Functional, optional) - Callback fires when requested transition starts.
* `onTransitionInterrupt` (Functional, optional) - Callback fires when transition is interrupted.
* `onTransitionEnd` (Functional, optional) - Callback fires when transition ends.


## Usage

Sample code that provides `flyTo` style transition to move camera from current location to NewYork city.

```js
import React, {useState, useCallback} from 'react';
import DeckGL, {FlyToInterpolator} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

function App() {
  const [initialViewState, setInitialViewState] = useState({
    latitude: 37.7751,
    longitude: -122.4193,
    zoom: 11,
    bearing: 0,
    pitch: 0,
  });

  const goToNYC = useCallback(() => {
    setInitialViewState({
      longitude: -74.1,
      latitude: 40.7,
      zoom: 14,
      pitch: 0,
      bearing: 0,
      transitionDuration: 8000,
      transitionInterpolator: new FlyToInterpolator()
    })
  }, []);

  return (
    <div>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
      >
        <StaticMap />
      </DeckGL>

      <button onClick={goToNYC}>New York City</button>
    </div>
  );
}
```

Sample code to get continuous rotations along vertical axis until user interrupts by rotating the map by mouse interaction. It uses `LinearInterpolator` and restricts transitions for `bearing` prop. Continuous transitions are achieved by triggering new transitions using `onTranstionEnd` callback.

```js
import React, {useState, useCallback} from 'react';
import DeckGL from 'deck.gl';
import {StaticMap} from 'react-map-gl';

const transitionInterpolator = new LinearInterpolator(['bearing']);

function App() {
  const [initialViewState, setInitialViewState] = useState({
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  });

  const rotateCamera = useCallback(() => {
    setInitialViewState(viewState => ({
      ...viewState,
      bearing: viewState.bearing + 120,
      transitionDuration: 1000,
      transitionInterpolator,
      onTransitionEnd: rotateCamera
    }))
  }, []);

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller={true}
      onLoad={rotateCamera}
    >
      <StaticMap />
    </DeckGL>
  );
}
```

## Interpolators

The following interpolator classes are available out-of-the-box:

- [LinearInterpolator](/docs/api-reference/core/linear-interpolator.md) - a generic interpolator that works with all view types.
- [FlyToInterpolator](/docs/api-reference/core/fly-to-interpolator.md) - a "fly to" style camera transition for geospatial views.

You can also implement a custom interpolator. See [TransitionInterpolator](/docs/api-reference/core/transition-interpolator.md).


## Remarks

Deck's transition model is "set and forget": the values of the following props at the start of a transition carry through the entire duration of the transition:

+ `transitionDuration`
+ `transitionInterpolator`
+ `transitionEasing`
+ `transitionInterruption`

The default transition behavior can always be intercepted and overwritten in the handler for `onViewStateChange`. However, if a transition is in progress, the properties that are being transitioned (e.g. longitude and latitude) should not be manipulated, otherwise the change will be interpreted as an interruption of the transition.
