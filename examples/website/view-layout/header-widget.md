# HeaderWidget

`HeaderWidget` is exported from `@deck.gl/widgets` as `_HeaderWidget`. It attaches to a deck.gl view and renders a title bar. It can also make the title bar draggable and add a corner resize handle.

The widget reports parent-relative bounds that can be passed back to `buildViewsFromViewLayout` through `viewPropsById`.

See the full API documentation in [`docs/api-reference/widgets/header-widget.md`](../../../docs/api-reference/widgets/header-widget.md).

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

## Props

- `id`: stable widget id.
- `viewId`: deck.gl view id to attach to.
- `label`: optional visible header label; defaults to `viewId`.
- `draggable`: whether the header bar moves the view.
- `resizable`: whether to render a resize handle.
- `resizeHandlePosition`: one of `top-left`, `top-right`, `bottom-left`, or `bottom-right`.
- `containerRect`: parent rectangle used to constrain drag and resize.
- `viewRect`: current resolved rectangle for the attached view.
- `margin`: optional minimum margin inside `containerRect`.
- `minWidth`, `minHeight`, `maxWidth`, `maxHeight`: optional resize limits in pixels.
- `onBoundsChange`: callback receiving updated `{x, y, width, height}` bounds.
