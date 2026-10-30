# GimbalWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

Visualizes the orientation of an [OrbitView](https://deck.gl/docs/api-reference/core/orbit-view.md) using nested circles. Clicking resets `rotationOrbit` and `rotationX` to `0`.

* JavaScript
* TypeScript
* React
* React Controlled

```
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

```
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

```
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

```
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

## Constructor[​](#constructor "Direct link to Constructor")

```
import {GimbalWidget, type GimbalWidgetProps} from '@deck.gl/widgets';

new GimbalWidget({} satisfies GimbalWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `GimbalWidgetProps`[​](#gimbalwidgetprops "Direct link to gimbalwidgetprops")

The `GimbalWidgetProps` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Gimbal'`

Tooltip message displayed while hovering a mouse over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `strokeWidth` (number, optional)[​](#strokewidth "Direct link to strokewidth")

* Default: `1.5`

Width of gimbal lines.

#### `transitionDuration` (number, optional)[​](#transitionduration "Direct link to transitionduration")

* Default: `200`

View state transition duration in milliseconds.

#### `onReset` (Function, optional)[​](#onreset "Direct link to onreset")

```
(params: {viewId: string; rotationOrbit: number; rotationX: number}) => void
```

* Default: `() => {}`

Callback when the gimbal reset button is clicked. Called for each viewport that will be reset.

* `viewId`: The view being reset
* `rotationOrbit`: The new rotationOrbit value (0)
* `rotationX`: The new rotationX value (0)

## Styles[​](#styles "Direct link to Styles")

| Name                        | Default            |
| --------------------------- | ------------------ |
| `--icon-gimbal-outer-color` | `rgb(68, 92, 204)` |
| `--icon-gimbal-inner-color` | `rgb(240, 92, 68)` |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/gimbal-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/gimbal-widget.tsx)
