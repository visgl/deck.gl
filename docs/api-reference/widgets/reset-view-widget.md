import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {ResetViewWidget} from '@deck.gl/widgets';

# ResetViewWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget resets the view state of a deck.gl viewport to its initial state. The user clicks the widget to return to the initial view.

## Usage

<WidgetPreview cls={ResetViewWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {ResetViewWidget} from '@deck.gl/widgets';

const deck = new Deck({
  widgets: [new ResetViewWidget()]
});
```

## Types

### `ResetViewWidgetProps` {#resetviewwidgetprops}

The `ResetViewWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Reset View'`

Tooltip message displayed while hovering a mouse over the widget.


## Styles

Learn more about how to replace icons in the [styling guide](/docs/api-reference/widgets/styling#replacing-icons).

| Name                | Type                     | Default                                       |
| ------------------- | ------------------------ | --------------------------------------------- |
| `--icon-reset-view` | [SVG Data Url][data_url] | [Material Symbol Reset Focus][icon_reset_view] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_reset_view_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:reset_focus:FILL@1;wght@400;GRAD@0;opsz@40&icon.size=40&icon.color=%23000000&icon.style=Rounded

## Source

[modules/widgets/src/reset-view-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/reset-view-widget.tsx)