import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ContextMenuWidget as ContextMenuWidget} from '@deck.gl/widgets';

# ContextMenuWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

Displays a context menu on right-click events with customizable menu items based on picked objects.

## Usage

<WidgetPreview cls={GeocoderWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_ContextMenuWidget as ContextMenuWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [
    new ContextMenuWidget({
      getMenuItems: (info, widget) => {
        if (info.object) {
        const name = info.object.properties.name;
          return [
            {key: 'name', label: name},
            {key: 'delete', label: 'Delete'}
          ];
        }
        return [{label: 'Add Point', key: 'add'}];
      },
      onMenuItemSelected: (key, pickInfo) => {
        if (key === 'add') addPoint(pickInfo);  
        if (key === 'delete') deletePoint(pickInfo);  
      }
    })
  ]
});
```

## Types

### `ContextMenuWidgetProps` {#contextmenuwidgetprops}

The `ContextMenuWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

- `getMenuItems` (function) - **Required.** Function that returns menu items based on the picked object. Receives `PickingInfo` and returns an array of `ContextWidgetMenuItem` objects or `null`.
- `onMenuItemSelected` (function, optional) - Callback invoked when a menu item is selected. Receives the selected item key and `PickingInfo`.
- `visible` (boolean, default `false`) - Controls visibility of the context menu.
- `position` (object, default `{x: 0, y: 0}`) - Screen position where the menu appears.
- `menuItems` (array, default `[]`) - Current menu items to display.

### `ContextWidgetMenuItem` {#contextwidgetmenuitem}

Menu item definition:

- `label` (string) - Display text for the menu item
- `key` (string) - Unique identifier for the menu item

## Behavior

- Right-click events trigger the context menu
- Menu items are dynamically generated based on what was clicked
- Click elsewhere to hide the menu
- Menu automatically positions itself at the cursor location

## Source

[modules/widgets/src/context-menu-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/context-menu-widget.tsx)