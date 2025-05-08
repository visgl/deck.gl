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

## Types

### `FpsWidgetProps`

The `FpsWidget` accepts the generic [`WidgetProps`](../core/widget.md#props):

- `id` (default `'fps'`) -  Unique id for this widget
- `placement` (default `'top-left'`) - Widget position within the view relative to the map container
- `viewId` (default `null`) - The `viewId` prop controls how a widget interacts with views. 
- `style` (default `{}`) - Additional inline styles on the top HTML element.
- `className` (default `''`) - Additional classnames on the top HTML element.
