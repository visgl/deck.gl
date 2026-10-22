# PopupWidget

![from v9.3](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

This widget shows a popup at a fixed position, or when an item in a deck.gl layer has been clicked or hovered.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {PopupWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: -0.453,

    latitude: 51.471,

    zoom: 10

  },

  controller: true,

  widgets: [

    new PopupWidget({

      position: [-0.453, 51.471],

      content: {

        text: "I'm here"

      },

      marker: {

        html: '<div style="font-size:28px;transform:translate(-50%,-50%);">🏠</div>'

      },

      defaultIsOpen: true,

      closeButton: true,

      closeOnClickOutside: true

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {PopupWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: -0.453,

    latitude: 51.471,

    zoom: 10

  },

  controller: true,

  widgets: [

    new PopupWidget({

      position: [-0.453, 51.471],

      content: {

        text: "I'm here"

      },

      marker: {

        html: '<div style="font-size:28px;transform:translate(-50%,-50%);">🏠</div>'

      },

      defaultIsOpen: true,

      closeButton: true,

      closeOnClickOutside: true

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {PopupWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL

      initialViewState={{

        longitude: -0.453,

        latitude: 51.471,

        zoom: 10

      }}

      controller

    >

      <PopupWidget

        position={[-0.453, 51.471]}

        content={{text: "I'm here"}}

        marker={{

          html: '<div style="font-size:28px;transform:translate(-50%,-50%);">🏠</div>'

        }}

        defaultIsOpen

        closeButton

        closeOnClickOutside

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {PopupWidget, type PopupWidgetProps} from '@deck.gl/widgets';

new PopupWidget({} satisfies PopupWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `PopupWidgetProps`[​](#popupwidgetprops "Direct link to popupwidgetprops")

The `PopupWidget` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### position (\[number, number])[​](#position "Direct link to position (\[number, number])")

Anchor of the popup in world coordinates, e.g. \[longitude, latitude].

#### content (object)[​](#content "Direct link to content (object)")

Content to display in the popup. The object may contain the following fields:

* `text` (`string`) - Text content to display in the popup
* `html` (`string`) - HTML content to display in the popup. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the popup

#### marker (object, optional)[​](#marker "Direct link to marker (object, optional)")

Content to display at the anchor, regardless of whether the popup is open. Clicking on the marker opens the popup. The object may contain the following fields:

* `text` (`string`) - Text content to display as the marker
* `html` (`string`) - HTML content to display as the marker. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the marker

#### defaultIsOpen (boolean, optional)[​](#defaultisopen "Direct link to defaultIsOpen (boolean, optional)")

Whether the pop up is open by default.

* Default: `true`

#### closeButton (boolean, optional)[​](#closebutton "Direct link to closeButton (boolean, optional)")

Whether to show a close button in the popup.

* Default `true`

#### closeOnClickOutside (boolean, optional)[​](#closeonclickoutside "Direct link to closeOnClickOutside (boolean, optional)")

Close the popup if clicked outside.

* Default `false`

#### onOpenChange (Function, optional)[​](#onopenchange "Direct link to onOpenChange (Function, optional)")

Callback when the popup is opened or closed. Receives the following parameters:

* `isOpen` (boolean) - the next state of the popup

#### placement (string, optional)[​](#placement "Direct link to placement (string, optional)")

Position content relative to the anchor. One of `bottom` | `left` | `right` | `top` | `bottom-start` | `bottom-end` | `left-start` | `left-end` | `right-start` | `right-end` | `top-start` | `top-end`

* Default: `'right'`

#### offset (number)[​](#offset "Direct link to offset (number)")

Pixel offset from the anchor

* Default: `10`

#### arrow (false | number | \[number, number])[​](#arrow "Direct link to arrow (false | number | \[number, number])")

Show an arrow pointing at the anchor. Value can be one of the following:

* `false` - do not display an arrow

* `number` - pixel size of the arrow

* `[width: number, height: number]` - pixel size of the arrow

* Default: `10`

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/docs/api-reference/widgets/styling.md#replacing-icons).

| Name           | Type                                                                                  | Default                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--icon-close` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Close](https://fonts.google.com/icons?selected=Material+Symbols+Outlined:close:FILL@0;wght@400;GRAD@0;opsz@24\&icon.query=picture\&icon.size=24\&icon.color=%23000000) |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/info-widget.tsx)
