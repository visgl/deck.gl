import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_GeolocateWidget} from '@deck.gl/widgets';

# GeolocateWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget allows users to input geographic coordinates (decimal or DMS format) and fly the view to that location. Enter coordinates in the text box and click "Go" or press Enter.

<WidgetPreview cls={_GeolocateWidget}/>

```ts
import {_GeolocateWidget as GeolocateWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new GeolocateWidget({label: 'Geolocate', transitionDuration: 300})]
});
```

## Types

### `GeolocateWidgetProps` 

The `GeolocateWidget` accepts the generic [`WidgetProps`](../core/widget.md#props):

- `id` (default `'geolocate'`) -  Unique id for this widget
- `placement` (default `'top-left'`) - Widget position within the view relative to the map container
- `viewId` (default `null`) - The `viewId` prop controls how a widget interacts with views. 
- `style` (default `{}`) - Additional inline styles on the top HTML element.
- `className` (default `''`) - Additional classnames on the top HTML element.

#### `label` (string, optional) {#label}

Default: `'Geolocate'`

Placeholder text and tooltip for the input box.

#### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

View transition duration in milliseconds.

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget container.

#### `className` (string, optional) {#classname}

Default: None

Custom class name for the widget element.

## Source

[modules/widgets/src/geolocate-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/geolocate-widget.tsx)