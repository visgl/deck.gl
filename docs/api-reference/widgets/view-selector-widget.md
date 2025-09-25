import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ViewSelectorWidget as ViewSelectorWidget} from '@deck.gl/widgets';

# ViewSelectorWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

Provides a dropdown menu for selecting different view modes including single view and split view configurations.

## Usage

<WidgetPreview cls={ViewSelectorWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_ViewSelectorWidget as ViewSelectorWidget} from '@deck.gl/widgets';

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

The `ViewSelectorWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

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
- Selection updates the current view mode internally
- The widget button displays an icon matching the currently selected mode

**Note:** The `onViewModeChange` callback is currently not invoked in the implementation, so this widget primarily serves as a visual selector without automatic view switching functionality.

## Integration

This widget provides the UI for view mode selection but does not currently trigger callbacks or modify deck.gl view configuration automatically. Applications need to implement custom logic to detect view mode changes and update view configurations accordingly.
## Source

[modules/widgets/src/view-selector-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/view-selector-widget.tsx)