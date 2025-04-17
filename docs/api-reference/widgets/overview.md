# @deck.gl/widgets

Widgets are UI components around the WebGL2/WebGPU canvas to offer controls and information for a better user experience.

This module contains the following widgets:

### Navigation Widgets
- [ZoomWidget](./zoom-widget.md)
- [ResetViewWidget](./reset-view-widget.md)

### Geospatial Widgets
- [CompassWidget](./compass-widget.md)
<!-- - [ScaleWidget](./scale-widget.md) -->
<!-- - [GeolocateWidget](./geolocate-widget.md) -->

### Utility Widgets
- [FullscreenWidget](./fullscreen-widget.md)
- [ScreenshotWidget](./screenshot-widget.md)
- [LoadingWidget](./loading-widget.md)
- [ThemeWidget](./theme-widget.md)
- [InfoWidget](./info-widget.md)

## Installation

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/widgets
```

```js
import {FullscreenWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new FullscreenWidget();
```

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/deck.gl@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
```

## Using Widgets

```ts
import {Deck} from '@deck.gl/core';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    ...
  ],
  widgets: [
    new ZoomWidget(),
    new CompassWidget(),
    new FullscreenWidget(),
    new ScreenshotWidget()
  ]
});
```

The built-in widgets support both dark and light color scheme changes and can be wired up to dynamically respond to color scheme changes like so:

```ts
import {Deck} from '@deck.gl/core';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
  DarkGlassTheme,
  LightGlassTheme
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

/* global window */
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const widgetTheme = prefersDarkScheme.matches ? DarkGlassTheme : LightGlassTheme;

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [ ... ],
  widgets: [
    new ZoomWidget({style: widgetTheme}),
    new CompassWidget({style: widgetTheme}),
    new FullscreenWidget({style: widgetTheme}),
    new ScreenshotWidget({style: widgetTheme})
  ]
});
```

## Themes and Styling

deck.gl widget appearance can be customized using [themes and CSS](./styling).
