# StatsWidget (Experimental)

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

[OpenFreeMap](https://openfreemap.org/) [© OpenMapTiles](https://openmaptiles.org/) Data from

<!-- -->

[OpenStreetMap](https://www.openstreetmap.org/copyright)

Displays performance and debugging statistics from deck.gl, luma.gl, or custom probe.gl stats objects in a collapsible widget. When collapsed, it shows the current FPS in a compact button UI.

* JavaScript
* TypeScript
* React
* React Controlled

```
import {Deck} from '@deck.gl/core';

import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new StatsWidget({initialExpanded: true})

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new StatsWidget({initialExpanded: true})

  ]

});
```

```
import React from 'react';

import DeckGL, {_StatsWidget as StatsWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL>

      <StatsWidget initialExpanded />

    </DeckGL>

  );

}
```

```
import React, {useState} from 'react';

import DeckGL, {_StatsWidget as StatsWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  const [expanded, setExpanded] = useState(true);



  return (

    <DeckGL>

      <StatsWidget

        expanded={expanded}

        onExpandedChange={setExpanded}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {_StatsWidget as StatsWidget, type StatsWidgetProps} from '@deck.gl/widgets';

new StatsWidget({} satisfies StatsWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `StatsWidgetProps`[​](#statswidgetprops "Direct link to statswidgetprops")

The `StatsWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### type (string, optional)[​](#type-string-optional "Direct link to type (string, optional)")

Type of stats to display. One of `'deck'`, `'luma'`, `'device'`, or `'custom'`.

* Default: `'deck'`

#### stats (Stats, optional)[​](#stats-stats-optional "Direct link to stats (Stats, optional)")

A [Stats](https://visgl.github.io/probe.gl/docs/modules/stats) instance to display when using `type: 'custom'`.

#### title (string, optional)[​](#title-string-optional "Direct link to title (string, optional)")

Title shown in the widget header.

* Default: `'Stats'`

#### initialExpanded (boolean, optional)[​](#initialexpanded-boolean-optional "Direct link to initialExpanded (boolean, optional)")

If `true`, the UI is expanded at start.

* Default: `false`

#### framesPerUpdate (number, optional)[​](#framesperupdate-number-optional "Direct link to framesPerUpdate (number, optional)")

Number of frames to wait between refresh.

* Default: `1`

#### formatters (object, optional)[​](#formatters-object-optional "Direct link to formatters (object, optional)")

Custom formatters for stat values.

#### resetOnUpdate (object, optional)[​](#resetonupdate-object-optional "Direct link to resetOnUpdate (object, optional)")

Whether to reset particular stats after each update.

#### expanded (boolean, optional)[​](#expanded-boolean-optional "Direct link to expanded (boolean, optional)")

Controlled expanded state. When provided, the widget is in controlled mode and `initialExpanded` is ignored.

#### onExpandedChange (function, optional)[​](#onexpandedchange-function-optional "Direct link to onExpandedChange (function, optional)")

Callback when the expanded state changes (user clicks header). In controlled mode, use this to update the `expanded` prop.

### Built-in Formatters[​](#built-in-formatters "Direct link to Built-in Formatters")

* `'count'` - Display raw count value
* `'averageTime'` - Format as average time in ms/s
* `'totalTime'` - Format as total time in ms/s
* `'fps'` - Format as frames per second
* `'memory'` - Format as memory in MB

## Behavior[​](#behavior "Direct link to Behavior")

* When collapsed, click the FPS button to expand the stats display

* When expanded, click the header to collapse the stats display

* Stats are automatically updated based on `framesPerUpdate`

* Different stat types provide access to various performance metrics:

  <!-- -->

  * `'deck'`: deck.gl rendering statistics
  * `'luma'`: luma.gl WebGL statistics
  * `'device'`: GPU device statistics
  * `'custom'`: User-provided stats object

## Source[​](#source "Direct link to Source")

[modules/widgets/src/stats-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/stats-widget.tsx)
