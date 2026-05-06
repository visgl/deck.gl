# HeaderWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

`HeaderWidget` attaches to one deck.gl view and renders a title bar inside that view. It can also make the title bar draggable and add a resize handle in one corner.

The widget reports parent-relative bounds that can be passed back to [`buildViewsFromViewLayout`](./view-layout.md) through `viewPropsById`.

```ts
import {_HeaderWidget as HeaderWidget} from '@deck.gl/widgets';

new HeaderWidget({
  id: 'minimap-header',
  viewId: 'minimap',
  label: 'minimap',
  draggable: true,
  resizable: true,
  resizeHandlePosition: 'top-left',
  containerRect: compiled.rectsById.main,
  viewRect: compiled.rectsById.minimap,
  onBoundsChange: bounds => setMinimapBounds(bounds)
});
```

## Constructor

```ts
import {_HeaderWidget as HeaderWidget, type HeaderWidgetProps} from '@deck.gl/widgets';
new HeaderWidget({} satisfies HeaderWidgetProps);
```

## Properties

Inherits the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

- `viewId` (`string`, required) - deck.gl view id to attach to.
- `label` (`string`, optional) - visible header label. Defaults to `viewId`.
- `draggable` (`boolean`, optional) - whether the header bar moves the view. Default `false`.
- `resizable` (`boolean`, optional) - whether to render a resize handle. Default `false`.
- `resizeHandlePosition` (`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`, optional) - resize handle corner. Default `'bottom-right'`.
- `containerRect` (`{x, y, width, height}`, required) - parent rectangle used to constrain drag and resize.
- `viewRect` (`{x, y, width, height}`, required) - current resolved rectangle for the attached view.
- `margin` (`number`, optional) - minimum margin inside `containerRect`. Default `16`.
- `minWidth`, `minHeight`, `maxWidth`, `maxHeight` (`number`, optional) - resize limits in pixels.
- `onBoundsChange` (`Function`, required) - callback receiving updated `{x, y, width, height}` bounds.

## Source

[modules/widgets/src/view-layout/view-widgets.ts](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/view-layout/view-widgets.ts)
