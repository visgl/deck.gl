# FpsWidget

Displays the measured frames per second (FPS) as reported by the attached
`Deck` instance.

```ts
import {FpsWidget} from '@deck.gl/widgets';
```

## Usage

```ts
new Deck({
  widgets: [new FpsWidget({placement: 'top-right'})]
});
```

## Properties

The `FpsWidget` accepts the generic [`WidgetProps`](./overview.md#widgetprops) and
supports one additional option:

### `placement` (String)

- Default: `'top-left'`
- Position of the widget within the view. One of `top-left`, `top-right`, `bottom-left`,
  `bottom-right`.

