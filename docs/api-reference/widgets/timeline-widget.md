# TimelineWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget provides a time slider with play/pause controls. Configure a time range, step interval, and play speed to animate data over time.

## Usage

import {TimelineWidgetDemo} from '@site/src/doc-demos/widgets';

<TimelineWidgetDemo />


```ts
import {Deck} from '@deck.gl/core';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';

new Deck({
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

#### `autoPlay` (boolean, optional)

* Default: `false`

Start playing automatically.

#### `loop` (boolean, optional)

* Default: `false`

Start playing from the beginning when time reaches the end.

#### `playInterval` (number, optional) {#playinterval}

* Default: `1000`

Interval in milliseconds between automatic time increments when playing.

#### `formatLabel` (function, optional)

```ts
(value: number) => string
```

Format time value for display.

#### `timeline` (Timeline, optional)

A [Timeline](https://luma.gl/docs/api-reference/engine/animation/timeline) instance that is manipulated by this widget.


## Methods

#### `play`

```ts
timelineWidget.play();
```

Start playback.

#### `pause`

```ts
timelineWidget.pause();
```

Stop playback.


## Styles

The TimelineWidget uses theme CSS variables for [RangeInput](./styling.md#range-input).

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name     | Type      | Default      |
| -------- | --------- | ------------ |
| `--icon-play` | [SVG Data Url][data_url] | [Material Symbol Play Arrow][icon_play_url]      |
| `--icon-pause`  | [SVG Data Url][data_url] | [Material Symbol Pause][icon_pause_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_play_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:play_arrow:FILL@1;wght@400;GRAD@0;opsz@24&icon.query=pause&icon.size=24&icon.style=Sharp
[icon_pause_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:pause:FILL@1;wght@400;GRAD@0;opsz@24&icon.query=pause&icon.size=24&icon.style=Sharp

## Source

[modules/widgets/src/timeline-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/timeline-widget.tsx)
