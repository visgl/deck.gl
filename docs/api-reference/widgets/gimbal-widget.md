# GimbalWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {GimbalWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<GimbalWidgetDemo />

Visualizes the orientation of an [OrbitView](../core/orbit-view.md) using nested circles. Clicking resets `rotationOrbit` and `rotationX` to `0`.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, OrbitView} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  views: new OrbitView({orbitAxis: 'Y'}),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 30
  },
  controller: true,
  widgets: [
    new GimbalWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, OrbitView} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  views: new OrbitView({orbitAxis: 'Y'}),
  initialViewState: {
    target: [0, 0, 0] as [number, number, number],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 30
  },
  controller: true,
  widgets: [
    new GimbalWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {GimbalWidget} from '@deck.gl/react';
import {OrbitView} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL
      views={new OrbitView({orbitAxis: 'Y'})}
      initialViewState={{
        target: [0, 0, 0],
        zoom: 0,
        rotationX: -45,
        rotationOrbit: 30
      }}
      controller
    >
      <GimbalWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState, useCallback} from 'react';
import DeckGL, {GimbalWidget} from '@deck.gl/react';
import {OrbitView, type OrbitViewState} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [viewState, setViewState] = useState<OrbitViewState>({
    target: [0, 0, 0],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 30
  });

  const onViewStateChange = useCallback(({viewState: vs}) => {
    setViewState(vs as OrbitViewState);
  }, []);

  return (
    <DeckGL
      views={new OrbitView({orbitAxis: 'Y'})}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      controller
    >
      <GimbalWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {GimbalWidget, type GimbalWidgetProps} from '@deck.gl/widgets';
new GimbalWidget({} satisfies GimbalWidgetProps);
```

## Types

### `GimbalWidgetProps` {#gimbalwidgetprops}

The `GimbalWidgetProps` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Gimbal'`

Tooltip message displayed while hovering a mouse over the widget.

#### `strokeWidth` (number, optional) {#strokewidth}

* Default: `1.5`

Width of gimbal lines.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

View state transition duration in milliseconds.

#### `onReset` (Function, optional) {#onreset}

```ts
(params: {viewId: string; rotationOrbit: number; rotationX: number}) => void
```

* Default: `() => {}`

Callback when the gimbal reset button is clicked. Called for each viewport that will be reset.

- `viewId`: The view being reset
- `rotationOrbit`: The new rotationOrbit value (0)
- `rotationX`: The new rotationX value (0)

## Styles

| Name | Default |
| ---- | ------- |
| `--icon-gimbal-outer-color` | `rgb(68, 92, 204)` |
| `--icon-gimbal-inner-color` | `rgb(240, 92, 68)` |

## Source

[modules/widgets/src/gimbal-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/gimbal-widget.tsx)
