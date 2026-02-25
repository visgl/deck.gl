import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ContextMenuWidget as ContextMenuWidget} from '@deck.gl/widgets';

# ContextMenuWidget (Experimental)

Displays a context menu on right-click events with customizable menu items based on picked objects.

<WidgetPreview cls={ContextMenuWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_ContextMenuWidget as ContextMenuWidget} from '@deck.gl/widgets';

const deck = new Deck({
  widgets: [
    new ContextMenuWidget({
      getMenuItems: (info, widget) => {
        if (info.object) {
          return [
            {value: 'delete', label: 'Delete pin'}
          ];
        }
        return [
          {value: 'add', label: 'Add pin'}
        ];
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

#### getMenuItems (Function)

Function that returns menu items based on the picked object. Receives the following parameters:
- `pickInfo` ([PickingInfo](../../developer-guide/interactivity.md#picking)) - descriptor of what's under the pointer

Expected to return an array of [ContextWidgetMenuItem](#contextwidgetmenuitem) objects, or `null` if no menu should be displayed.

#### onMenuItemSelected (Function, optional)

Callback invoked when a menu item is selected. Receives the following parameters:

- `value` (string) - the value of the selected menu item
- `pickInfo` ([PickingInfo](../../developer-guide/interactivity.md#picking)) - descriptor of what's under the pointer


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


### `ContextWidgetMenuItem` {#contextwidgetmenuitem}

Menu item definition:

- `label` (string) - Display text for the menu item
- `value` (string, optional) - Unique identifier for the menu item. If not supplied, then the item is not interactive.
- `icon` (string, optional) - Data url of an icon that should be displayed with the menu item

## Source

[modules/widgets/src/context-menu-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/context-menu-widget.tsx)