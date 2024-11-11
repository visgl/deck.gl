# Views and Projections

The same data can be drawn differently to screen based on what projection method is used. deck.gl's view system defines how one or more cameras should be set up to look at your data objects. The default view used in deck.gl is the [MapView](../api-reference/core/map-view.md), which implements the [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection). 
The view system is designed to be flexible and composable and can handle many different configurations such as side-by-side views, overlapping views etc. If you plan to work with non-geospatial data, or show more than a single standard viewport, it may be worth spending some time to get familiar with the `View` API.

View classes enable applications to specify one or more rectangular viewports and control what should be rendered inside each view.

<table style={{border:0}} align="top">
  <tbody>
    <tr>
      <td style={{verticalAlign:'top'}}>
        <img height="200" src="https://raw.github.com/visgl/deck.gl-data/master/images/docs/minimap.gif" />
        <p><i>A "minimap" app, implemented as two overlapping, partially synchronized MapViews</i></p>
      </td>
      <td style={{verticalAlign:'top'}}>
        <img height="200" src="https://raw.github.com/visgl/deck.gl-data/master/images/docs/first-person-view.gif" />
        <p><i>A vehicle log rendered from the driver's perspective, implemented with FirstPersonView</i></p>
      </td>
      <td style={{verticalAlign:'top'}}>
        <img height="200" src="https://raw.github.com/visgl/deck.gl-data/master/images/docs/orthographic-view.gif" />
        <p><i>A graph, implemented with OrthographicView</i></p>
      </td>
    </tr>
  </tbody>
</table>


## View, View State and Viewport

### View

A [View](../api-reference/core/view.md) instance defines the following information:

* A unique `id`.
* The position and extent of the view on the canvas: `x`, `y`, `width`, and `height`.
* Certain camera parameters specifying how your data should be projected into this view, e.g. field of view, near/far planes, perspective vs. orthographic, etc.
* The [controller](../api-reference/core/controller.md) to be used for this view. A controller listens to pointer events and touch gestures, and translates user input into changes in the view state. If enabled, the camera becomes interactive.

To summarize, a `View` instance wraps the "hard configuration" of a camera. Once defined, it does not need to change frequently.

deck.gl allows multiple views to be specified, allowing the application to divide the screen into multiple similar or different views. These views can be synchronized or separately controlled by the user or the application.

### View State

A `View` instance must be used in combination with a `viewState` object. As the name suggests, the object describes the state of a `View` instance. The view state object defines the temporary properties of a view at runtime, like the camera position, orientation, zoom, etc. If the view is interactive, every time the user pans/rotates/zooms, the view state will be updated to reflect the change.

To summarize, a `viewState` object describes the "real-time properties" of a camera. It may be updated continuously during interaction and/or transition.

### Viewport

A [Viewport](../api-reference/core/viewport.md) instance is the camera itself. It is "resolved" from a `View` instance and its `viewState`. It handles the mathematical operations such as coordinate projection/unprojection, the calculation of projection matrices, and other GLSL uniforms needed by the shaders.

Whenever `viewState` updates, the view creates a new viewport under the hood. Typically, the deck.gl user does not need to work with viewports directly. In certain use cases, the JavaScript functions offered by a `Viewport` instance can be handy for projecting and unprojecting coordinates.

> If you are using the Deck canvas as an [overlay on a base map rendered by another library](../get-started/using-with-map), you may need to update the viewport using the API provided by that library rather than by deck.gl.


## Types of Views

deck.gl offers a set of `View` classes that package the camera and controller logic that you need to visualize and interact with your data. You may choose one or multiple `View` classes based on the type of data (e.g. geospatial, 2D chart) and the desired perspective (top down, first-person, etc).

Note that the set of view state parameters that will be used varies between Views. Consult each view class' documentation for a full list of parameters supported.

| View Class                                                     | Use Case  | Status | Description |
| ---                                                            | ---         | ---         | ---         |
| [`View`](../api-reference/core/view.md)                          |    |    | The base view has to be supplied with raw view and projection matrices. It is typically only instantiated directly if the application needs to work with views that have been supplied from external sources, such as the [WebVR API](https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API). |
| [`MapView`](../api-reference/core/map-view.md) (default)         | geospatial | full support | This view renders data using the [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection) and is designed to match an external base map library such as Mapbox or Google Maps.
| [`GlobeView`](../api-reference/core/globe-view.md)               | geospatial | experimental | This view renders data as a 3D globe.
| [`FirstPersonView`](../api-reference/core/first-person-view.md)  | geospatial | full support | The camera is positioned in a provided geolocation and looks in a provided direction, similar to that of a [first-person game](https://en.wikipedia.org/wiki/First-person_(gaming)). |
| [`OrthographicView`](../api-reference/core/orthographic-view.md) | info-vis (2D)     | full support | The camera looks at a target point from top-down. Does not rotate. |
| [`OrbitView`](../api-reference/core/orbit-view.md)         | info-vis (3D)     | full support | The camera looks at a target point from a provided direction. Rotates around the target. |


## Examples

### Using a View

If the `views` prop of `Deck` is not specified, deck.gl will automatically create a `MapView` that fills the whole canvas, so basic geospatial applications often do not have to specify any `View`s.

If using non-geospatial data, you will need to manually create a view that is appropriate for info-vis, e.g.:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, OrthographicView} from '@deck.gl/core';

const deck = new Deck({
  // ...
  views: new OrthographicView()
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, OrthographicView} from '@deck.gl/core';

const deck = new Deck({
  // ...
  views: new OrthographicView()
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';

function App() {
  return <DeckGL
    // ...
    views={new OrthographicView()}
  />;
}
```

  </TabItem>
</Tabs>

### Using a View with View State

If `initialViewState` is provided, deck.gl automatically tracks the view states of interactive views (used as a "stateful" component):


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

If you need to manage and manipulate the view state outside of deck.gl, you may do so by providing the `viewState` prop (used as a "stateless" component). In this case, you also need to listen to the `onViewStateChange` callback and update the `viewState` object yourself:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, OrthographicView} from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 1
};

const deckInstance = new Deck({
  viewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: e => {
    deckInstance.setProps({
      viewState: e.viewState
    });
  }
});

document.getElementById('reset-btn').onclick = () => {
  deckInstance.setProps({
    viewState: INITIAL_VIEW_STATE
  });
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, OrthographicView, OrthographicViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: OrthographicViewState = {
  target: [0, 0, 0],
  zoom: 1
};

const deckInstance = new Deck<OrthographicView>({
  viewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: e => {
    deckInstance.setProps({
      viewState: e.viewState
    });
  }
});

document.getElementById('reset-btn').onclick = () => {
  deckInstance.setProps({
    viewState: INITIAL_VIEW_STATE
  });
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {OrthographicView, OrthographicViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: OrthographicViewState = {
  target: [0, 0, 0],
  zoom: 1
};

function App() {
  const [viewState, setViewState] = useState<OrthographicViewState>(INITIAL_VIEW_STATE);

  const onReset = useCallback(() => setViewState(INITIAL_VIEW_STATE), []);

  return <>
    <DeckGL
      views={new OrthographicView()}
      controller
      viewState={viewState}
      onViewStateChange={e => setViewState(e.viewState)}
    />
    <button onClick={onReset}>Reset</button>
  </>;
}
```

  </TabItem>
</Tabs>


### Using Multiple Views

deck.gl also supports multiple views by taking a `views` prop that is a list of `View` instances.

Views allow the application to specify the position and extent of the viewport (i.e. the target rendering area on the screen) with `x` (left), `y` (top), `width` and `height`. These can be specified in either numbers or CSS-like percentage strings (e.g. `width: '50%'`), which is evaluated at runtime when the canvas resizes.

Common examples in 3D applications that render a 3D scene multiple times with different "cameras":

* To show views from multiple viewpoints (cameras), e.g. in a split screen setup.
* To show a detail view (e.g, first person), and an overlaid, smaller "map" view (e.g. third person or top down, zoomed out to show where the primary viewpoint is).
* To support stereoscopic rendering (e.g. VR), where left and right views are needed, providing the necessary parallax between left and right eye.
* For rendering into offscreen framebuffers, which can then be used for e.g. advanced visual effects, screen shot solutions, overlays onto DOM elements outside of the primary deck.gl canvas (e.g. a video).

Example of displaying two maps side-by-side, and any camera change in one map is synchronized to another: 

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, MapView} from '@deck.gl/core';

const deckInstance = new Deck({
  views: [
    new MapView({id: 'left', x: 0, width: '50%', controller: true}),
    new MapView({id: 'right', x: '50%', width: '50%', controller: true})
  ],
  viewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  onViewStateChange: ({viewState}) => {
    deckInstance.setProps({viewState});
  }
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapView} from '@deck.gl/core';

const deckInstance = new Deck<[MapView, MapView]>({
  views: [
    new MapView({id: 'left', x: 0, width: '50%', controller: true}),
    new MapView({id: 'right', x: '50%', width: '50%', controller: true})
  ],
  viewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  onViewStateChange: ({viewState}) => {
    deckInstance.setProps({viewState});
  }
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState} from 'react';
import DeckGL from '@deck.gl/react';
import {MapView, MapViewState} from '@deck.gl/core';

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  });

  return <DeckGL
    views={[
      new MapView({id: 'left', x: 0, width: '50%', controller: true}),
      new MapView({id: 'right', x: '50%', width: '50%', controller: true})
    ]}
    viewState={viewState}
    onViewStateChange={evt => setViewState(evt.viewState)}
  />;
}
```

  </TabItem>
</Tabs>


### Using Multiple Views with View States

When using multiple views, each `View` can either have its own independent view state, or share the same view state as other views. To define the view state of a specific view, add a key to the `viewState` object that matches its view id.

The following example displays a "minimap" in the corner that synchronizes with the main view, but provides a different perspective:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, MapView} from '@deck.gl/core';

let currentViewState = {
  main: {
    longitude: -122.4,
    latitude: 37.8,
    pitch: 30,
    zoom: 12,
  },
  minimap: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 8
  }
};

function onViewStateChange({viewId, viewState}) {
  if (viewId === 'main') {
    // When user moves the camera in the first-person view, the minimap should follow
    currentViewState = {
      main: viewState,
      minimap: {
        ...currentViewStates.minimap,
        longitude: viewState.longitude,
        latitude: viewState.latitude
      }
    };
  } else {
    // Only allow the user to change the zoom in the minimap
    currentViewState = {
      main: currentViewStates.main,
      minimap: {
        ...currentViewStates.minimap,
        zoom: viewState.zoom
      }
    };
  }
  // Apply the new view state
  deckInstance.setProps({viewState: currentViewState});
};

const deckInstance = new Deck({
  views: [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200, controller: true})
  ],
  viewState: currentViewState
  onViewStateChange
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapView, MapViewState} from '@deck.gl/core';

let currentViewState: {
  main: MapViewState;
  minimap: MapViewState
} = {
  main: {
    longitude: -122.4,
    latitude: 37.8,
    pitch: 30,
    zoom: 12,
  },
  minimap: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 8
  }
};

function onViewStateChange({viewId, viewState}: {
  viewId: 'main' | 'minimap';
  viewState: MapViewState;
}) {
  if (viewId === 'main') {
    // When user moves the camera in the first-person view, the minimap should follow
    currentViewState = {
      main: viewState,
      minimap: {
        ...currentViewStates.minimap,
        longitude: viewState.longitude,
        latitude: viewState.latitude
      }
    };
  } else {
    // Only allow the user to change the zoom in the minimap
    currentViewState = {
      main: currentViewStates.main,
      minimap: {
        ...currentViewStates.minimap,
        zoom: viewState.zoom
      }
    };
  }
  // Apply the new view state
  deckInstance.setProps({viewState: currentViewState});
};

const deckInstance = new Deck<[MapView, MapView]>({
  views: [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200, controller: true})
  ],
  viewState: currentViewState
  onViewStateChange
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {MapView, MapViewState} from '@deck.gl/core';

function App() {
  const [viewStates, setViewStates] = useState<{
    main: MapViewState;
    minimap: MapViewState
  }>({
    main: {
      longitude: -122.4,
      latitude: 37.8,
      pitch: 30,
      zoom: 12,
    },
    minimap: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 8
    }
  });

  const onViewStateChange = useCallback(({viewId, viewState}: {
    viewId: 'main' | 'minimap';
    viewState: MapViewState;
  }) => {
    if (viewId === 'main') {
      // When user moves the camera in the first-person view, the minimap should follow
      setViewStates(currentViewStates => ({
        main: viewState,
        minimap: {
          ...currentViewStates.minimap,
          longitude: viewState.longitude,
          latitude: viewState.latitude
        }
      }));
    } else {
      // Only allow the user to change the zoom in the minimap
      setViewStates(currentViewStates => ({
        main: currentViewStates.main,
        minimap: {
          ...currentViewStates.minimap,
          zoom: viewState.zoom
        }
      }));
    }
  }, []);

  render() {
    return <DeckGL
      views={[
        new MapView({id: 'main', controller: true}),
        new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200, controller: true})
      ]}
      viewState={viewStates}
      onViewStateChange={onViewStateChange}
    />;
  }
}
```

  </TabItem>
</Tabs>


### Rendering Layers in Multiple Views

By default, all visible layers are rendered into all the views. This may not be the case if certain layers are designed to go into one particular view.

The `Deck` class has a `layerFilter` prop that can be used to determine which layers to draw in which view. In the following example, two views are rendered to follow a car moving on a map: a first-person perspective from the car's dash, and a top-down perspective of the city block that it's in. We only want to render the 3D car model in the minimap because it would block the camera in the first-person view.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, FirstPersonView, MapView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MVTLayer} from '@deck.gl/geo-layers';

const deckInstance = new Deck({
  views: [
    new FirstPersonView({id: 'first-person'}),
    new MapView({id: 'minimap', x: 10, y: 10, width: '20%', height: '20%'})
  ],
  layerFilter: ({layer, viewport}) => {
    if (viewport.id === 'first-person' && layer.id === 'car') {
      // Do not draw the car layer in the first person view
      return false;
    }
    return true;
  }
});

/** Called periodically to update the map with the car's latest position */
function updateCar(carPose) {
  deckInstance.setProps({
    layers: [
      new MVTLayer({
        id: 'base-map',
        // ...
      }),
      new SimpleMeshLayer({
        id: 'car',
        mesh: '/path/to/model.obj',
        data: [carPose],
        getPosition: d => [d.longitude, d.latitude, 0],
        getOrientation: d => [0, -d.heading * Math.PI / 180, 0]
      })
    ],
    viewState: {
      'first-person': {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        bearing: carPos.heading,
        position: [0, 0, 2]
      },
      minimap: {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        zoom: 10
      }
    }
  });
}
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, FirstPersonView, MapView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MVTLayer} from '@deck.gl/geo-layers';

type CarPose = {
  longitude: number;
  latitude: number;
  heading: number;
};

const deckInstance = new Deck<[FirstPersonView, MapView]>({
  views: [
    new FirstPersonView({id: 'first-person'}),
    new MapView({id: 'minimap', x: 10, y: 10, width: '20%', height: '20%'})
  ],
  layerFilter: ({layer, viewport}) => {
    if (viewport.id === 'first-person' && layer.id === 'car') {
      // Do not draw the car layer in the first person view
      return false;
    }
    return true;
  }
});

/** Called periodically to update the map with the car's latest position */
function updateCar(carPose: CarPos) {
  deckInstance.setProps({
    layers: [
      new MVTLayer({
        id: 'base-map',
        // ...
      }),
      new SimpleMeshLayer<CarPose>({
        id: 'car',
        mesh: '/path/to/model.obj',
        data: [carPose],
        getPosition: (d: CarPose) => [d.longitude, d.latitude, 0],
        getOrientation: (d: CarPos) => [0, -d.heading * Math.PI / 180, 0]
      })
    ],
    viewState: {
      'first-person': {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        bearing: carPos.heading,
        position: [0, 0, 2]
      },
      minimap: {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        zoom: 10
      }
    }
  });
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useMemo, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {Deck, DeckProps, FirstPersonView, MapView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MVTLayer} from '@deck.gl/geo-layers';

type CarPose = {
  longitude: number;
  latitude: number;
  heading: number;
};

/** Rerenders periodically to update the map with the car's latest position */
function App({carPose}: {
  carPos: CarPose;
}) {

  const layers = useMemo(() => [
    new MVTLayer({
      id: 'base-map',
      // ...
    }),
    new SimpleMeshLayer<CarPose>({
      id: 'car',
      mesh: '/path/to/model.obj',
      data: [carPose],
      getPosition: (d: CarPose) => [d.longitude, d.latitude, 0],
      getOrientation: (d: CarPos) => [0, -d.heading * Math.PI / 180, 0]
    })
  ], [carPos]);

  const views = useMemo(() => [
    new FirstPersonView({id: 'first-person'}),
    new MapView({id: 'minimap', x: 10, y: 10, width: '20%', height: '20%'})
  ], []);

  const layerFilter: DeckProps["layerFilter"] = useCallback(({layer, viewport}) => {
    if (viewport.id === 'first-person' && layer.id === 'car') {
      // Do not draw the car layer in the first person view
      return false;
    }
    return true;
  }, []);

  return <DeckGL
    views={views}
    viewState={{
      'first-person': {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        bearing: carPos.heading,
        position: [0, 0, 2]
      },
      minimap: {
        longitude: carPos.longitude,
        latitude: carPos.latitude,
        zoom: 10
      }
    }}
    layers={layers}
    layerFilter={layerFilter}
  />;
}
```

  </TabItem>
</Tabs>


Some layers, including `TileLayer`, `MVTLayer`, `HeatmapLayer` and `ScreenGridLayer`, perform expensive operations (data fetching and/or aggregation) on viewport change. Therefore, it is generally *NOT* recommended to render them into multiple views. If you do need to show e.g. tiled base map in multiple views, create one layer instance for each view and limit their rendering with `layerFilter`:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, MapView} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const deck = new Deck({
  // ...
  views: [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200})
  ],
  layers: [
    new MVTLayer({
      id: 'tiles-for-main',
      // ...
    }),
    new MVTLayer({
      id: 'tiles-for-minimap',
      // ...
    })
  ],
  layerFilter: ({layer, viewport}) => {
    return layer.id === `tiles-for-${viewport.id}`;
  }
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, MapView} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const deck = new Deck<[MapView, MapView]>({
  // ...
  views: [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200})
  ],
  layers: [
    new MVTLayer({
      id: 'tiles-for-main',
      // ...
    }),
    new MVTLayer({
      id: 'tiles-for-minimap',
      // ...
    })
  ],
  layerFilter: ({layer, viewport}) => {
    return layer.id === `tiles-for-${viewport.id}`;
  }
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useMemo, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {DeckProps, MapView} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

function App() {
  const views = useMemo(() => [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 10, y: 10, width: 300, height: 200})
  ], []);

  const layers = useMemo(() => [
    new MVTLayer({
      id: 'tiles-for-main',
      // ...
    }),
    new MVTLayer({
      id: 'tiles-for-minimap',
      // ...
    })
  ], []);

  const layerFilter: DeckProps["layerFilter"] = useCallback(({layer, viewport} => {
    return layer.id === `tiles-for-${viewport.id}`;
  }), []);

  return <DeckGL
    // ...
    views={views}
    layers={layers}
    layerFilter={layerFilter}
  />;
}
```

  </TabItem>
</Tabs>

Starting with v8.5, `Tile3DLayer` supports rendering in multiple views with a single tile cache.


### Picking in Multiple Views

deck.gl's built-in picking support extends naturally to multiple viewports. The picking process renders all viewports.

Note that the `pickInfo` object does not contain a viewport reference, so you will not be able to tell which viewport was used to pick an object.

In the [above example](#rendering-layers-in-multiple-views), you may also control which layer is pickable by view in `layerFilter`:

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
const layerFilter = ({layer, viewport, isPicking}) => {
  if (viewport.id === 'first-person' && layer.id === 'car') {
    // Do not draw the car layer in the first person view
    return false;
  }
  if (isPicking && viewport.id === 'minimap') {
    // Do not pick anything in the minimap
    return false;
  }
  return true;
};
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
const layerFilter: DeckProps["layerFilter"] = ({layer, viewport, isPicking}) => {
  if (viewport.id === 'first-person' && layer.id === 'car') {
    // Do not draw the car layer in the first person view
    return false;
  }
  if (isPicking && viewport.id === 'minimap') {
    // Do not pick anything in the minimap
    return false;
  }
  return true;
};
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
const layerFilter: DeckProps["layerFilter"] = useCallback(({layer, viewport, isPicking}) => {
  if (viewport.id === 'first-person' && layer.id === 'car') {
    // Do not draw the car layer in the first person view
    return false;
  }
  if (isPicking && viewport.id === 'minimap') {
    // Do not pick anything in the minimap
    return false;
  }
  return true;
}, []);
```

  </TabItem>
</Tabs>

### Auto-Positioning UI Components Behind Views

When the deck.gl project first started, one of our major use cases was to build complex Web apps with perfectly synchronized WebGL visualizations and other UI components (HTML markers, charts, lists, etc.). Given the scale of these applications, some reactive, virtual-DOM framework is expected to be in use. At the moment, these features are only implemented for React. Visit the [DeckGL React component](../api-reference/react/deckgl.md) docs for examples.


## Performance Notes

This section discusses how `views` and `viewState` impacts performance (frame rate).

Between rerenders, the `views` and `viewState` props are deep compared to determine if anything changed. There is very little performance concern even if new view instances are constructed each render, as long as they are deemed equivalent with the previous values.

If `views`/`viewState` do change, new viewports will be constructed. At this point, two things will happen:

- Layers are given a chance to recompute their state and create additional GPU resources (by calling the `shouldUpdateState` lifecycle method), with the `UpdateParameters` argument containing `changeFlags.viewportChanged: true`. By default, most layers ignore viewport changes, so `updateState` does not get called as long as nothing else changes. However, some layers do need to update when viewport changes (e.g. the [TileLayer](../api-reference/geo-layers/tile-layer.md) and [HeatmapLayer](../api-reference/aggregation-layers/heatmap-layer.md)). During interaction and transition, this may happen many times a second, so such layers may contribute to significant performance overhead.
- Afterwards, all layers are redrawn to the updated viewport. This is a relatively cheap step as GPU is doing the heavy-lifting. All that CPU has to do is to supply the GPU with the new viewport parameters.

Read more about this topic in [Layer Lifecycles](./custom-layers/layer-lifecycle.md).
