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

## Props

#### `id` (string, optional) {#id}

Default: `'geolocate'`

Unique identifier for the widget.

#### `viewId` (string, optional) {#viewid}

Default: `null`

Attach the widget to a specific view by view id.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view. Valid options: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `fill`.

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