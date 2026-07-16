# TimelineWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {TimelineWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<TimelineWidgetDemo />

This widget provides a time slider with play/pause controls. Configure a time range, step interval, and play speed to animate data over time.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

let time = 0;

const renderLayer = currentTime =>
  new ScatterplotLayer({
    id: 'point',
    data: [{position: [0, 0]}],
    getPosition: d => d.position,
    getRadius: 1000 + currentTime * 200,
    getFillColor: [200, 0, 80]
  });

const deck = new Deck({
  layers: [renderLayer(time)],
  widgets: [
    new TimelineWidget({
      timeRange: [0, 10],
      step: 1,
      playInterval: 250,
      autoPlay: true,
      onTimeChange: value => {
        time = value;
        deck.setProps({layers: [renderLayer(time)]});
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {_TimelineWidget as TimelineWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

type Point = {position: [number, number]};

let time = 0;

const renderLayer = (currentTime: number) =>
  new ScatterplotLayer<Point>({
    id: 'point',
    data: [{position: [0, 0]}],
    getPosition: d => d.position,
    getRadius: 1000 + currentTime * 200,
    getFillColor: [200, 0, 80]
  });

const deck = new Deck({
  layers: [renderLayer(time)],
  widgets: [
    new TimelineWidget({
      timeRange: [0, 10],
      step: 1,
      playInterval: 250,
      autoPlay: true,
      onTimeChange: (value: number) => {
        time = value;
        deck.setProps({layers: [renderLayer(time)]});
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState} from 'react';
import DeckGL, {_TimelineWidget as TimelineWidget} from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [time, setTime] = useState(0);

  return (
    <DeckGL
      layers={[
        new ScatterplotLayer({
          id: 'point',
          data: [{position: [0, 0]}],
          getPosition: d => d.position,
          getRadius: 1000 + time * 200,
          getFillColor: [200, 0, 80]
        })
      ]}
    >
      <TimelineWidget
        timeRange={[0, 10]}
        step={1}
        playInterval={250}
        autoPlay
        onTimeChange={setTime}
      />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState} from 'react';
import DeckGL, {_TimelineWidget as TimelineWidget} from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import '@deck.gl/widgets/stylesheet.css';

const TIME_RANGE: [number, number] = [0, 10];

function App() {
  const [time, setTime] = useState(TIME_RANGE[0]);
  const [playing, setPlaying] = useState(false);

  return (
    <DeckGL
      layers={[
        new ScatterplotLayer({
          id: 'point',
          data: [{position: [0, 0]}],
          getPosition: d => d.position,
          getRadius: 1000 + time * 200,
          getFillColor: [200, 0, 80]
        })
      ]}
    >
      <TimelineWidget
        timeRange={TIME_RANGE}
        step={1}
        playInterval={250}
        time={time}
        onTimeChange={setTime}
        playing={playing}
        onPlayingChange={(next) => {
          // In controlled mode, the app handles restart-from-beginning
          if (next && time >= TIME_RANGE[1]) {
            setTime(TIME_RANGE[0]);
          }
          setPlaying(next);
        }}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {_TimelineWidget as TimelineWidget, type TimelineWidgetProps} from '@deck.gl/widgets';
new TimelineWidget({} satisfies TimelineWidgetProps);
```

## Types

### `TimelineWidgetProps` {#timelinewidgetprops}

The `TimelineWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `timeRange` ([number, number], optional) {#timerange}

* Default: `[0, 100]`

Minimum and maximum values for the time slider.

#### `step` (number, optional) {#step}

* Default: `1`

Increment step for the slider and play animation.

#### `initialTime` (number, optional) {#initialtime}

* Default: `timeRange[0]`

Starting value of the slider for uncontrolled usage.

#### `time` (number, optional) {#time}

Controlled time value. When provided, the widget is in controlled mode for the time slider and will not update its internal time — the app is the sole source of truth. Use with `onTimeChange` to handle updates.

#### `onTimeChange` (Function, optional) {#ontimechange}

```ts
(value: number) => void
```

* Default: `() => {}`

Callback invoked when the time value changes (drag or play).

#### `autoPlay` (boolean, optional) {#autoplay}

* Default: `false`

Start playing automatically when the widget is added. In controlled mode, this calls `onPlayingChange(true)` instead of starting playback directly, allowing the app to decide how to respond.

#### `loop` (boolean, optional) {#loop}

* Default: `false`

Start playing from the beginning when time reaches the end.

#### `playInterval` (number, optional) {#playinterval}

* Default: `1000`

Interval in milliseconds between automatic time increments when playing.

#### `playing` (boolean, optional) {#playing}

Controlled playing state. When provided, the widget is in controlled mode for play/pause and will not start or stop playback on its own — the app is the sole source of truth. Use with `onPlayingChange` to handle updates.

In controlled mode, the widget does not automatically reset time to the beginning when playback starts at the end of the range. The app is responsible for handling this in its `onPlayingChange` callback (see the React Controlled example above).

#### `onPlayingChange` (Function, optional) {#onplayingchange}

```ts
(playing: boolean) => void
```

* Default: `() => {}`

Callback when play/pause button is clicked.

#### `formatLabel` (function, optional) {#formatlabel}

```ts
(value: number) => string
```

Format time value for display.

#### `timeline` (Timeline, optional) {#timeline}

A [Timeline](https://luma.gl/docs/api-reference/engine/animation/timeline) instance that is manipulated by this widget.


## Methods

#### `play` {#play}

```ts
timelineWidget.play();
```

Start playback.

#### `stop` {#stop}

```ts
timelineWidget.stop();
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
