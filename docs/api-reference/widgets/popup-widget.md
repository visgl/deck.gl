# PopupWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.3" />

import {PopupWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<PopupWidgetDemo />

This widget shows a popup at a fixed position, or when an item in a deck.gl layer has been clicked or hovered.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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

  </TabItem>
</Tabs>

## Constructor

```ts
import {PopupWidget, type PopupWidgetProps} from '@deck.gl/widgets';
new PopupWidget({} satisfies PopupWidgetProps);
```

## Types

### `PopupWidgetProps` {#popupwidgetprops}

The `PopupWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### position ([number, number]) {#position}

Anchor of the popup in world coordinates, e.g. [longitude, latitude].

#### content (object) {#content}

Content to display in the popup. The object may contain the following fields:

* `text` (`string`) - Text content to display in the popup
* `html` (`string`) - HTML content to display in the popup. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the popup

#### marker (object, optional) {#marker}

Content to display at the anchor, regardless of whether the popup is open. Clicking on the marker opens the popup.
The object may contain the following fields:

* `text` (`string`) - Text content to display as the marker
* `html` (`string`) - HTML content to display as the marker. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the marker

#### defaultIsOpen (boolean, optional) {#defaultisopen}

Whether the pop up is open by default.

* Default: `true`

#### closeButton (boolean, optional) {#closebutton}

Whether to show a close button in the popup.

* Default `true`

#### closeOnClickOutside (boolean, optional) {#closeonclickoutside}

Close the popup if clicked outside.

* Default `false`

#### onOpenChange (Function, optional) {#onopenchange}

Callback when the popup is opened or closed. Receives the following parameters:

* `isOpen` (boolean) - the next state of the popup


#### placement (string, optional) {#placement}

Position content relative to the anchor.
One of `bottom` | `left` | `right` | `top` | `bottom-start` | `bottom-end` | `left-start` | `left-end` | `right-start` | `right-end` | `top-start` | `top-end`

* Default: `'right'`

#### offset (number) {#offset}

Pixel offset from the anchor

* Default: `10`

#### arrow (false | number | [number, number]) {#arrow}

Show an arrow pointing at the anchor. Value can be one of the following:

* `false` - do not display an arrow
* `number` - pixel size of the arrow
* `[width: number, height: number]` - pixel size of the arrow

* Default: `10`

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name            | Type                     | Default                                         |
| --------------- | ------------------------ | ----------------------------------------------- |
| `--icon-close` | [SVG Data Url][data_url] | [Material Symbol Close][close_icon_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[close_icon_url]: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:close:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=picture&icon.size=24&icon.color=%23000000

## Source

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/info-widget.tsx)
