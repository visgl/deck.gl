# ScrollbarWidget

![from v9.3](https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square)

<!-- -->

This widget renders a scrollbar UI that mimics the native HTML scrolling behavior. It works with the [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view.md) to create a "scrollable" canvas of arbitrary size.

* JavaScript
* TypeScript
* React

```
import {Deck, OrthographicView} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import {ScrollbarWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



const data = Array.from({length: 1000}, (_, i) => [i * 100, 0]);



new Deck({

  views: new OrthographicView({'ortho'}),

  controller: {scrollZoom: false},

  initialViewState: {

    target: [0, 0, 0],

    zoom: 0

  },

  layers: [

    new ScatterplotLayer({

      id: 'points',

      data,

      getPosition: d => d,

      getRadius: 20,

      getFillColor: [200, 0, 80]

    })

  ],

  widgets: [

    new ScrollbarWidget({

      viewId: 'ortho',

      contentBounds: [

        [-100, 0, 0],

        [100 * 1001, 0, 0]

      ],

      orientation: 'horizontal',

      captureWheel: true

    })

  ]

});
```

```
import {Deck, OrthographicView} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import {ScrollbarWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



type Point = [x: number, y: number];



const data = Array.from({length: 1000}, (_, i) => [i * 100, 0] as Point);



new Deck({

  views: new OrthographicView({'ortho'}),

  controller: {scrollZoom: false},

  initialViewState: {

    target: [0, 0, 0],

    zoom: 0

  },

  layers: [

    new ScatterplotLayer<Point>({

      id: 'points',

      data,

      getPosition: d => d,

      getRadius: 20,

      getFillColor: [200, 0, 80]

    })

  ],

  widgets: [

    new ScrollbarWidget({

      viewId: 'ortho',

      contentBounds: [

        [-100, 0, 0],

        [100 * 1001, 0, 0]

      ],

      orientation: 'horizontal',

      captureWheel: true

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {ScrollbarWidget} from '@deck.gl/react';

import {OrthographicView} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import '@deck.gl/widgets/stylesheet.css';



type Point = [x: number, y: number];



const data = Array.from({length: 1000}, (_, i) => [i * 100, 0] as Point);



function App() {

  return (

    <DeckGL

      views={new OrthographicView({'ortho'})}

      controller={{scrollZoom: false}}

      initialViewState={{

        target: [0, 0, 0],

        zoom: 0

      }}

      layers={[

        new ScatterplotLayer<Point>({

          id: 'points',

          data,

          getPosition: d => d,

          getRadius: 20,

          getFillColor: [200, 0, 80]

        })

      ]}

    >

      <ScrollbarWidget

        viewId="ortho"

        contentBounds={[

          [-100, 0, 0],

          [100 * 1001, 0, 0]

        ]}

        orientation="horizontal"

        captureWheel

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ScrollbarWidget, type ScrollbarWidgetProps} from '@deck.gl/widgets';

new ScrollbarWidget({} satisfies ScrollbarWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ScrollbarWidgetProps`[​](#scrollbarwidgetprops "Direct link to scrollbarwidgetprops")

The `ScrollbarWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### contentBounds (\[min: number\[], max: number\[]])[​](#contentbounds-min-number-max-number "Direct link to contentBounds (\[min: number\[], max: number\[]])")

The full extent of the scrollable content, in world coordinates. The widget relies on this value to calculate the position and size of the slider button and track. If not supplied, falls back to [maxBounds](https://deck.gl/docs/api-reference/core/controller.md#options) of the controller. If no bounds definition is found, the scrollbar will always be hidden.

#### contentBoundsPadding (object, optional)[​](#contentboundspadding-object-optional "Direct link to contentBoundsPadding (object, optional)")

Padding inside the viewport used to display `contentBounds`, in the shape of `{left, right, top, bottom}`. Values use the same pixel, percentage, and CSS-style expression syntax as [`maxBoundsPadding`](https://deck.gl/docs/api-reference/core/controller.md#options). If not supplied, falls back to `maxBoundsPadding` of the target view's controller.

#### orientation (string, optional)[​](#orientation-string-optional "Direct link to orientation (string, optional)")

Direction of the scrollbar. `'horizontal'` scrolls the camera along the X axis, and `'vertical'` scrolls the camera along the Y axis.

* Default: `'vertical'`

#### stepSize (number, optional)[​](#stepsize-number-optional "Direct link to stepSize (number, optional)")

Pixels scrolled when clicked on the navigation buttons.

* Default: 1/10 of the viewport size

#### pageSize (number, optional)[​](#pagesize-number-optional "Direct link to pageSize (number, optional)")

Pixels scrolled when clicked on the track.

* Default: 100% of the viewport size

#### startButtonAriaLabel (string, optional)[​](#startbuttonarialabel-string-optional "Direct link to startButtonAriaLabel (string, optional)")

Label of the step button at the start.

* Default: `'Scroll left'` if horizontal, `'Scroll up'` if vertical

#### endButtonAriaLabel (string, optional)[​](#endbuttonarialabel-string-optional "Direct link to endButtonAriaLabel (string, optional)")

Label of the step button at the end.

* Default: `'Scroll right'` if horizontal, `'Scroll down'` if vertical

#### captureWheel (boolean, optional)[​](#capturewheel-boolean-optional "Direct link to captureWheel (boolean, optional)")

If `true`, mouse wheel events over the canvas will be intercepted by this scrollbar. This is useful when the app wants to simulate the HTML native page scrolling behavior.

* Default: `false`

#### decorations (ScrollbarDecoration\[], optional)[​](#decorations-scrollbardecoration-optional "Direct link to decorations (ScrollbarDecoration\[], optional)")

Custom markers to overlay on the track. This can serve as visual reference or highlights of areas of interest even when they are outside of the current viewport.

### ScrollbarDecoration[​](#scrollbardecoration "Direct link to ScrollbarDecoration")

A `ScrollbarDecoration` object

* `contentBounds` (\[min: number\[], max: number\[]]) - world position that the decoration represents
* `color` (string) - CSS color of the decoration
* `title` (string, optional) - Tooltip when the decoration is hovered
* `onClick` (function, optional) - Callback when the decoration is clicked. Receives the following parameters:
  <!-- -->
  * `event` (MouseEvent) Return `true` to mark the event as handled, and prevent the default behavior.

## Styles[​](#styles "Direct link to Styles")

The ScrollbarWidget uses theme CSS variables for [RangeInput](https://deck.gl/docs/api-reference/widgets/styling.md#range-input).

## Source[​](#source "Direct link to Source")

[modules/widgets/src/scrollbar-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/scrollbar-widget.tsx)
