import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_InfoWidget} from '@deck.gl/widgets';

# InfoWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget shows a popup at a fixed position, or when an item in a deck.gl layer has been clicked or hovered.

## Usage

<WidgetPreview cls={_InfoWidget} props={{
  visible: true,
  position: [0, 0],
  text: "Info",
  style: {width: 50, boxShadow: 'rgba(0, 0, 0, 0.5) 2px 2px 5px'}
}}/>

```ts
import {Deck} from '@deck.gl/core';
import {_InfoWidget as InfoWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [
    new InfoWidget({
      visible: true,
      position: [0.45, 51.47],
      text: "Info",
      style: {width: 200, boxShadow: 'rgba(0, 0, 0, 0.5) 2px 2px 5px'}
    })
  ]
});
```

## Types

### `InfoWidgetProps` {#infowidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### position ([number, number]) {#position}

* Default: `[0, 0]`

Position at which to place popup (e.g. [longitude, latitude]).

#### text (string, optional) {#text}

* Default: `''`

Text to display within widget.

#### visible (boolean, optional) {#visible}

* Default: `false`

Whether the widget is visible.

#### mode (string, optional) {#mode}

* Default: `'hover'`

Determines the interaction mode of the widget:
* `'click'`: The widget is triggered by a user click.
* `'hover'`: The widget is triggered when the user hovers over an element.
* `'static'`: The widget remains visible at a fixed position.

#### minOffset (number, optional) {#minoffset}

* Default: `0`

Minimum offset (in pixels) to keep the popup away from the canvas edges.

#### getTooltip (Function, optional) {#gettooltip}

```ts
(info: PickingInfo, widget: InfoWidget) => InfoWidgetProps | null
```

* Default: `undefined`

Function to generate the popup contents from the selected element.

#### onClick (Function, optional) {#onclick}

```ts
(widget: InfoWidget, info: PickingInfo) => boolean
```

* Default: `undefined`

Callback triggered when the widget is clicked.

## Source

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/info-widget.tsx)
