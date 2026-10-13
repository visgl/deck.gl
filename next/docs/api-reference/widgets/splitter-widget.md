# SplitterWidget (Experimental)

![from v9.3](https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square)

<!-- -->

This widget lets the user to stack multiple views across the deck.gl canvas, and resize them by draggable splitter handles. This widget will only work if the `views` prop of Deck is unset.

* JavaScript
* TypeScript
* React
* React Controlled

```
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';

import {Deck, OrbitView} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0},

    perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0}

  },

  widgets: [

    new SplitterWidget({

      viewLayout: {

        orientation: 'horizontal',

        views: [

          new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),

          new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})

        ]

      }

    })

  ]

});
```

```
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';

import {Deck, OrbitView, type OrbitViewState} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck<OrbitView[]>({

  initialViewState: {

    front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0} satisfies OrbitViewState,

    perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0} satisfies OrbitViewState

  },

  widgets: [

    new SplitterWidget<OrbitView[]>({

      viewLayout: {

        orientation: 'horizontal',

        views: [

          new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),

          new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})

        ]

      }

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {_SplitterWidget as SplitterWidget} from '@deck.gl/react';

import {OrbitView, type OrbitViewState} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL

      initialViewState={{

        front: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 90, zoom: 0} satisfies OrbitViewState,

        perspective: {target: [0, 0, 0], rotationX: 45, rotationOrbit: 30, zoom: 0} satisfies OrbitViewState

      }}

    >

      <SplitterWidget

        viewLayout={{

          orientation: 'horizontal',

          views: [

            new OrbitView({id: 'front', orbitAxis: 'Z', orthographic: true, controller: true}),

            new OrbitView({id: 'perspective', orbitAxis: 'Z', controller: true})

          ]

        }}

      />

    </DeckGL>

  );

}
```

```
import React, {useState} from 'react';

import DeckGL, {_SplitterWidget as SplitterWidget} from '@deck.gl/react';

import {MapView, type MapViewState, type View} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  const [views, setViews] = useState<View[]>([]);

  const [viewState, setViewState] = useState<Record<string, MapViewState>>({

    left: {longitude: -122.4, latitude: 37.8, zoom: 11},

    right: {longitude: -73.97, latitude: 40.77, zoom: 11}

  });



  return (

    <DeckGL

      views={views}

      viewState={viewState}

      onViewStateChange={({viewId, viewState: vs}) => {

        setViewState(prev => ({...prev, [viewId]: vs as MapViewState}));

      }}

    >

      <SplitterWidget

        viewLayout={{

          orientation: 'horizontal',

          views: [

            new MapView({id: 'left', controller: true}),

            new MapView({id: 'right', controller: true})

          ]

        }}

        onChange={setViews}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {

  _SplitterWidget as SplitterWidget,

  type SplitterWidgetProps

} from '@deck.gl/widgets';

new SplitterWidget<ViewType[]>({} satisfies SplitterWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `SplitterWidgetProps`[​](#splitterwidgetprops "Direct link to splitterwidgetprops")

The `SplitterWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `viewLayout` (SplitterWidgetViewLayout, required)[​](#viewlayout "Direct link to viewlayout")

Layout descriptor of how views are arranged on the canvas. Contains the following fields:

* `views` ([View](https://deck.gl/next/docs/api-reference/core/view.md)\[]) - two view instances used to compose this layout. `x`, `y`, `width` and `height` of the views' props at render time will be resolved according to the following settings as well as user input.
* `orientation` (string, required) - the stacking orientation of the views. one of `'vertical'`, `'horizontal'`.
* `initialSplit` (number, optional) - The ratio of view1's share over the whole available height (vertical) or width (horizontal). Between 0-1. Default `0.5`.
* `editable` (boolean, optional) - Whether the split can be changed by dragging the border between the two views. Default `true`.
* `minSplit` (number, optional) - Min value of the split. The user cannot make the first view smaller than this ratio. Default `0.05`.
* `maxSplit` (number, optional) - Max value of the split. The user cannot make the first view larger than this ratio. Default `0.95`.

You may also replace one or both items in `views` with a nested `SplitterWidgetViewLayout` object, composing more than two views into a complex layout.

#### `onChange` (Function, optional)[​](#onchange "Direct link to onchange")

```
(views: View[]) => void
```

* Default: `() => {}`

Callback invoked during dragging with the updated view instances

#### `onDragStart` (Function, optional)[​](#ondragstart "Direct link to ondragstart")

```
() => void
```

* Default: `() => {}`

Callback invoked when the user begins dragging the splitter.

#### `onDragEnd` (Function, optional)[​](#ondragend "Direct link to ondragend")

```
() => void
```

* Default: `() => {}`

Callback invoked when the user releases the splitter.

## Source[​](#source "Direct link to Source")

[modules/widgets/src/splitter-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/splitter-widget.tsx)
