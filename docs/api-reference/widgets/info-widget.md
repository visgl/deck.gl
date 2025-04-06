import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_InfoWidget} from '@deck.gl/widgets';

# InfoWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

The InfoWidget shows a popup when an item in a layer has been clicked.

<WidgetPreview cls={_InfoWidget} props={{
  visible: true,
  position: [0, 0],
  text: "Info",
  style: {width: 50, boxShadow: 'rgba(0, 0, 0, 0.5) 2px 2px 5px'}
}}/>

```ts
import {_InfoWidget as InfoWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
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

## Props

#### `id` (string, optional) {#id}

Default: `'info'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly if you have multiple widgets of the same type.

#### position ([number, number]) {#position}

Position at which to place popup (e.g. [longitude, latitude]).

#### text (string, optional) {#text}

Text to display within widget.

#### visible (boolean, optional) {#visible}

Whether the widget is visible.

Default: `false`

#### minOffset (number, optional) {#minoffset}

Minimum offset (in pixels) to keep the popup away from the canvas edges.

#### onClick (Function, optional) {#onclick}

`(widget: _InfoWidget, info: PickingInfo) => boolean`

#### `viewId` (string, optional) {#viewid}

View to attach to and interact with. Required when using multiple views.

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-widget-info`.

## Source

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/info-widget.tsx)
