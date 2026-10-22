# ScaleWidget (Experimental)

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

This widget displays a dynamic cartographic scale bar that updates as the map view changes. It shows a horizontal line with end tick marks and a distance label, reflecting the current map scale based on zoom level and latitude.

* JavaScript
* TypeScript
* React

```
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ScaleWidget({placement: 'top-left'})

  ]

});
```

```
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ScaleWidget({placement: 'top-left'})

  ]

});
```

```
import React from 'react';

import DeckGL, {_ScaleWidget as ScaleWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL>

      <ScaleWidget placement="top-left" />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {_ScaleWidget as ScaleWidget, type ScaleWidgetProps} from '@deck.gl/widgets';

new ScaleWidget({} satisfies ScaleWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ScaleWidgetProps`[​](#scalewidgetprops "Direct link to scalewidgetprops")

The `ScaleWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Scale'`

Tooltip label for the widget.

## Source[​](#source "Direct link to Source")

[modules/widgets/src/scale-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/scale-widget.tsx)
