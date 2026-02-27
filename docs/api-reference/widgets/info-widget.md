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
      getTooltip: (info) => ({
        text: 'Info'
      }),
      style: {width: '200px', boxShadow: 'rgba(0, 0, 0, 0.5) 2px 2px 5px'}
    })
  ]
});
```

## Types

### `InfoWidgetProps` {#infowidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### mode (string, optional) {#mode}

* Default: `'hover'`

Determines the interaction mode of the widget:
* `'click'`: The widget is triggered by a user click.
* `'hover'`: The widget is triggered when the user hovers over an element.

#### minOffset (number, optional) {#minoffset}

* Default: `0`

Minimum offset (in pixels) to keep the popup away from the canvas edges.

#### getTooltip (Function) {#gettooltip}

```ts
(info: PickingInfo, widget: InfoWidget) => TooltipContent | null
```

Function to generate the popup contents from the selected element. The returned object may contain the following fields:

* `position` (`number[]`) - Anchor of the popup in world coordinates, e.g. [longitude, latitude]. If not supplied, default to the mouse position where the popup was triggered.
* `text` (`string`) - Text content to display in the popup
* `html` (`string`) - HTML content to display in the popup. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the popup
* `className` (`string`) - additional class name to add to the popup
* `style` - CSS style overrides

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

## Source

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/info-widget.tsx)
