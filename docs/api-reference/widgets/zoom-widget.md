# ZoomWidget

![from v9.0](https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square)

<!-- -->

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in or '-' to zoom out by the configured `zoomStep`. Supports controlling Map and Globe views.

* JavaScript
* TypeScript
* React
* React Controlled

```
import {ZoomWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new ZoomWidget({placement: 'top-left'})

  ]

});
```

```
import {ZoomWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new ZoomWidget({placement: 'top-left'})

  ]

});
```

```
import React from 'react';

import {DeckGL, ZoomWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL

      initialViewState={{

        longitude: 0,

        latitude: 52,

        zoom: 4

      }}

      controller

    >

      <ZoomWidget placement="top-left" />

    </DeckGL>

  );

}
```

```
import React, {useState, useCallback} from 'react';

import {DeckGL, ZoomWidget} from '@deck.gl/react';

import type {MapViewState} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  const [viewState, setViewState] = useState<MapViewState>({

    longitude: 0,

    latitude: 52,

    zoom: 4

  });



  const onViewStateChange = useCallback(({viewState: vs}) => {

    setViewState(vs as MapViewState);

  }, []);



  return (

    <DeckGL viewState={viewState} onViewStateChange={onViewStateChange} controller>

      <ZoomWidget placement="top-left" />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ZoomWidget, type ZoomWidgetProps} from '@deck.gl/widgets';

new ZoomWidget({} satisfies ZoomWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ZoomWidgetProps`[​](#zoomwidgetprops "Direct link to zoomwidgetprops")

The `ZoomWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `orientation` (string, optional)[​](#orientation "Direct link to orientation")

* Default: `'vertical'`

Widget button orientation. Valid options are `vertical` or `horizontal`.

#### `zoomAxis` (string, optional)[​](#zoomaxis "Direct link to zoomaxis")

* Default: `'all'`

Which axes to apply zoom to. One of 'X', 'Y' or 'all'. Only effective if the current view is an [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view.md).

#### `zoomStep` (number, optional)[​](#zoomstep "Direct link to zoomstep")

![from v9.4](https://img.shields.io/badge/from-v9.4-green.svg?style=flat-square)

* Default: `1`

Zoom level delta applied by each button click.

#### `zoomInLabel` (string, optional)[​](#zoominlabel "Direct link to zoominlabel")

* Default: `'Zoom In'`

Tooltip message displayed while hovering a mouse over the zoom in button.

#### `zoomInTooltip` (string | HTMLElement | false, optional)[​](#zoomintooltip "Direct link to zoomintooltip")

* Default: value of `zoomInLabel`

Custom tooltip content for the zoom in button. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `zoomOutLabel` (string, optional)[​](#zoomoutlabel "Direct link to zoomoutlabel")

* Default: `'Zoom Out'`

Tooltip message displayed while hovering a mouse over the zoom out button.

#### `zoomOutTooltip` (string | HTMLElement | false, optional)[​](#zoomouttooltip "Direct link to zoomouttooltip")

* Default: value of `zoomOutLabel`

Custom tooltip content for the zoom out button. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `transitionDuration` (number, optional)[​](#transitionduration "Direct link to transitionduration")

* Default: `200`

Zoom transition duration in milliseconds.

#### `onZoom` (Function, optional)[​](#onzoom "Direct link to onzoom")

```
(params: {viewId: string; delta: number; zoom: number}) => void
```

* Default: `() => {}`

Callback when zoom buttons are clicked. Called for each viewport that will be zoomed.

* `viewId`: The view being zoomed
* `delta`: Zoom direction (+1 for zoom in, -1 for zoom out)
* `zoom`: The new zoom level
* `zoomX`: The new zoom level on X axis, if used with an `OrthographicView`.
* `zoomY`: The new zoom level on Y axis, if used with an `OrthographicView`.

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/docs/api-reference/widgets/styling.md#replacing-icons).

| Name              | Type                                                                                  | Default                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--icon-zoom-in`  | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Add](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40)       |
| `--icon-zoom-out` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Remove](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40) |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/zoom-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/zoom-widget.tsx)
