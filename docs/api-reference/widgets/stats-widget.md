import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';

# StatsWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

Displays performance and debugging statistics from deck.gl, luma.gl, or custom probe.gl stats objects in a collapsible widget.

## Usage

<WidgetPreview cls={StatsWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';

const deck = new Deck({
  widgets: [
    new StatsWidget({
      type: 'deck',
      framesPerUpdate: 5
    })
  ]
});
```

## Types

### `StatsWidgetProps` {#statswidgetprops}

The `StatsWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

- `id` (string, default: `'stats'`) - **Required.** Unique id for this widget
- `type` (string, default `'deck'`) - Type of stats to display: `'deck'`, `'luma'`, `'device'`, or `'custom'`
- `stats` (Stats, optional) - Custom stats object when using `type: 'custom'`
- `title` (string, default `'Stats'`) - Title shown in the widget header
- `framesPerUpdate` (number, default `1`) - Number of frames to wait between updates
- `formatters` (object, default `{}`) - Custom formatters for stat values
- `resetOnUpdate` (object, default `{}`) - Whether to reset particular stats after each update

### Built-in Formatters

- `'count'` - Display raw count value
- `'averageTime'` - Format as average time in ms/s
- `'totalTime'` - Format as total time in ms/s
- `'fps'` - Format as frames per second
- `'memory'` - Format as memory in MB

## Behavior

- Click the header to expand/collapse the stats display
- Stats are automatically updated based on `framesPerUpdate`
- Different stat types provide access to various performance metrics:
  - `'deck'`: deck.gl rendering statistics
  - `'luma'`: luma.gl WebGL statistics
  - `'device'`: GPU device statistics
  - `'custom'`: User-provided stats object

## Source

[modules/widgets/src/stats-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/stats-widget.tsx)