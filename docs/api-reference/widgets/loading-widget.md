# LoadingWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

[OpenFreeMap](https://openfreemap.org/) [© OpenMapTiles](https://openmaptiles.org/) Data from

<!-- -->

[OpenStreetMap](https://www.openstreetmap.org/copyright)

This widget shows a spinning indicator while any deck.gl layers are loading data.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {LoadingWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new LoadingWidget({placement: 'top-left'})

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {LoadingWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new LoadingWidget({placement: 'top-left'})

  ]

});
```

```
import React from 'react';

import DeckGL, {LoadingWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL>

      <LoadingWidget placement="top-left" />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {LoadingWidget, type LoadingWidgetProps} from '@deck.gl/widgets';

new LoadingWidget({} satisfies LoadingWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `LoadingWidgetProps`[​](#loadingwidgetprops "Direct link to loadingwidgetprops")

The `InfoWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Loading data'`

Text used as the button's `aria-label` and displayed as a styled [tooltip](https://deck.gl/docs/api-reference/widgets/tooltips.md) on hover/focus.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `onLoadingChange` (Function, optional)[​](#onloadingchange "Direct link to onloadingchange")

```
(loading: boolean) => void
```

* Default: `() => {}`

Callback when the loading state changes. Called when layers transition between loading and loaded states.

## Source[​](#source "Direct link to Source")

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/loading-widget.tsx)
