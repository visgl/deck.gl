# IconWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget renders a single icon button. Use it for simple actions that should live alongside the other built-in deck.gl widgets.

## Usage


```ts
import {Deck} from '@deck.gl/core';
import {IconWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [
    new IconWidget({
      icon: `./action.svg`,
      label: 'Custom action',
      onClick: () => {
        // do something
      }
    })
  ]
});
```

## Types

### `IconWidgetProps` {#iconwidgetprops}

The `IconWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `icon` (string, required) {#icon}

Data URL used as the button icon mask.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering over the widget.

#### `color` (string, optional) {#color}

CSS color applied to the icon.

#### `onClick` (function, optional) {#onclick}

```ts
() => void
```

Callback invoked when the button is clicked.

## Styles

The `IconWidget` uses the shared button theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/icon-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/icon-widget.tsx)
