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

## Props

#### `id` (string, optional) {#id}

Default: `'timeline'`

Unique identifier for the widget.

#### `placement` (string, optional) {#placement}

Default: `'bottom-left'`

Widget position within the view. Valid options: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `fill`.

#### `timeRange` ([number, number], optional) {#timerange}

Default: `[0, 100]`

Minimum and maximum values for the time slider.

#### `step` (number, optional) {#step}

Default: `1`

Increment step for the slider and play animation.

#### `initialTime` (number, optional) {#initialtime}

Default: `timeRange[0]`

Starting value of the slider.

#### `onTimeChange` (Function, optional) {#ontimechange}

`(value: number) => void`

Callback invoked when the time value changes (drag or play).

#### `playInterval` (number, optional) {#playinterval}

Default: `1000`

Interval in milliseconds between automatic time increments when playing.

#### `style` (object, optional) {#style}

Default: `{}`

Inline CSS styles for the widget container.

#### `className` (string, optional) {#classname}

Default: None

Custom class name for the widget element.

## Source

[modules/widgets/src/timeline-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/timeline-widget.tsx)