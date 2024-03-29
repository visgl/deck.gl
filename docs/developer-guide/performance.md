# Performance Optimization


## General Performance Expectations

There are mainly two aspects that developers usually consider regarding the
performance of any computer programs: the time and the memory consumption, both of which obviously depends on the specs of the hardware deck.gl is ultimately running on.

On 2015 MacBook Pros with dual graphics cards, most basic layers
(like `ScatterplotLayer`) renders fluidly at 60 FPS during pan and zoom
operations up to about 1M (one million) data items, with framerates dropping into low double digits (10-20FPS) when the data sets approach 10M items.

Even if interactivity is not an issue, browser limitations on how big chunks of contiguous memory can be allocated (e.g. Chrome caps individual allocations at 1GB) will cause most layers to crash during GPU buffer generation somewhere between 10M and 100M items. You would need to break up your data into chunks and use multiple deck.gl layers to get past this limit.

Modern phones (recent iPhones and higher-end Android phones) are surprisingly capable in terms of rendering performance, but are considerably more sensitive to memory pressure than laptops, resulting in browser restarts or page reloads. They also tend to load data significantly slower than desktop computers, so some tuning is usually needed to ensure a good overall user experience on mobile.

## Layer Update Performance

Layer update happens when the layer is first created, or when some layer props change. During an update, deck.gl may load necessary resources (e.g. image textures), generate GPU buffers, and upload them to the GPU, all of which may take some time to complete, depending on the number of items in your `data` prop. Therefore, the key to performant deck.gl applications is to minimize layer updates wherever possible.

### Minimize data changes

When the `data` prop changes, the layer will recalculate all of its GPU buffers. The time required for this is proportional to the number of items in your
`data` prop.
This step is the most expensive operation that a layer does - also on CPU - potentially affecting the responsiveness of the application. It may take
multiple seconds for multi-million item layers, and if your `data` prop is updated
frequently (e.g. animations), "stutter" can be visible even for layers with just a few thousand items.

Some good places to check for performance improvements are:

#### Avoid unnecessary shallow change in data prop

The layer does a shallow comparison between renders to determine if it needs to regenerate buffers. If nothing has changed, make sure you supply the *same* data object every time you render. If the data object has to change shallowly for some reason, consider using the `dataComparator` prop to supply a custom comparison logic.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [x: number, y: number];
  time: number;
};
type Settings = {
  radius: number;
  minTime: number;
  maxTime: number;
}
const DATA: DataType[] = [...];

const deckInstance = new Deck({...});
```

```ts title="Bad practice"
function render(settings: Settings) {
  const layers = [
    new ScatterplotLayer<DataType>({
      // `filter` creates a new array every time `render` is called, even if minTime/maxTime have not changed
      data: DATA.filter(d => d.time >= settings.minTime && d.time <= settings.maxTime),
      getPosition: (d: DataType) => d.position,
      getRadius: settings.radius
    })
  ];

  deckInstance.setProps({layers});
}
```

```ts title="Good practice"
let filteredData: DataType[];
let lastSettings: Settings;

function render(settings: Settings) {
  if (!lastSettings ||
      settings.minTime !== lastSettings.minTime ||
      settings.maxTime !== lastSettings.maxTime) {
    filteredData = DATA.filter(d => d.time >= settings.minTime && d.time <= settings.maxTime);
  }
  lastSettings = settings;

  const layers = [
    new ScatterplotLayer<DataType>({
      data: filteredData,
      getPosition: (d: DataType) => d.position,
      getRadius: settings.radius
    })
  ];

  deckInstance.setProps({layers});
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [x: number, y: number];
  time: number;
};
type Settings = {
  radius: number;
  minTime: number;
  maxTime: number;
}
const DATA: DataType[] = [...];
```

```tsx title="Bad practice"
function App({settings}: {
  settings: Settings;
}) {
  const layers = [
    new ScatterplotLayer<DataType>({
      // `filter` creates a new array every time `render` is called, even if minTime/maxTime have not changed
      data: DATA.filter(d => d.time >= settings.minTime && d.time <= settings.maxTime),
      getPosition: (d: DataType) => d.position,
      getRadius: settings.radius
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

```tsx title="Good practice"
function App({settings}: {
  settings: Settings;
}) {
  const filteredData = React.useMemo(() => {
    return DATA.filter(d => d.time >= settings.minTime && d.time <= settings.maxTime);
  }, [settings.minTime, settings.maxTime]);

  const layers = [
    new ScatterplotLayer<DataType>({
      data: filteredData,
      getPosition: (d: DataType) => d.position,
      getRadius: settings.radius
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


#### Use updateTriggers

So `data` has indeed changed. Do we have an entirely new collection of objects? Or did just certain fields changed in each row? Remember that changing `data` will update *all* buffers, so if, for example, object positions have not changed, it will be a waste of time to recalculate them.

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type CensusTract = {
  centroid: [longitude: number, latitude: number];
  populationsByYear: {[year: number]: number};
};
const DATA: CensusTract[] = [...];

const deckInstance = new Deck({...});
```

```ts title="Bad practice"
type CensusTractCurrentYear = {
  centroid: [longitude: number, latitude: number];
  population: number;
};

function render(year: number) {
  const layers = [
    new ScatterplotLayer<CensusTractCurrentYear>({
      // `data` changes every time year changed, but positions don't need to update
      data: DATA.map(d => ({
        centroid: d.centroid,
        population: d.populationsByYear[year]
      })),
      getPosition: (d: CensusTractCurrentYear) => d.centroid,
      getRadius: (d: CensusTractCurrentYear) => Math.sqrt(d.population)
    })
  ];

  deckInstance.setProps({layers});
}
```

In this case, it is more efficient to use `updateTriggers` to invalidate only the selected attributes:

```ts title="Good practice"
function render(year: number) {
  const layers = [
    new ScatterplotLayer<CensusTract>({
      // `data` never changes
      data: DATA,
      getPosition: (d: CensusTract) => d.centroid,
      // radius depends on `year`
      getRadius: (d: CensusTract) => Math.sqrt(d.populationsByYear[year]),
      updateTriggers: {
        // This tells deck.gl to recalculate radius when `year` changes
        getRadius: year
      }
    })
  ];

  deckInstance.setProps({layers});
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';

type CensusTract = {
  centroid: [longitude: number, latitude: number];
  populationsByYear: {[year: number]: number};
};
const DATA: CensusTract[] = [...];
```

```tsx title="Bad practice"
type CensusTractCurrentYear = {
  centroid: [longitude: number, latitude: number];
  population: number;
};

function App({year}: {
  year: number;
}) {
  // `data` changes every time year changed, but positions don't need to update
  const data: CensusTractCurrentYear[] = React.useMemo(() => {
    return DATA.map(d => ({
      centroid: d.centroid,
      population: d.populationsByYear[year]
    }));
  }, [year]);

  const layers = [
    new ScatterplotLayer<CensusTractCurrentYear>({
      data,
      getPosition: (d: CensusTractCurrentYear) => d.centroid,
      getRadius: (d: CensusTractCurrentYear) => Math.sqrt(d.population)
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

In this case, it is more efficient to use `updateTriggers` to invalidate only the selected attributes:

```tsx title="Good practice"
function App({year}: {
  year: number;
}) {
  const layers = [
    new ScatterplotLayer<CensusTract>({
      // `data` never changes
      data: DATA,
      getPosition: (d: CensusTract) => d.centroid,
      // radius depends on `year`
      getRadius: (d: CensusTract) => Math.sqrt(d.populationsByYear[year]),
      updateTriggers: {
        // This tells deck.gl to recalculate radius when `year` changes
        getRadius: year
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


#### Handle incremental data loading

A common technique for handling big datasets on the client side is to load data in chunks. We want to update the visualization whenever a new chunk comes in. If we append the new chunk to an existing data array, deck.gl will recalculate the whole buffers, even for the previously loaded chunks where nothing have changed:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
};

const deckInstance = new Deck({...});
```

```ts title="Bad practice"
let loadedData: DataType[] = [];
let chunk: DataType[];
while (chunk = await fetchNextChunk()) {
  loadedData = loadedData.concat(chunk);
  render();
}

function render() {
  const layers = [
    new ScatterplotLayer<DataType>({
      id: 'points',
      // If we have 1 million rows loaded and 100,000 new rows arrive,
      // we end up recalculating the buffers for all 1,100,000 rows
      data: loadedData,
      getPosition: (d: DataType) => d.position
    })
  ];

  deckInstance.setProps({layers});
}
```

To avoid doing this, we instead generate one layer for each chunk:

```ts title="Good practice"
let dataChunks: DataType[][] = [];
let chunk: DataType[];
while (chunk = await fetchNextChunk()) {
  dataChunks.push(chunk);
  render();
}

function render() {
  const layers = dataChunks.map((chunk: DataType[], chunkIndex: number) =>
    new ScatterplotLayer<DataType>({
      // Important: each layer must have a consistent & unique id
      id: `points-${chunkIndex}`,
      // If we have 10 100,000-row chunks already loaded and a new one arrive,
      // the first 10 layers will see no prop change
      // only the 11th layer's buffers need to be generated
      data: chunk,
      getPosition: (d: DataType) => d.position
    });

  deckInstance.setProps({layers});
}
```

Starting v7.2.0, support for async iterables is added to efficiently update layers with incrementally loaded data:

```ts title="Good alternative"
// Create an async iterable
async function* getData() {
  let chunk: DataType[];
  while (chunk = await fetchNextChunk()) {
    yield chunk;
  }
}

function render() {
  const layers = [
    new ScatterplotLayer<DataType>({
      id: 'points',
      // When a new chunk arrives, deck.gl only updates the sub buffers for the new rows
      data: getData(),
      getPosition: (d: DataType) => d.position
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
import {ScatterplotLayer} from '@deck.gl/layers';

type DataType = {
  position: [longitude: number, latitude: number];
};
```

```tsx title="Bad practice"
function App() {
  const [loadedData, setLoadedData] = useState<DataType[]>([]);

  useEffect(() => {
    (async () => {
      let chunk: DataType[];
      while (chunk = await fetchNextChunk()) {
        setLoadedData(current => current.concat(chunk));
      }
    })();
  }, []);
  
  const layers = [
    new ScatterplotLayer<DataType>({
      id: 'points',
      // If we have 1 million rows loaded and 100,000 new rows arrive,
      // we end up recalculating the buffers for all 1,100,000 rows
      data: loadedData,
      getPosition: (d: DataType) => d.position
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

To avoid doing this, we instead generate one layer for each chunk:

```tsx title="Good practice"
function App() {
  const [dataChunks, setDataChunks] = useState<DataType[][]>([]);

  useEffect(() => {
    (async () => {
      let chunk: DataType[];
      while (chunk = await fetchNextChunk()) {
        setDataChunks(current => current.concat([chunk]));
      }
    })();
  }, []);
  
  const layers = dataChunks.map((chunk: DataType[], chunkIndex: number) =>
    new ScatterplotLayer<DataType>({
      // Important: each layer must have a consistent & unique id
      id: `points-${chunkIndex}`,
      // If we have 10 100,000-row chunks already loaded and a new one arrive,
      // the first 10 layers will see no prop change
      // only the 11th layer's buffers need to be generated
      data: chunk,
      getPosition: (d: DataType) => d.position
    });

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

Starting v7.2.0, support for async iterables is added to efficiently update layers with incrementally loaded data:

```tsx title="Good alternative"
// Create an async iterable
async function* getData() {
  let chunk: DataType[];
  while (chunk = await fetchNextChunk()) {
    yield chunk;
  }
}

function App() {  
  const layers = [
    new ScatterplotLayer<DataType>({
      id: 'points';
      // When a new chunk arrives, deck.gl only updates the sub buffers for the new rows
      data: getData(),
      getPosition: (d: DataType) => d.position
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

See [Layer properties](../api-reference/core/layer.md#data) for details.

#### Favor layer visibility over addition and removal

Removing a layer will lose all of its internal states, including generated buffers. If the layer is added back later, all the GPU resources need to be regenerated again. In the use cases where layers need to be toggled frequently (e.g. via a control panel), there might be a significant perf penalty:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer, TextLayer} from '@deck.gl/layers';

const deckInstance = new Deck({...});
```

```ts title="Bad practice"
function render(layerVisibility: {
  circles: boolean;
  labels: boolean;
}) {
  const layers = [
    // when visibility goes from on to off to on, this layer will be completely removed and then regenerated
    layerVisibility.circles && new ScatterplotLayer({
      id: 'circles'
      // ...
    }),
    layerVisibility.labels && new TextLayer({
      id: 'labels',
      //...
    })
  ];

  deckInstance.setProps({layers});
}
```

The [`visible`](../api-reference/core/layer.md#visible) prop is a cheap way to temporarily hide a layer:

```ts title="Good practice"
function render(layerVisibility: {
  circles: boolean;
  labels: boolean;
}) {
  const layers = [
    // when visibility is off, this layer's internal states will be retained in memory, making turning it back on instant
    new ScatterplotLayer({
      id: 'circles',
      visible: layerVisibility.circles,
      // ...
    }),
    new TextLayer({
      id: 'labels',
      visible: layerVisibility.labels,
      // ...
    })
  ];

  deckInstance.setProps({layers});
}
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer, TextLayer} from '@deck.gl/layers';
```

```tsx title="Bad practice"
function App({layerVisibility}: {
  layerVisibility: {
    circles: boolean;
    labels: boolean;
  }
}) {
  const layers = [
    // when visibility goes from on to off to on, this layer will be completely removed and then regenerated
    layerVisibility.circles && new ScatterplotLayer({
      id: 'circles'
      // ...
    }),
    layerVisibility.labels && new TextLayer({
      id: 'labels',
      //...
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

The [`visible`](../api-reference/core/layer.md#visible) prop is a cheap way to temporarily hide a layer:

```tsx title="Good practice"
function App({layerVisibility}: {
  layerVisibility: {
    circles: boolean;
    labels: boolean;
  }
}) {
  const layers = [
    // when visibility is off, this layer's internal states will be retained in memory, making turning it back on instant
    new ScatterplotLayer({
      id: 'circles',
      visible: layerVisibility.circles,
      // ...
    }),
    new TextLayer({
      id: 'labels',
      visible: layerVisibility.labels,
      // ...
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


### Optimize Accessors

99% of the CPU time that deck.gl spends in updating buffers is calling the accessors you supply to the layer. Since they are called on every data object, any performance issue in the accessors is amplified by the size of your data.

#### Favor constants over callback functions

Most accessors accept constant values as well as functions. Constant props are extremely cheap to update in comparison. Use `ScatterplotLayer` as an example, the following two prop settings yield exactly the same visual outcome:

- `getFillColor: [255, 0, 0, 128]` - deck.gl uploads 4 numbers to the GPU.
- `getFillColor: d => [255, 0, 0, 128]` - deck.gl first builds a typed array of `4 * data.length` elements, call the accessor `data.length` times to fill it, then upload it to the GPU.


Aside from accessors, most layers also offer one or more `*Scale` props that are uniform multipliers on top of the per-object value. Always consider using them before invoking the accessors:

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {animate} from 'popmotion';

type DataType = {
  position: [x: number, y: number];
  size: number;
};
const data: DataType[] = [...];
const radiusAnimation = animate({
  from: 10, // start radius
  to: 50, // end radius
  duration: 1000,
  repeat: Infinity,
  repeatType: 'mirror', // alternate to and fro
  onUpdate: updateLayers
});

const deckInstance = new Deck({...});
```

```ts title="Bad practice"
function updateLayers(radius: number) {
  const layers = [
    new ScatterplotLayer<DataType>({
      data,
      getPosition: (d: DataType) => d.position,
      // deck.gl will call `getRadius` for ALL data objects every animation frame, which will likely choke the app
      getRadius: (d: DataType) => d.size * radius,
      updateTriggers: {
        getRadius: radius
      }
    })
  ];

  deckInstance.setProps({layers});
}
```

```ts title="Good practice"
function updateLayers(radius: number) {
  const layers = [
    new ScatterplotLayer<DataType>({
      data,
      getPosition: (d: DataType) => d.position,
      getRadius: (d: DataType) => d.size,
      // This has virtually no cost to update, easily getting 60fps animation
      radiusScale: radius
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
import {ScatterplotLayer} from '@deck.gl/layers';
import {animate} from 'popmotion';

type DataType = {
  position: [x: number, y: number];
  size: number;
};
const data: DataType[] = [...];

function App() {
  const [radius, setRadius] = useState<number>(0);

  useEffect(() => {
    const radiusAnimation = animate({
      from: 10, // start radius
      to: 50, // end radius
      duration: 1000,
      repeat: Infinity,
      repeatType: 'mirror', // alternate to and fro
      onUpdate: setRadius
    });

    return () => radiusAnimation.stop();
  }, []);
```

```tsx title="Bad practice"
  const layers = [
    new ScatterplotLayer<DataType>({
      data,
      getPosition: (d: DataType) => d.position,
      // deck.gl will call `getRadius` for ALL data objects every animation frame, which will likely choke the app
      getRadius: (d: DataType) => d.size * radius,
      updateTriggers: {
        getRadius: radius
      }
    })
  ];

  return <DeckGL
    // ...
    layers={layers}
  />;
}
```

```tsx title="Good practice"
  const layers = [
    new ScatterplotLayer<DataType>({
      data,
      getPosition: (d: DataType) => d.position,
      getRadius: (d: DataType) => d.size,
      // This has virtually no cost to update, easily getting 60fps animation
      radiusScale: radius
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

#### Use trivial functions as accessors

Whenever possible, make the accessors trivial functions and utilize pre-defined and/or pre-computed data.

```ts
type CensusTract = {
  centroid: [longitude: number, latitude: number];
  populationsByYear: {[year: number]: number};
};

const DATA: CensusTract[] = [...];
```

```ts title="Bad practice"
const layer = new ScatterplotLayer<CensusTract>({
  data: DATA,
  getPosition: (d: CensusTract) => d.centroid,
  getFillColor: (d: CensusTract) => {
    // This line creates a new values array from each object
    // which can incur significant cost in garbage collection
    const maxPopulation = Math.max.apply(null, Object.values(d.populationsByYear));
    // This switch case creates a new color array for each object
    // which can also incur significant cost in garbage collection
    if (maxPopulation > 1000000) {
      return [255, 0, 0];
    } else if (maxPopulation > 100000) {
      return [0, 255, 0];
    } else {
      return [0, 0, 255];
    }
  },
  getRadius: (d: CensusTract) => {
    // This line duplicates what's done in `getFillColor` and doubles the cost
    const maxPopulation = Math.max.apply(null, Object.values(d.populationsByYear));
    return Math.sqrt(maxPopulation);
  }
});
```

```ts title="Good practice"
import {Color} from '@deck.gl/core';

// Calculate max population once and cache it
const maxPopulations: number[] = Data.map((d: CensusTract) => {
  // Use a for loop to avoid creating new objects
  let maxPopulation = 0;
  for (const year in populationsByYear) {
    const population = populationsByYear[year];
    if (population > maxPopulation) {
      maxPopulation = population;
    }
  }
  return maxPopulation;
});

// Use constant color values to avoid generating new arrays
const COLORS: {[name: string]: Color} = {
  ONE_MILLION: [255, 0, 0],
  HUNDRED_THOUSAND: [0, 255, 0],
  OTHER: [0, 0, 255]
};

const layer = new ScatterplotLayer<CensusTract>({
  data: DATA,
  getPosition: (d: CensusTract) => d.centroid,
  getFillColor: (d: CensusTract, {index}) => {
    const maxPopulation = maxPopulations[index];
    if (maxPopulation > 1000000) {
      return COLORS.ONE_MILLION;
    } else if (maxPopulation > 100000) {
      return COLORS.HUNDRED_THOUSAND;
    } else {
      return COLORS.OTHER;
    }
  },
  getRadius: (d: CensusTract, {index}) => Math.sqrt(maxPopulations[index]),
});
```

### Use Binary Data

When creating data-intensive applications, it is often desirable to offload client-side data processing to the server or web workers.

The server can send data to the client more efficiently using binary formats, e.g. [protobuf](https://developers.google.com/protocol-buffers), [Arrow](https://arrow.apache.org/) or simply a custom binary blob.

Some deck.gl applications use web workers to load data and generate attributes to get the processing off the main thread. Modern worker implementations allow ownership of typed arrays to be [transferred directly](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage#Parameters) between threads at virtually no cost, bypassing serialization and deserialization of JSON objects.

#### Supply binary blobs to the data prop

Assume we have the data source encoded in the following format:

```ts
// lon1, lat1, radius1, red1, green1, blue1, lon2, lat2, ...
const binaryData = new Float32Array([-122.4, 37.78, 1000, 255, 200, 0, -122.41, 37.775, 500, 200, 0, 0, -122.39, 37.8, 500, 0, 40, 200]);
```

Upon receiving the typed arrays, the application can of course re-construct a classic JavaScript array:

```ts title="Bad practice"
type DataType = {
  position: [lon: number, lat: number];
  radius: number;
  color: [r: number, g: numer, b: number];
}
const data: DataType[] = [];
for (let i = 0; i < binaryData.length; i += 6) {
  data.push({
    position: [binaryData[i], binaryData[i + 1]],
    radius: binaryData[i + 2],
    color: [binaryData[i + 3], binaryData[i + 4], binaryData[i + 5]]
  });
}

const data = new ScatterplotLayer<DataType>({
  data,
  getPosition: (d: DataType) => d.position,
  getRadius: (d: DataType) => d.radius,
  getFillColor: (d: DataType) => d.color
});
```

However, in addition to requiring custom repacking code, this array will take valuable CPU time to create, and significantly more memory to store than its binary form. In performance-sensitive applications that constantly push a large volume of data (e.g. animations), this method will not be efficient enough.

Alternatively, one may supply a non-iterable object (not Array or TypedArray) to the `data` object. In this case, it must contain a `length` field that specifies the total number of objects. Since `data` is not iterable, each accessor will not receive a valid `object` argument, and therefore responsible of interpreting the input data's buffer layout:

```ts title="Good practice"
// Note: binaryData.length does not equal the number of items,
// which is why we need to wrap it in an object that contains a custom `length` field
const DATA = {src: binaryData, length: binaryData.length / 6}

const layer = new ScatterplotLayer({
  data: DATA,
  getPosition: (_, {index, data}) => {
    return data.src.subarray(index * 6, index * 6 + 2);
  },
  getRadius: (_, {index, data}) => {
    return data.src[index * 6 + 2];
  },
  getFillColor: (_, {index, data, target}) => {
    return data.src.subarray(index * 6 + 3, index * 6 + 6);
  }
})
```

Optionally, the accessors can utilize the pre-allocated `target` array in the second argument to further avoid creating new objects:

```ts title="Good alternative"
const DATA = {src: binaryData, length: binaryData.length / 6}

const layer = new ScatterplotLayer({
  data: DATA,
  getPosition: (_, {index, data, target}) => {
    target[0] = data.src[index * 6];
    target[1] = data.src[index * 6 + 1];
    target[2] = 0;
    return target;
  },
  getRadius: (_, {index, data}) => {
    return data.src[index * 6 + 2];
  },
  getFillColor: (_, {index, data, target}) => {
    target[0] = data.src[index * 6 + 3];
    target[1] = data.src[index * 6 + 4];
    target[2] = data.src[index * 6 + 5];
    target[3] = 255;
    return target;
  }
})
```

#### Supply attributes directly

While the built-in attribute generation functionality is a major part of a `Layer`s functionality, it can become a major bottleneck in performance since it is done on CPU in the main thread. If the application needs to push many data changes frequently, for example to render animations, data updates can block rendering and user interaction. In this case, the application should consider precalculated attributes on the back end or in web workers. 

Deck.gl layers accepts external attributes as either a typed array or a luma.gl Buffers. Such attributes, if prepared carefully, can be directly utilized by the GPU, thus bypassing the CPU-bound attribute generation completely.

This technique offers the maximum performance possible in terms of data throughput, and is commonly used in heavy-duty, performance-sensitive applications.

To generate an attribute buffer for a layer, take the results returned from each object by the `get*` accessors and flatten them into a typed array. For example, consider the following layers:

```ts
type DataType = {
  position: [x: number, y: number, z: number];
  color: [r: number, g: number, b: number];
};
const POINT_CLOUD_DATA: DataType[] = [...];

// Calculate attributes on the main thread
const layer = new PointCloudLayer<DataType>({
  data: POINT_CLOUD_DATA,
  getPosition: (d: DataType) => d.position,
  getColor: (d: DataType) => d.color,
  getNormal: [0, 0, 1]
})
```

Should we move the attribute generation to a web worker:

```ts title="Worker"
// positions can be sent as either float32 or float64, depending on precision requirements
// point[0].x, point[0].y, point[0].z, point[1].x, point[1].y, point[1].z, ...
const positions = new Float64Array(POINT_CLOUD_DATA.flatMap((d: DataType) => d.position));
// point[0].r, point[0].g, point[0].b, point[1].r, point[1].g, point[1].b, ...
const colors = new Uint8Array(POINT_CLOUD_DATA.flatMap((d: DataType) => d.color));

// send back to main thread
postMessage({pointCount: POINT_CLOUD_DATA.length, positions, colors}, [positions.buffer, colors.buffer]);
```

```ts title="Main thread"
// `data` is received from the worker
const layer = new PointCloudLayer({
  data: {
    // this is required so that the layer knows how many points to draw
    length: data.pointCount,
    attributes: {
      getPosition: {value: data.positions, size: 3},
      getColor: {value: data.colors, size: 3},
    }
  },
  // constant accessor works without raw data
  getNormal: [0, 0, 1]
});
```

Note that instead of `getPosition`, we supply a `data.attributes.getPosition` object. This object defines the buffer from which `PointCloudLayer` should access its positions data. See the base `Layer` class' [data prop](../api-reference/core/layer.md#basic-properties) for details.

It is also possible to use interleaved or custom layout external buffers:

```ts title="Worker"
// x0,y0,z0, r0,g0,b0, x1,y1,z1, r1,g1,b1, ...
const positionsAndColors = new Float32Array(POINT_CLOUD_DATA.flatMap(d => [
  d.position[0],
  d.position[1],
  d.position[2],
  // colors must be normalized if sent as floats
  d.color[0] / 255,
  d.color[1] / 255,
  d.color[2] / 255
]));

// send back to main thread
postMessage({pointCount: POINT_CLOUD_DATA.length, positionsAndColors}, [positionsAndColors.buffer]);
```

```ts title="Main thread"
const buffer = deckInstance.device.createBuffer({data: data.positionsAndColors});

const layer = new PointCloudLayer({
  data: {
    length : data.pointCount,
    attributes: {
      getPosition: {buffer, size: 3, offset: 0, stride: 24},
      getColor: {buffer, size: 3, offset: 12, stride: 24},
    }
  },
  // constant accessor works without raw data
  getNormal: [0, 0, 1]
});
```

See full example in [examples/experimental/interleaved-buffer](https://github.com/visgl/deck.gl/tree/9.0-release/examples/experimental/interleaved-buffer).

Note that external attributes only work with primitive layers, not composite layers, because composite layers often need to preprocess the data before passing it to the sub layers. Some layers that deal with variable-width data, such as `PathLayer`, `SolidPolygonLayer`, require additional information passed along with `data.attributes`. Consult each layer's documentation before use.


## Layer Rendering Performance

Layer rendering time (for large data sets) is essentially proportional to:

1. The number of vertex shader invocations,
   which corresponds to the number of items in the layer's `data` prop
2. The number of fragment shader invocations, which corresponds to the total
   number of pixels drawn.

Thus it is possible to render a scatterplot layer with 10M items with reasonable
frame rates on recent GPUs, provided that the radius (number of pixels) of each
point is small.

It is good to be aware that excessive overdraw (drawing many objects/pixels on top of each other) can generate very high fragment counts and thus hurt performance. As an example, a `Scatterplot` radius of 5 pixels generates ~ 100 pixels per point. If you have a `Scatterplot` layer with 10 million points, this can result in up to 1 billion fragment shader invocations per frame. While dependent on zoom levels (clipping will improve performance to some extent) this many fragments will certainly strain even a recent MacBook Pro GPU.


## Layer Picking Performance

deck.gl performs picking by drawing the layer into an off screen picking buffer. This essentially means that every layer that supports picking will be drawn off screen when panning and hovering. The picking is performed using the same GPU code that does the visual rendering, so the performance should be easy to predict.

Picking limitations:

* The picking system can only distinguish between 16M items per layer.
* The picking system can only handle 256 layers with the pickable flag set to true.


## Number of Layers

The layer count of an advanced deck.gl application tends to gradually increase, especially when using composite layers. We have built and optimized a highly complex application using close to 100 deck.gl layers (this includes hierarchies of sublayers rendered by custom composite layers rendering other composite layers) without seeing any performance issues related to the number of layers. If you really need to, it is probably possible to go a little higher (a few hundred layers). Just keep in mind that deck.gl was not designed to be used with thousands of layers.


## Common Issues

A couple of particular things to watch out for that tend to have a big impact on performance:

* If not needed disable Retina/High DPI rendering. It generates 4x the number of pixels (fragments) and can have a big performance impact that depends on which computer or monitor is being used. This feature can be controlled using `useDevicePixels` prop of `DeckGL` component and it is on by default.
* Avoid using luma.gl debug mode in production. It queries the GPU error status after each operation which has a big impact on performance.

Smaller considerations:

* Enabling picking can have a small performance penalty so make sure the `pickable` property is `false` in layers that do not need picking (this is the default value).
