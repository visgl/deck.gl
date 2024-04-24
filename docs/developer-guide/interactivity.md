# Interactivity

## Controlling the Camera

Out of the box, deck.gl offers viewport controllers that map keyboard, mouse or touch input to camera state change. The easiest way to enable pan/zoom/rotate of the visualization is to set the `controller` prop on `Deck` or `<DeckGL>` to `true` along with an `initialViewState` object that defines the initial camera settings:


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

function App() {
  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller
  />;
}
```

  </TabItem>
</Tabs>

You can also selectively enable/disable certain controller features:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: {doubleClickZoom: false, touchRotate: true}
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
const deckInstance = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: {doubleClickZoom: false, touchRotate: true}
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller={{doubleClickZoom: false, touchRotate: true}}
  />;
```

  </TabItem>
</Tabs>


See [Controller](../api-reference/core/controller.md) for all options.


### Reset Camera Position

An application can reset the camera state by supplying a new `initialViewState` object at any time:

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


To learn more about animating a view state change, see [view state transitions](./animations-and-transitions.md#camera-transitions).


### Add Constraints to View State

An application can optionally supply the [onViewStateChange](../api-reference/core/deck.md#onviewstatechange) callback and manipulate the view state before it is used. The following example constrains the map in a bounding box:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';

const bounds = [
  [-123, 37], // South west corner
  [-122, 38]  // North east corner
];

function applyViewStateConstraints(viewState) {
  return {
    ...viewState,
    longitude: Math.min(bounds[1][0], Math.max(bounds[0][0], viewState.longitude)),
    latitude: Math.min(bounds[1][1], Math.max(bounds[0][1], viewState.latitude))
  };
}

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true,
  onViewStateChange: ({viewState}) => applyViewStateConstraints(viewState)
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapViewState} from '@deck.gl/core';

const bounds: [
  [west: number, south: number],
  [east: number, north: number]
] = [
  [-123, 37],
  [-122, 38]
];

function applyViewStateConstraints(viewState: MapViewState): MapViewState {
  return {
    ...viewState,
    longitude: Math.min(bounds[1][0], Math.max(bounds[0][0], viewState.longitude)),
    latitude: Math.min(bounds[1][1], Math.max(bounds[0][1], viewState.latitude))
  };
}

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true,
  onViewStateChange: ({viewState}) => applyViewStateConstraints(viewState)
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';

function App({bounds}: {
  bounds: [
    [west: number, south: number],
    [east: number, north: number]
  ] 
}) {
  const applyViewStateConstraints = useCallback((viewState: MapViewState) => ({
    ...viewState,
    longitude: Math.min(bounds[1][0], Math.max(bounds[0][0], viewState.longitude)),
    latitude: Math.min(bounds[1][1], Math.max(bounds[0][1], viewState.latitude))
  }), [bounds]);

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12
    }}
    controller
    onViewStateChange={({viewState}) => applyViewStateConstraints(viewState)}
  />;
}
```

  </TabItem>
</Tabs>


### Externally Manage View State

For more flexibility you can maintain the view state yourself and pass it in to deck.gl via the `viewState` parameter. This essentially makes `Deck`/`<DeckGL>` a stateless component, and allows you to synchronize the view state between multiple components, e.g. via a Redux store. The following example shows the most basic form of doing so.

Note: Do not combine `initialViewState` and `viewState` props. `viewState` will always overwrite any internal state.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';

const deckInstance = new Deck({
  viewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true,
  onViewStateChange: ({viewState}) => {
    deckInstance.setProps({viewState})
  }
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';

const deckInstance = new Deck({
  viewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true,
  onViewStateChange: ({viewState}) => {
    deckInstance.setProps({viewState})
  }
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState} from 'react';
import DeckGL from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  });

  return <DeckGL
    viewState={viewState}
    controller
    onViewStateChange={e => setViewState(e.viewState)}
  />;
}
```

  </TabItem>
</Tabs>


### Advanced View Controls

- Alternative views such as OrbitView, FirstPersonView, and using multiple views such as VR, minimap: [Views and Projections](./views.md)
- Implement a custom controller: [Controller](../api-reference/core/controller.md)


## Picking

Picking is the mechanism through which users interact with the geometries rendered by layers.

deck.gl includes a powerful picking engine that enables the application to precisely determine what object and layer is rendered on a certain pixel on the screen. This picking engine can either be called directly by an application (which is then typically implementing its own event handling), or it can be called automatically by the basic built-in event handling in deck.gl.

### What can be Picked?

The picking engine identifies which object in which layer is at the given coordinates. While usually intuitive, what constitutes a pickable "object" is defined by each layer. Typically, it corresponds to one of the data entries that is passed in via `prop.data`. For example, in [Scatterplot Layer](../api-reference/layers/scatterplot-layer.md), an object is an element in the `props.data` array that is used to render one circle. In [GeoJson Layer](../api-reference/layers/geojson-layer.md), an object is a GeoJSON feature in the `props.data` feature collection that is used to render one point, path or polygon.

Because the picking engine uses 8-bit RGBA colors to encode object and layer index, there is a limit of `255 - 1` layers and `255 * 255 * 255 - 1` objects per layer that can be picked at the same time. While deck.gl can easily create more than 254 layers (e.g. with tiled data), the picking process is smart about excluding layers that do not overlap with the queried pixel, so this limit is unlikely a problem in normal circumstances. If your app does hit this limit, it can be circumvented by [calling the picking engine directly](#calling-the-picking-engine-directly) with multiple batches of layers.

At the moment, the picking mechanism does not work for objects that are offscreen.

### Enabling Picking

Picking can be enabled or disabled on a layer-by-layer basis. To enable picking on a layer, set its [`pickable`](../api-reference/core/layer.md#pickable) prop to `true`. This value is `false` by default.


### Built-in Events

For applications that have basic event handling needs, deck.gl has built-in support for handling selected pointer events. When the application registers callbacks, deck.gl automatically tracks these events, runs the picking engine and invokes the callbacks with the resulting `PickingInfo` object.

The following event handlers are supported:

- `onHover`
- `onClick`
- `onDragStart`
- `onDrag`
- `onDragEnd`

A event handler function is called with two parameters: `info` that contains information about the object being interacted with, and `event` that contains the pointer event.

There are two ways to subscribe to the built-in picking event handling:

* Specify callbacks for each pickable layer by passing [event handler props](../api-reference/core/layer.md#interaction-properties):


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {ScatterplotLayer} from '@deck.gl/layers';

const layer = new ScatterplotLayer({
  data: [
    {position: [-122.45, 37.78]}
  ],
  getPosition: d => d.position,
  getRadius: 1000,
  getFillColor: [255, 255, 0],
  // Required to enable picking
  pickable: true
  // Callback when the pointer enters or leaves an object
  onHover: (info, event) => console.log('Hovered:', info, event),
  // Callback when the pointer clicks on an object
  onClick: (info, event) => console.log('Clicked:', info, event)
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {PickingInfo} from '@deck.gl/core';
import {MjolnirEvent} from 'mjolnir.js';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
};

const layer = new ScatterplotLayer<DataType>({
  data: [
    {position: [-122.45, 37.78]}
  ],
  getPosition: (d: DataType) => d.position,
  getRadius: 1000,
  getFillColor: [255, 255, 0],
  // Required to enable picking
  pickable: true
  // Callback when the pointer enters or leaves an object
  onHover: (info: PickingInfo<DataType>, event: MjolnirEvent) => console.log('Hovered:', info, event),
  // Callback when the pointer clicks on an object
  onClick: (info: PickingInfo<DataType>, event: MjolnirEvent) => console.log('Clicked:', info, event)
});
```

  </TabItem>
</Tabs>


* Specify callbacks for all pickable layers by setting [event handler props](../api-reference/react/deckgl.md#event-callbacks) of the `Deck`/`DeckGL` component:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';

new Deck({
  // ...
  // Callback when the pointer enters or leaves an object in any pickable layer
  onHover: (info, event) => console.log('Hovered:', info, event),
  // Callback when the pointer clicks on an object in any pickable layer
  onClick: (info, event) => console.log('Clicked:', info, event)
})
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {MjolnirEvent} from 'mjolnir.js';

new Deck({
  // ...
  // Callback when the pointer enters or leaves an object in any pickable layer
  onHover: (info: PickingInfo, event: MjolnirEvent) => console.log('Hovered:', info, event),
  // Callback when the pointer clicks on an object in any pickable layer
  onClick: (info: PickingInfo, event: MjolnirEvent) => console.log('Clicked:', info, event)
})
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {Deck, PickingInfo} from '@deck.gl/core';
import {MjolnirEvent} from 'mjolnir.js';

function App() {
  // Callback when the pointer enters or leaves an object in any pickable layer
  const onHover = useCallback((info: PickingInfo, event: MjolnirEvent) => {
    console.log('Hovered:', info, event);
  }, []);
  // Callback when the pointer clicks on an object in any pickable layer
  const onClick = useCallback((info: PickingInfo, event: MjolnirEvent) => {
    console.log('Clicked:', info, event);
  }, []);

  return <DeckGL
    // ...
    onHover={onHover}
    onClick={onClick}
  />;
}
```

  </TabItem>
</Tabs>


Picking events are triggered based on *pickable objects*:

* A `click` event is triggered every time the pointer clicked on an object in a pickable layer.
* A `hover` event is triggered every time the hovered object of a pickable layer changes.

When an event is fired, the `onHover` or `onClick` callback of the affected layer is called first. If the callback returns a truthy value, the event is marked as handled. Otherwise, the event will bubble up to the `Deck`/`DeckGL` canvas and be visible to its `onHover` and `onClick` callbacks.


### The PickingInfo Object

The picking engine returns "picking info" objects which contains a variety of fields describing what layer and object was picked.

| Key      | Type | Value |
| ---      | --- | --- |
| `picked` | boolean | Whether something was found under the pointer. This can be a more reliable test than `object` because `object` may be `null` for certain layer and data types. |
| `index`  | number | The index of the object in the layer that was picked. |
| `layer`  | Layer | The top-level layer that the picked object belongs to. Only layers with the `pickable` prop set to true can be picked. |
| `sourceLayer` | Layer | The immediate layer that rendered the picked pixel. This would be different from `layer` if `layer` is a [CompositeLayer](../api-reference/core/composite-layer.md). |
| `object` | any | The object that was picked. This is typically an element from the layer's `props.data` array, but can vary from layer to layer. This field is usually only present when picking from layers where `props.data` [is an array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#description), unless indicated otherwise in the layer's documentation.|
| `x`      | number | Mouse position x relative to the viewport. |
| `y`      | number | Mouse position y relative to the viewport. |
| `coordinate` | number[] | Corresponding point of the mouse position in the coordinate system of the layer. When using the built-in callbacks, this coordinate is 2D, assuming z=0 (i.e. on sea level in a geospatial dataset). You may optionally acquire a 3D position with a performance overhead by [calling the picking engine directly](#calling-the-picking-engine-directly). |
| `viewport` | Viewport | The viewport that the picked object belongs to. |


Remarks:

- Specific deck.gl layers, such as the `BitmapLayer` and `TileLayer`, may add additional fields to the picking info object. Check the documentation of each layer.
- Limitation when using multiple views: `viewport` could potentially be misidentified if two views that contain the picked layer also overlap with each other and do not clear the background.


### Example: Display a Tooltip for Hovered Object

#### Using the Built-In Tooltip

`Deck` automatically renders a tooltip if the `getTooltip` callback is supplied:


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

// Callback to populate the default tooltip with content
function getTooltip({object}) {
  return object && object.message;
}

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: d => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true
    })
  ],
  getTooltip
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
  message: string;
};

// Callback to populate the default tooltip with content
function getTooltip({object}: PickingInfo<DataType>) {
  return object && object.message;
}

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  },
  controller: true,
  layers: [
    new ScatterplotLayer<DataType>({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: (d: DataType) => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true
    })
  ],
  getTooltip
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {PickingInfo} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
  message: string;
};

function App() {
  const layers = [
    new ScatterplotLayer<DataType>({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: (d: DataType) => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true
    })
  ];

  // Callback to populate the default tooltip with content
  const getTooltip = useCallback(({object}: PickingInfo<DataType>) => {
    return object && object.message;
  }, []);

  return <DeckGL
    initialViewState={{
      longitude: -122.45,
      latitude: 37.78,
      zoom: 12
    }}
    controller
    layers={layers}
    getTooltip={getTooltip}
  />
}
```

  </TabItem>
</Tabs>


It receives a picking info object and returns the content of the tooltip. To customize the tooltip further, return an object instead:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
function getTooltip({object}) {
  return object && {
    html: `<h2>Message:</h2> <div>${object.message}</div>`,
    style: {
      backgroundColor: '#f00',
      fontSize: '0.8em'
    }
  };
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
function getTooltip({object}: PickingInfo<DataType>) {
  return object && {
    html: `<h2>Message:</h2> <div>${object.message}</div>`,
    style: {
      backgroundColor: '#f00',
      fontSize: '0.8em'
    }
  };
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
const getTooltip = useCallback(({object}: PickingInfo<DataType>) => {
  return object && {
    html: `<h2>Message:</h2> <div>${object.message}</div>`,
    style: {
      backgroundColor: '#f00',
      fontSize: '0.8em'
    }
  };
}, []);
```

  </TabItem>

</Tabs>


For a range of options, see [getTooltip](../api-reference/core/deck.md#gettooltip) documentation.

#### Rendering a Custom Tooltip


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.zIndex = 1;
tooltip.style.pointerEvents = 'none';
document.body.append(tooltip);

function updateTooltip({object, x, y}) {
  if (object) {
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.innerText = object.message;
  } else {
    tooltip.style.display = 'none';
  }
}

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: d => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true,
      // Update tooltip position and content
      onHover: updateTooltip
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
  message: string;
};

const tooltip: HTMLDivElement = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.zIndex = 1;
tooltip.style.pointerEvents = 'none';
document.body.append(tooltip);

function updateTooltip({object, x, y}: PickingInfo<DataType>) {
  if (object) {
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.innerText = object.message;
  } else {
    tooltip.style.display = 'none';
  }
}

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  },
  controller: true,
  layers: [
    new ScatterplotLayer<DataType>({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: (d: DataType) => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true,
      // Update tooltip position and content
      onHover: updateTooltip
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState} from 'react';
import DeckGL from '@deck.gl/react';
import {PickingInfo} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
  message: string;
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  pointerEvents: 'none'
};

function App() {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<DataType>>();

  const layers = [
    new ScatterplotLayer<DataType>({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: (d: DataType) => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Required to enable picking
      pickable: true,
      // Update app state
      onHover: info => setHoverInfo(info)
    })
  ];

  return <DeckGL
    initialViewState={{
      longitude: -122.45,
      latitude: 37.78,
      zoom: 12
    }}
    controller
    layers={layers} >
      {hoverInfo.object && (
        <div style={{...tooltipStyle, left: hoverInfo.x, top: hoverInfo.y}}>
          { hoverInfo.object.message }
        </div>
      )}
  </DeckGL>;
}
```

  </TabItem>
</Tabs>


### Calling the Picking Engine Directly

While the default events handle most of the use cases, sometimes applications need more control over when and how picking is performed.

The picking engine is exposed through the [`Deck.pickObject`](../api-reference/core/deck.md#pickobject) and [`Deck.pickObjects`](../api-reference/core/deck.md#pickobjects) methods. These methods allow you to query what layers and objects within those layers are under a specific point or within a specified rectangle. They return `PickingInfo` objects as described above.


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';

const deckInstance = new Deck({
  // ...
  onClick: ({x, y}) => {
    // Query up to 5 overlapping objects under the pointer
    const pickInfos = deckInstance.pickMultipleObjects({x, y, radius: 1, depth: 5});
    console.log(pickInfo);
  }
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';

const deckInstance = new Deck({
  // ...
  onClick: ({x, y}: PickingInfo) => {
    // Query up to 5 overlapping objects under the pointer
    const pickInfos: PickingInfo[] = deckInstance.pickMultipleObjects({x, y, radius: 1, depth: 5});
    console.log(pickInfo);
  }
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useRef, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {PickingInfo} from '@deck.gl/core';

function App() {
  const deckRef = useRef<DeckGL>();

  const onClick = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Get mouse position relative to the containing div
    const containerRect = evt.currentTarget.getBoundingClientRect();
    const x = evt.clientX - containerRect.left;
    const y = evt.clientY = containerRect.top;
    // Query up to 5 overlapping objects under the pointer
    const pickInfos: PickingInfo[] = deckRef.current?.pickMultipleObjects({x, y, radius: 1, depth: 5});
    console.log(pickInfo);
  }, [])

  return <div onClick={onClick}>
    <DeckGL ref={deckRef} ... />
  </div>;
}
```

  </TabItem>
</Tabs>


Also note that by directly calling `queryObject`, integrating deck.gl into an existing application often becomes easier since you don't have to change the application's existing approach to event handling.

### Under The Hood

If you are using the core layers, all has been taken care of.

If you are implementing a custom layer, read more about
[how picking is implemented](./custom-layers/picking.md).

