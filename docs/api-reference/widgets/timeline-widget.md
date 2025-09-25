import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_TimelineWidget} from '@deck.gl/widgets';

# TimelineWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget provides a time slider with play/pause controls. Configure a time range, step interval, and play speed to animate data over time.

<WidgetPreview cls={_TimelineWidget}/>

```ts
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [
    new TimelineWidget({
      timeRange: [0, 24],
      step: 1,
      playInterval: 500
    })
  ]
});
```

### `TimelineProps` {#timelineprops}

The `TimelineWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `timeRange` ([number, number], optional) {#timerange}

* Default: `[0, 100]`

Minimum and maximum values for the time slider.

#### `step` (number, optional) {#step}

* Default: `1`

Increment step for the slider and play animation.

#### `initialTime` (number, optional) {#initialtime}

* Default: `timeRange[0]`

Starting value of the slider.

#### `onTimeChange` (Function, optional) {#ontimechange}

```ts
(value: number) => void
```

* Default: `() => {}`

Callback invoked when the time value changes (drag or play).

#### `playInterval` (number, optional) {#playinterval}

* Default: `1000`

Interval in milliseconds between automatic time increments when playing.

## Source

[modules/widgets/src/timeline-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/timeline-widget.tsx)