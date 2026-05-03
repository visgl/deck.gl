# LabelWidget

`LabelWidget` is exported from `@deck.gl/widgets` as `_LabelWidget`. It attaches to a deck.gl view and renders the small view-name badge plus a thin border around that view.

Use it for passive labels only. If a view already has a draggable header, use [`HeaderWidget`](./header-widget.md) instead so the view name is not duplicated.

See the full API documentation in [`docs/api-reference/widgets/label-widget.md`](../../../docs/api-reference/widgets/label-widget.md).

```ts
import {_LabelWidget as LabelWidget} from '@deck.gl/widgets';

new LabelWidget({
  id: 'main-label',
  viewId: 'main',
  label: 'main',
  offset: [0, 0]
});
```

## Props

- `id`: stable widget id.
- `viewId`: deck.gl view id to attach to.
- `label`: optional visible label; defaults to `viewId`.
- `offset`: optional `[x, y]` pixel offset for the visible label.
