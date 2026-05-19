# LabelWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

`LabelWidget` attaches to one deck.gl view and renders a small view-name badge plus a thin border around that view.

Use it for passive labels only. If a view already has a draggable header, use [`HeaderWidget`](./header-widget.md) instead so the view name is not duplicated.

```ts
import {_LabelWidget as LabelWidget} from '@deck.gl/widgets';

new LabelWidget({
  id: 'main-label',
  viewId: 'main',
  label: 'main',
  offset: [0, 0]
});
```

## Constructor

```ts
import {_LabelWidget as LabelWidget, type LabelWidgetProps} from '@deck.gl/widgets';
new LabelWidget({} satisfies LabelWidgetProps);
```

## Properties

Inherits the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

- `viewId` (`string`, required) - deck.gl view id to attach to.
- `label` (`string`, optional) - visible label. Defaults to `viewId`.
- `offset` (`[number, number]`, optional) - pixel offset for the visible label. Default `[0, 0]`.

## Source

[modules/widgets/src/view-layout/view-widgets.ts](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/view-layout/view-widgets.ts)
