import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ScaleWidget} from '@deck.gl/widgets';

# ScaleWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget displays a dynamic cartographic scale bar that updates as the map view changes. It shows a horizontal line with end tick marks and a distance label, reflecting the current map scale based on zoom level and latitude.

<WidgetPreview cls={_ScaleWidget}/>

```ts
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new ScaleWidget({placement: 'bottom-left', label: 'Scale'})]
});
```

## Props

#### `id` (string, optional) {#id}

Default: `'scale'`

Unique identifier for the widget.

#### `placement` (string, optional) {#placement}

Default: `'bottom-left'`

Widget position within the view. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Default: `'Scale'`

Tooltip label for the widget.


#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. Supports camelCase and kebab-case CSS variables.

#### `className` (string, optional) {#classname}

Default: None

Custom class name for the widget element.

## Source

[modules/widgets/src/scale-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/scale-widget.tsx)