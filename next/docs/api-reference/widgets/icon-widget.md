# IconWidget

![from v9.3](https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square)

<!-- -->

This widget renders a single icon button. Use it for simple actions that should live alongside the other built-in deck.gl widgets.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {IconWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new IconWidget({

      icon: `./run.svg`,

      label: 'Run!',

      onClick: () => alert('Running!')

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {IconWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new IconWidget({

      icon: `./run.svg`,

      label: 'Run!',

      onClick: () => alert('Running!')

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {IconWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL>

      <IconWidget

        icon="./run.svg"

        label="Run!"

        onClick={() => alert('Running!')}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {IconWidget, type IconWidgetProps} from '@deck.gl/widgets';

new IconWidget({} satisfies IconWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `IconWidgetProps`[​](#iconwidgetprops "Direct link to iconwidgetprops")

The `IconWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `icon` (string, required)[​](#icon "Direct link to icon")

Data URL used as the button icon mask.

#### `label` (string, optional)[​](#label "Direct link to label")

Tooltip message displayed while hovering over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `color` (string, optional)[​](#color "Direct link to color")

CSS color applied to the icon.

#### `onClick` (function, optional)[​](#onclick "Direct link to onclick")

```
() => void
```

Callback invoked when the button is clicked.

## Styles[​](#styles "Direct link to Styles")

The `IconWidget` uses the shared button theme variables described in the [styling guide](https://deck.gl/next/docs/api-reference/widgets/styling.md).

## Source[​](#source "Direct link to Source")

[modules/widgets/src/icon-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/icon-widget.tsx)
