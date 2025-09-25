import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_FpsWidget as FpsWidget} from '@deck.gl/widgets';

# FpsWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

Displays the measured frames per second (FPS) as reported by the attached `Deck` instance.

## Usage

<WidgetPreview cls={FpsWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_FpsWidget as FpsWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new FpsWidget({placement: 'top-right'})]
});
```

## Types

### `FpsWidgetProps` {#fpswidgetprops}

The `FpsWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops).

## Source

[modules/widgets/src/fps-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/fps-widget.tsx)