# ToggleWidget

![from v9.3](https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square)

<!-- -->

This widget renders an icon button with internal on/off state. It is useful for lightweight toggles such as layer visibility, mode switches, or filter controls.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ToggleWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ToggleWidget({

      icon: `./moon.png`,

      onIcon: `./sun.png`,

      label: 'Color mode',

      color: 'dodgerblue',

      onColor: 'orange',

      onChange: checked => updateLayers(checked ? 'light' : 'dark')

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {ToggleWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ToggleWidget({

      icon: `./moon.png`,

      onIcon: `./sun.png`,

      label: 'Color mode',

      color: 'dodgerblue',

      onColor: 'orange',

      onChange: checked => updateLayers(checked ? 'light' : 'dark')

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {ToggleWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL>

      <ToggleWidget

        icon="./moon.png"

        onIcon="./sun.png"

        label="Color mode"

        color="dodgerblue"

        onColor="orange"

        onChange={checked => updateLayers(checked ? 'light' : 'dark')}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ToggleWidget, type ToggleWidgetProps} from '@deck.gl/widgets';

new ToggleWidget({} satisfies ToggleWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ToggleWidgetProps`[​](#togglewidgetprops "Direct link to togglewidgetprops")

The `ToggleWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `initialChecked` (boolean, optional)[​](#initialchecked "Direct link to initialchecked")

* Default: `false`

Whether the widget starts in the checked state.

#### `icon` (string, required)[​](#icon "Direct link to icon")

Data URL used as the default button icon mask.

#### `onIcon` (string, optional)[​](#onicon "Direct link to onicon")

* Default: same as `icon`

Data URL used as the icon when the widget is checked.

#### `label` (string, optional)[​](#label "Direct link to label")

Tooltip message displayed while hovering over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `onLabel` (string, optional)[​](#onlabel "Direct link to onlabel")

* Default: same as `label`

Tooltip shown while the widget is checked.

#### `onTooltip` (string | HTMLElement | false, optional)[​](#ontooltip "Direct link to ontooltip")

* Default: value of `onLabel`

Custom tooltip content when the widget is checked. Overrides the default onLabel text in the tooltip. Pass `false` to disable.

#### `color` (string, optional)[​](#color "Direct link to color")

CSS color of the icon.

#### `onColor` (string, optional)[​](#oncolor "Direct link to oncolor")

* Default: same as `color`

CSS color of the icon while the widget is checked.

#### `onChange` (function, optional)[​](#onchange "Direct link to onchange")

```
(checked: boolean) => void
```

Callback invoked after the widget toggles state.

## Styles[​](#styles "Direct link to Styles")

The `ToggleWidget` uses the shared button theme variables described in the [styling guide](https://deck.gl/next/docs/api-reference/widgets/styling.md).

## Source[​](#source "Direct link to Source")

[modules/widgets/src/toggle-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/toggle-widget.tsx)
