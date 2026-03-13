# SelectorWidget

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

This widget renders an icon button that opens a popover menu of selectable options. Each option provides an icon and an optional label, and the button updates to reflect the current selection.

## Usage

```ts
import {Deck} from '@deck.gl/core';
import {SelectorWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [
    new SelectorWidget({
      initialValue: 'single',
      options: [
        {
          value: 'single',
          label: 'Single view',
          icon: `./single-view.svg`
        },
        {
          value: 'split-horizontal',
          label: 'Split horizontal',
          icon: `./split-views-horizontal.svg`
        }
      ],
      onChange: value => {
        console.log('selected:', value);
      }
    })
  ]
});
```

## Types

### `SelectorWidgetProps` {#selectorwidgetprops}

The `SelectorWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `options` (`SelectorWidgetOption[]`, required) {#options}

Selectable options displayed in the popover menu.

#### `initialValue` (any, optional) {#initialvalue}

* Default: value of the first option

Initial selected value. If it does not match any option, the first option is displayed.

#### `onChange` (function, optional) {#onchange}

```ts
(value: ValueT) => void
```

Callback invoked when a new option is selected.

### `SelectorWidgetOption` {#selectorwidgetoption}

#### `value` (any, required) {#value}

Value returned from `onChange` when this option is selected.

#### `icon` (string, required) {#optionicon}

Data URL used as the option icon mask.

#### `label` (string, optional) {#optionlabel}

Text shown in the menu and used as the button tooltip when selected.

## Styles

The `SelectorWidget` uses the shared button and menu theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/selector-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/selector-widget.tsx)
