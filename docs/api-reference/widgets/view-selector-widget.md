# ViewSelectorWidget (Experimental)

Provides a dropdown menu for selecting different view modes including single view and split view configurations.

```ts
import {ViewSelectorWidget} from '@deck.gl/widgets';
```

## Usage

```ts
import {Deck} from '@deck.gl/core';
import {ViewSelectorWidget} from '@deck.gl/widgets';

const deck = new Deck({
  widgets: [
    new ViewSelectorWidget({
      initialViewMode: 'single',
      onViewModeChange: (mode) => {
        console.log('View mode changed to:', mode);
        // Handle view configuration changes
      }
    })
  ]
});
```

## Types

### `ViewSelectorWidgetProps` {#viewselectorwidgetprops}

The `ViewSelectorWidget` accepts the generic [`WidgetProps`](../core/widget.md#props) and:

- `initialViewMode` (ViewMode, default `'single'`) - Initial view mode selection
- `onViewModeChange` (function, optional) - Callback invoked when view mode changes. Receives the new `ViewMode`.
- `label` (string, default `'Split View'`) - Tooltip label for the widget

### `ViewMode` {#viewmode}

Available view modes:

- `'single'` - Single view display
- `'split-horizontal'` - Two views split horizontally (top/bottom)
- `'split-vertical'` - Two views split vertically (left/right)

## Behavior

- Click the button to open a dropdown menu with view mode options
- Each option shows an icon representing the layout
- Selection updates the current view mode and triggers the callback
- The widget button displays an icon matching the currently selected mode

## Integration

This widget provides the UI for view mode selection but does not directly modify the deck.gl view configuration. Applications should implement the view switching logic in the `onViewModeChange` callback to create and configure multiple views as needed.