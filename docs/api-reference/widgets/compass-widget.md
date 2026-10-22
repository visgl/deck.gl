# CompassWidget

![from v9.0](https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square)

<!-- -->

This widget visualizes bearing and pitch. Click it once to reset bearing to 0, click it a second time to reset pitch to 0. Supports [MapView](https://deck.gl/docs/api-reference/core/map-view.md) and [GlobeView](https://deck.gl/docs/api-reference/core/globe-view.md).

* JavaScript
* TypeScript
* React
* React Controlled

```
import {Deck} from '@deck.gl/core';

import {CompassWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.8,

    zoom: 11,

    pitch: 45,

    bearing: 30

  },

  controller: true,

  widgets: [

    new CompassWidget({placement: 'top-left'})

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {CompassWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.8,

    zoom: 11,

    pitch: 45,

    bearing: 30

  },

  controller: true,

  widgets: [

    new CompassWidget({placement: 'top-left'})

  ]

});
```

```
import React from 'react';

import {DeckGL, CompassWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL

      initialViewState={{

        longitude: -122.4,

        latitude: 37.8,

        zoom: 11,

        pitch: 45,

        bearing: 30

      }}

      controller

    >

      <CompassWidget placement="top-left" />

    </DeckGL>

  );

}
```

```
import React, {useState, useCallback} from 'react';

import {DeckGL, CompassWidget} from '@deck.gl/react';

import type {MapViewState} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  const [viewState, setViewState] = useState<MapViewState>({

    longitude: -122.4,

    latitude: 37.8,

    zoom: 11,

    pitch: 45,

    bearing: 30

  });



  const onViewStateChange = useCallback(({viewState: vs}) => {

    setViewState(vs as MapViewState);

  }, []);



  return (

    <DeckGL viewState={viewState} onViewStateChange={onViewStateChange} controller>

      <CompassWidget placement="top-left" />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {CompassWidget, type CompassWidgetProps} from '@deck.gl/widgets';

new CompassWidget({} satisfies CompassWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `CompassWidgetProps`[​](#compasswidgetprops "Direct link to compasswidgetprops")

The `CompassWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Compass'`

Tooltip message displayed while hovering a mouse over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `transitionDuration` (number, optional)[​](#transitionduration "Direct link to transitionduration")

* Default: `200`

Bearing and pitch reset transition duration in milliseconds.

#### `onReset` (Function, optional)[​](#onreset "Direct link to onreset")

```
(params: {viewId: string; bearing: number; pitch: number}) => void
```

* Default: `() => {}`

Callback when the compass reset button is clicked. Called for each viewport that will be reset.

* `viewId`: The view being reset
* `bearing`: The new bearing value (0)
* `pitch`: The new pitch value (0 if bearing was already 0)

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/docs/api-reference/widgets/styling.md#replacing-icons).

| Name                         | Type                                                                                  | Default              |
| ---------------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| `--icon-compass`             | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | Custom Icon          |
| `--icon-compass-north-color` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)                 | `rgb(240, 92, 68)`   |
| `--icon-compass-south-color` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)                 | `rgb(204, 204, 204)` |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/compass-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/compass-widget.tsx)
