# ClippingTextExtension

The `ClippingTextExtension` adds clipping support to `TextLayer` or any composite layer that renders a `TextLayer`, for example `MVTLayer`.

It lets the layer provide a per-object "clipping rectangle" that defines the context box that contains the text. Text overflowing this box will be hidden. If the layer has background enabled, the background rectangle will fill the clipping rectangle instead of fit around the text. Optionally, text can be automatically aligned to the visible region of the content box.

```js
import {TextLayer} from '@deck.gl/layers';
import {ClippingTextExtension} from '@deck.gl/extensions';

const layer = new TextLayer({
  id: 'labels',
  data: LABELS,
  getPosition: d => d.position,
  getText: d => d.name,
  getSize: 16,
  getColor: [0, 0, 0],

  // props added by ClippingTextExtension
  getClipRect: [0, 0, 120, -1],
  clipRectCutoffPixels: [60, 0],
  clipRectAlignHorizontal: 'start',

  extensions: [new ClippingTextExtension()]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {ClippingTextExtension} from '@deck.gl/extensions';
new ClippingTextExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```js
new deck.ClippingTextExtension();
```

## Constructor

```js
new ClippingTextExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `ClippingTextExtension` adds the following properties to the layer:

#### `getClipRect` ([Accessor&lt;number[4]&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getcliprect}

* Default: `[0, 0, -1, -1]`

Called to retrieve the clip rectangle for each text object. Returns `[x, y, width, height]`, where all values are meter offsets from the text anchor position.

- `x`, `y` define the clip rectangle origin relative to the text anchor.
- `width`, `height` define the clip rectangle size.
- A negative `width` disables clipping on the horizontal axis.
- A negative `height` disables clipping on the vertical axis.

#### `clipRectCutoffPixels` (number[2], optional) {#cliprectcutoffpixels}

* Default: `[0, 0]`

Minimum visible region of the clip rectangle in screen pixels. If the visible width or height is smaller than the specified cutoff, the corresponding text is hidden completely.

Format: `[minWidthPixels, minHeightPixels]`

#### `clipRectAlignHorizontal` (string, optional) {#scrollintoviewhorizontal}

* Default: `'none'`

Align the text horizontally to the visible region of the clip rectangle. If enabled, [getTextAnchor](../layers/text-layer.md#gettextanchor) is usually assigned a value that matches this prop.

Supported values:

- `'none'`
- `'start'`
- `'center'`
- `'end'`

#### `clipRectAlignVertical` (string, optional) {#scrollintoviewvertical}

* Default: `'none'`

Align the text vertically to the visible region of the clip rectangle. If enabled, [getAlignmentBaseline](../layers/text-layer.md#getalignmentbaseline) is usually assigned a value that matches this prop.

Supported values:

- `'none'`
- `'start'`
- `'center'`
- `'end'`


## Source

[modules/extensions/src/clipping-text](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/clipping-text)
