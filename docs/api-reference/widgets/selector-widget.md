# SelectorWidget

![from v9.3](https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square)

<!-- -->

This widget renders an icon button that opens a popover menu of selectable options. Each option provides an icon and an optional label, and the button updates to reflect the current selection.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {SelectorWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



const deck = new Deck({

  widgets: [

    new SelectorWidget({

      initialValue: 'single',

      options: [

        {

          value: 'single',

          label: 'Single view',

          icon: './single.svg'

        },

        {

          value: 'split-horizontal',

          label: 'Split views horizontal',

          icon: './split-h.svg'

        },

        {

          value: 'split-vertical',

          label: 'Split views vertical',

          icon: './split-v.svg'

        }

      ],

      onChange: value => updateViews(value)

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {SelectorWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



type ViewLayout = 'single' | 'split-horizontal' | 'split-vertical';



const deck = new Deck({

  widgets: [

    new SelectorWidget<ViewLayout>({

      initialValue: 'single',

      options: [

        {

          value: 'single',

          label: 'Single view',

          icon: './single.svg'

        },

        {

          value: 'split-horizontal',

          label: 'Split views horizontal',

          icon: './split-h.svg'

        },

        {

          value: 'split-vertical',

          label: 'Split views vertical',

          icon: './split-v.svg'

        }

      ],

      onChange: value => updateViews(value)

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {SelectorWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



type ViewLayout = 'single' | 'split-horizontal' | 'split-vertical';



function App() {

  return (

    <DeckGL>

      <SelectorWidget<ViewLayout>

        initialValue="single"

        options={[

          {

            value: 'single',

            label: 'Single view',

            icon: './single.svg'

          },

          {

            value: 'split-horizontal',

            label: 'Split views horizontal',

            icon: './split-h.svg'

          },

          {

            value: 'split-vertical',

            label: 'Split views vertical',

            icon: './split-v.svg'

          }

        ]}

        onChange={value => updateViews(value)}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {SelectorWidget, type SelectorWidgetProps} from '@deck.gl/widgets';

new SelectorWidget<ValueT>({} satisfies SelectorWidgetProps<ValueT>);
```

## Types[​](#types "Direct link to Types")

### `SelectorWidgetProps`[​](#selectorwidgetprops "Direct link to selectorwidgetprops")

The `SelectorWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `options` (`SelectorWidgetOption[]`, required)[​](#options "Direct link to options")

Selectable options displayed in the popover menu.

#### `initialValue` (any, optional)[​](#initialvalue "Direct link to initialvalue")

* Default: value of the first option

Initial selected value. If it does not match any option, the first option is displayed.

#### `onChange` (function, optional)[​](#onchange "Direct link to onchange")

```
(value: ValueT) => void
```

Callback invoked when a new option is selected.

### `SelectorWidgetOption`[​](#selectorwidgetoption "Direct link to selectorwidgetoption")

#### `value` (any, required)[​](#value "Direct link to value")

Value returned from `onChange` when this option is selected.

#### `icon` (string, required)[​](#icon "Direct link to icon")

Data URL used as the option icon mask.

#### `label` (string, optional)[​](#label "Direct link to label")

Text shown in the menu and used as the button's `aria-label` and styled [tooltip](https://deck.gl/docs/api-reference/widgets/tooltips.md) when selected.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

## Styles[​](#styles "Direct link to Styles")

The `SelectorWidget` uses the shared button and menu theme variables described in the [styling guide](https://deck.gl/docs/api-reference/widgets/styling.md).

## Source[​](#source "Direct link to Source")

[modules/widgets/src/selector-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/selector-widget.tsx)
