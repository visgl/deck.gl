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

### `FpsWidgetProps` {#fpswidgetprops}

The `FpsWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops).

