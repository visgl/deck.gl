# Animations and Transitions

deck.gl provides several built-in animation/transition features.

* **[Camera Transitions](#camera-transitions)** - the camera can move smoothly from the current view state to the new view state.
* **[Layer Prop Transitions](#layer-prop-transitions)** - when a layer prop is updated, it may animate from the old value to the new value.

Advanced motion effects can also be implemented using deck.gl in conjunction with other animation libraries, see the [custom animations](#custom-animations) section.

## Camera Transitions

Camera transitions provide smooth and visually appealing transitions when `viewState` change from one state to the other.

Transitions are performed when setting `Deck`'s `viewState` or `initialViewState` prop to a new value with the following additional fields:

* `transitionInterpolator` (object, optional, default: `LinearInterpolator`) - An interpolator object that defines the transition behavior between two view states. The choices are:

  - [LinearInterpolator](../api-reference/core/linear-interpolator.md) - a generic interpolator that works with all view types. This is the default.
  - [FlyToInterpolator](../api-reference/core/fly-to-interpolator.md) - a "fly to" style camera transition for geospatial views. This is pretty useful when the camera center changes by long distance.
  - Implement a custom interpolator. See [TransitionInterpolator](../api-reference/core/transition-interpolator.md).

* `transitionDuration` (number | string, optional, default: 0) - Transition duration in milliseconds, default value 0, implies no transition.
When using `FlyToInterpolator`, it can also be set to `'auto'` where actual duration is calculated based on the distance between the start and end states, and the `speed` option.
* `transitionEasing` (Function, optional, default: `t => t`) - Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. ([list of sample easing functions](http://easings.net))   
* `transitionInterruption` (number, optional, default: `TRANSITION_EVENTS.BREAK`) - This field controls how to process a new view state change that occurs while performing an existing transition. This field has no impact once transition is complete. Here is the list of all possible values with resulting behavior.

    | `TRANSITION_EVENTS` | Result |
    | ---------------   | ------ |
    | `BREAK`             | Current transition will stop at the current state and next view state update is processed. |
    | `SNAP_TO_END`       | Current transition will skip remaining transition steps and view state is updated to final value, transition is stopped and next view state update is processed. |
    | `IGNORE`            | Any view state update is ignored until current transition is complete, this also includes view state changes due to user interaction. |

* `onTransitionStart` (Functional, optional) - Callback fires when requested transition starts.
* `onTransitionInterrupt` (Functional, optional) - Callback fires when transition is interrupted.
* `onTransitionEnd` (Functional, optional) - Callback fires when transition ends.


### Camera Transition Examples

This example provides `flyTo` style transition to move camera from current location to the requested city.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, FlyToInterpolator} from '@deck.gl/core';

const CITIES = {
  SF: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 10
  },
  NYC: {
    longitude: -74.0,
    latitude: 40.7,
    zoom: 10
  }
}

const deckInstance = new Deck({
  initialViewState: CITIES.SF,
  controller: true
});

for (const button of document.querySelectorAll('button')) {
  button.onclick = () => flyToCity(button.id);
}

function flyToCity(name) {
  deckInstance.setProps({
    initialViewState: {
      ...CITIES[name],
      transitionInterpolator: new FlyToInterpolator({speed: 2}),
      transitionDuration: 'auto'
    }
  })
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapViewState, FlyToInterpolator} from '@deck.gl/core';

const CITIES: {[name: string]: MapViewState} = {
  SF: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 10
  },
  NYC: {
    longitude: -74.0,
    latitude: 40.7,
    zoom: 10
  }
}

const deckInstance = new Deck({
  initialViewState: CITIES.SF,
  controller: true
});

for (const button of document.querySelectorAll('button')) {
  (button as HTMLButtonElement).onclick = () => flyToCity(button.id);
}

function flyToCity(name: string) {
  deckInstance.setProps({
    initialViewState: {
      ...CITIES[name],
      transitionInterpolator: new FlyToInterpolator({speed: 2}),
      transitionDuration: 'auto'
    }
  })
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState, FlyToInterpolator} from '@deck.gl/core';

const CITIES: {[name: string]: MapViewState} = {
  SF: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 10
  },
  NYC: {
    longitude: -74.0,
    latitude: 40.7,
    zoom: 10
  }
}

function App() {
  const [initialViewState, setInitialViewState] = useState<MapViewState>(CITIES.SF);

  const flyToCity = useCallback(evt => {
    setInitialViewState({
      ...CITIES[evt.target.id],
      transitionInterpolator: new FlyToInterpolator({speed: 2}),
      transitionDuration: 'auto'
    });
  }, [])

  return <>
    <DeckGL
      initialViewState={initialViewState}
      controller
    />;
    {Object.keys(CITIES).map(name => <button id={name} onClick={flyToCity}>{name}</button>)}
  </>;
}
```

  </TabItem>
</Tabs>

This example continuously rotates the camera along the Z (vertical) axis until user interrupts the rotation by dragging. It uses `LinearInterpolator` and restricts transitions to `bearing`. Continuous transitions are achieved by triggering new transitions upon the `onTransitionEnd` callback.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, LinearInterpolator} from '@deck.gl/core';

let initialViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12
};

const deckInstance = new Deck({
  initialViewState,
  controller: true,
  onLoad: rotateCamera
});

function rotateCamera() {
  initialViewState = {
    ...initialViewState,
    bearing: initialViewState.bearing + 120,
    transitionDuration: 1000,
    transitionInterpolator: new LinearInterpolator(['bearing']),
    onTransitionEnd: rotateCamera
  };
  deckInstance.setProps({initialViewState});
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, LinearInterpolator, MapViewState} from '@deck.gl/core';

let initialViewState: MapViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12
};

const deckInstance = new Deck({
  initialViewState,
  controller: true,
  onLoad: rotateCamera
});

function rotateCamera(): void {
  initialViewState = {
    ...initialViewState,
    bearing: initialViewState.bearing + 120,
    transitionDuration: 1000,
    transitionInterpolator: new LinearInterpolator(['bearing']),
    onTransitionEnd: rotateCamera
  };
  deckInstance.setProps({initialViewState});
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {LinearInterpolator, MapViewState} from '@deck.gl/core';

function App() {
  const [initialViewState, setInitialViewState] = useState<MapViewState>({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  });

  const rotateCamera = useCallback(() => {
    setInitialViewState(viewState => ({
      ...viewState,
      bearing: viewState.bearing + 120,
      transitionDuration: 1000,
      transitionInterpolator: new LinearInterpolator(['bearing']),
      onTransitionEnd: rotateCamera
    }));
  }, []);

  return <DeckGL
    initialViewState={initialViewState}
    controller
    onLoad={rotateCamera}
  />;
}
```

  </TabItem>
</Tabs>


### Remarks

Deck's view state transition model is "set and forget": the values of the following props at the start of a transition carry through the entire duration of the transition:

+ `transitionDuration`
+ `transitionInterpolator`
+ `transitionEasing`
+ `transitionInterruption`

The default transition behavior can always be intercepted and overwritten in the handler for `onViewStateChange`. However, if a transition is in progress, the properties that are being transitioned (e.g. longitude and latitude) should not be manipulated, otherwise the change will be interpreted as an interruption of the transition.


## Layer Prop Transitions

Layer properties may smoothly transition from one value to the next if a [transitions](../api-reference/core/layer.md#transitions) prop is configured. There are two categories of transition-enabled props, for each enabling transition has different implications regarding performance and complexity.

- Uniform prop (usually of type `number` or `number[]`) transition is performed on the CPU. It only recomputes one single numeric value per update, and imposes virtually no cost on top of redrawing on each animation frame.
- Attribute prop (usually named `get*`) transition is performed on the GPU. Since it recomputes values for `attribute_size * data_length` numbers, the ammount of data being updated per frame can be quite large for a big dataset. For example, animating the position of 1M point cloud involves 3M float64 or 6M float32 numbers. Performing the computation on the GPU means that they can be updated efficiently in parallel and without leaving the GPU memory. However, when such a transition is first triggered, some of the preparation is done on the CPU (specifically the `enter` callback), and it could potentially be expensive. See more discussions below.

To enable layer prop transitions, set the layer's `transitions` prop to an object that defines animation parameters by using the prop names as keys. The following example has the columns "grow" from the ground when data is loaded:


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

const deckInstance = new Deck({
  // ...
  layer: getLayers(null)
});

const resp = await fetch('/path/to/data.json');
const data = await resp.json();
deckInstance.setProps({
  layer: getLayers(data)
});

function getLayers(data) {
  return [
    new HexagonLayer({
      id: '3d-heatmap',
      data,
      getPosition: d => [d.longitude, d.latitude],
      getElevationWeight: d => d.count,
      extruded: true,
      elevationScale: data && data.length ? 50 : 0,
      transitions: {
        elevationScale: 3000
      }
    })
  ];
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

type DataType = {
  longitude: number;
  latitude: number;
  count: number;
};

const deckInstance = new Deck({
  // ...
  layer: getLayers(null)
});

const resp = await fetch('/path/to/data.json');
const data = await resp.json() as DataType[];
deckInstance.setProps({
  layer: getLayers(data)
});

function getLayers(data: DataType[] | null) {
  return [
    new HexagonLayer<DataType>({
      id: '3d-heatmap',
      data,
      getPosition: (d: DataType) => [d.longitude, d.latitude],
      getElevationWeight: (d: DataType) => d.count,
      extruded: true,
      elevationScale: data && data.length ? 50 : 0,
      transitions: {
        elevationScale: 3000
      }
    })
  ];
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

type DataType = {
  longitude: number;
  latitude: number;
  count: number;
};

function App() {
  const [data, setData] = useState<DataType[] | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await fetch('/path/to/data.json');
      const data = await resp.json() as DataType[];
      setData(data);
    })();
  }, []);

  const layers = [
    new HexagonLayer<DataType>({
      id: '3d-heatmap',
      data,
      getPosition: (d: DataType) => [d.longitude, d.latitude],
      getElevationWeight: (d: DataType) => d.count,
      extruded: true,
      elevationScale: data && data.length ? 50 : 0,
      transitions: {
        elevationScale: 3000
      }
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

  </TabItem>
</Tabs>


In the `transitions` object, each prop name is mapped to a number or an object that is the transition setting. As a shorthand, if a prop name maps to a number, then the number is assigned to the `duration` parameter with an `interpolation` type transition. If an object is supplied, it may contain the following fields:

| Key           | Type       | Default     | Description |
| ------------- | --------   | ----------- | ----------- |
| `type`        | string   | `'interpolation'` | Type of the transition, currently supports `'interpolation'` and `'spring'` |
| `enter`       | Function | `value => value` | Callback to get the value that the entering vertices are transitioning from. See "attribute backfilling" below |
| `onStart`     | Function | `null`      | Callback when the transition is started |
| `onEnd`       | Function | `null`      | Callback when the transition is done |
| `onInterrupt` | Function | `null`      | Callback when the transition is interrupted |

- Additional fields for `type: 'interpolation'`:

    | Key           | Type       | Default     | Description |
    | ------------- | --------   | ----------- | ----------- |
    | `duration`    | `Number`   | `0`         | Duration of the transition animation, in milliseconds |
    | `easing`      | `(t: number) => number` | `t => t` | Easing function that maps a value from [0, 1] to [0, 1], see [http://easings.net/](http://easings.net/) |

- Additional fields for `type: 'spring'`:

    | Key           | Type       | Default     | Description |
    | ------------- | --------   | ----------- | ----------- |
    | `stiffness`   | `Number`   | `0.05`      | "Tension" factor for the spring |
    | `damping`     | `Number`   | `0.5`       | "Friction" factor that counteracts the spring's acceleration |


### Attribute Backfilling 

Consider the following setup, a `ScatterplotLayer` with `transitions` enabled for positions and fill colors:

```ts
import {ScatterplotLayer} from '@deck.gl/layers';
import type {Color} from '@deck.gl/core';

new ScatterplotLayer({
  // ...
  transitions: {
    getPosition: {
      type: 'spring',
      damping: 0.2
    },
    getFillColor: {
      duration: 600,
      easing: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2, // ease-in-out-sine
      entry: ([r, g, b]: Color) => [r, g, b, 0]
    }
  }
});
```

When the layer's data updates from 3 elements to 4 elements, positions and colors also changed:

| Object index | Old `getPosition` result | New `getPosition` result | Old `getFillColor` result | New `getFillColor` result |
|--|----|----|----|----|
| 0 | [0, 0, 0] | [0, 3, 0] | [255, 0, 0, 255] | [255, 255, 0, 255] |
| 1 | [1, 0, 0] | [0, 0, 0] | [0, 255, 0, 255] | [255, 0, 0, 255] |
| 2 | [2, 0, 0] | [1, 0, 0] | [0, 0, 255, 255] | [0, 255, 0, 255] |
| 3 | - | [2, 0, 0] | - | [0, 0, 255, 255] |

* For index 0-2, transitions are performed from the old values to the new values at the same index. 
* Because the new data is larger, `enter` callback is called at index 3 to backfill the position and color to transition from. The first argument is the "to" value. For position, the default `enter` returns `[2, 0, 0]` (same value), which will look like the new circle just appeared in place. For color, the user-supplied `enter` returns `[0, 0, 255, 0]` (same RGB and alpha=0), which will look like the new circle faded in.

When working with variable-length geometries, such as `PathLayer` and `PolygonLayer`, transitions are handled per geometry (path or polygon). For each geometry, transitions are performed between the old and new values at the same vertex index. If the new path/polygon has more vertices, `enter` is called to backfill the "from" value. In this case, `enter` also receives a second argument `fromChunk` representing the "from" value of the entire geometry.

The process of attribute backfilling may be expensive performance-wise because it calls `enter` for each index on the CPU, then upload the new data to the GPU. It only happens when data size/vertex count is growing.

### Limitations

Between updates, objects are identified by their index in the `data` array. This means that if objects are inserted or removed, the transition will not look as expected. There is [an open feature request](https://github.com/visgl/deck.gl/issues/2570) for supporting custom object id.


## Custom Animations

The most powerful way to create animations with deck.gl is to manage data and settings externally, and update the layers' props on every frame.

The following example shows the [TripsLayer](../api-reference/geo-layers/trips-layer.md)'s `currentTime` prop animated by the [popmotion](https://popmotion.io/) library:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {animate} from "popmotion";

const currentTimeAnimation = animate({
  from: 0, // currentTime min value
  to: 1800, // currentTime max value
  duration: 5000, // over the course of 5 seconds
  repeat: Infinity,
  onUpdate: updateLayers
});

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true
});

function updateLayers(currentTime) {
  const layers = [
    new TripsLayer({
      id: 'TripsLayer',
      data: '/path/to/data.json',
      getPath: d => d.waypoints.map(p => p.coordinates),
      getTimestamps: d => d.waypoints.map(p => p.timestamp),
      getColor: [253, 128, 93],
      getWidth: 50,

      currentTime,
      trailLength: 600
    })
  ];

  deckInstance.setProps({layers});
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {animate} from "popmotion";

const currentTimeAnimation = animate<number>({
  from: 0, // currentTime min value
  to: 1800, // currentTime max value
  duration: 5000, // over the course of 5 seconds
  repeat: Infinity,
  onUpdate: updateLayers
});

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true
});

type TripData = {
  coordinates: [longitude: number, latitude: number][];
  timestamps: number[];
};

function updateLayers(currentTime: number) {
  const layers = [
    new TripsLayer<TripData>({
      id: 'TripsLayer',
      data: '/path/to/data.json',
      getPath: (d: TripData) => d.waypoints.map(p => p.coordinates),
      getTimestamps: (d: TripData) => d.waypoints.map(p => p.timestamp),
      getColor: [253, 128, 93],
      getWidth: 50,

      currentTime,
      trailLength: 600
    })
  ];

  deckInstance.setProps({layers});
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useEffect} from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {animate} from "popmotion";

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12
};

type TripData = {
  coordinates: [longitude: number, latitude: number][];
  timestamps: number[];
};

function App() {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const currentTimeAnimation = animate<number>({
      from: 0, // currentTime min value
      to: 1800, // currentTime max value
      duration: 5000, // over the course of 5 seconds
      repeat: Infinity,
      onUpdate: setCurrentTime
    });
    return () => currentTimeAnimation.stop();
  });

  const layers = [
    new TripsLayer<TripData>({
      id: 'TripsLayer',
      data: '/path/to/data.json',
      getPath: (d: TripData) => d.waypoints.map(p => p.coordinates),
      getTimestamps: (d: TripData) => d.waypoints.map(p => p.timestamp),
      getColor: [253, 128, 93],
      getWidth: 50,

      currentTime,
      trailLength: 600
    })
  ];

  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller
    layers={layers}
  />;
}
```

  </TabItem>
</Tabs>

Deck.gl is designed to handle layer updates very efficiently at high frame rate. An example of this kind of application is [autonomous vehicle visualization](https://avs.auto), where car pose, LIDAR point clouds, camera imagery, as well as geometries outlining perception, prediction and planning decisions are streamed in from a server many times a second. The [performance guide](./performance.md) describes various techniques in optimizing for large datasets and frequent updates.

[hubble.gl](https://hubble.gl/), a project by the vis.gl community, implements comprehensive keyframe-controlled animation of deck.gl layers for interactive storytelling and/or render to video.
