# ResetViewWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

This widget resets the view state of a deck.gl viewport to its initial state. The user clicks the widget to return to the initial view.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ResetViewWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new ResetViewWidget({

      initialViewState: {

        longitude: -20,

        latitude: 15,

        zoom: 0

      }

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {ResetViewWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new ResetViewWidget({

      initialViewState: {

        longitude: -20,

        latitude: 15,

        zoom: 0

      }

    })

  ]

});
```

```
import React from 'react';

import {DeckGL, ResetViewWidget} from '@deck.gl/react';

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

      <ResetViewWidget

        initialViewState={{

          longitude: -20,

          latitude: 15,

          zoom: 0

        }}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ResetViewWidget, type ResetViewWidgetProps} from '@deck.gl/widgets';

new ResetViewWidget({} satisfies ResetViewWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ResetViewWidgetProps`[​](#resetviewwidgetprops "Direct link to resetviewwidgetprops")

The `ResetViewWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Reset View'`

Tooltip message displayed while hovering a mouse over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `initialViewState` (ViewState, optional)[​](#initialviewstate "Direct link to initialviewstate")

* Default: `deck.props.initialViewState`

The initial view state to reset the view to.

#### `onReset` (Function, optional)[​](#onreset "Direct link to onreset")

```
(params: {viewId: string; viewState: Record<string, unknown>}) => void
```

* Default: `() => {}`

Callback when the reset view button is clicked.

* `viewId`: The view being reset
* `viewState`: The view state being reset to

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/next/docs/api-reference/widgets/styling.md#replacing-icons).

| Name                | Type                                                                                  | Default                                            |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `--icon-reset-view` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | \[Material Symbol Reset Focus]\[icon\_reset\_view] |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/reset-view-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/reset-view-widget.tsx)
