# @deck.gl/widgets

Widgets are UI components around the WebGL2/WebGPU canvas to offer controls and information for a better user experience.

This module contains the following widgets:

### Navigation Widgets

- [GimbalWidget](./gimbal-widget.md)
- [ResetViewWidget](./reset-view-widget.md)
- [ZoomWidget](./zoom-widget.md)

### Geospatial Widgets

- [CompassWidget](./compass-widget.md)
- [GeocoderWidget](./geocoder-widget.md)
- [ScaleWidget](./scale-widget.md)

### View Widgets

- [FullscreenWidget](./fullscreen-widget.md)
- [SplitterWidget](./splitter-widget.md)
- [ViewSelectorWidget](./view-selector-widget.md)

### Information Widgets

- [ContextMenuWidget](./context-menu-widget.md)
- [InfoWidget](./info-widget.md)

### Control Widgets

- [TimelineWidget](./timeline-widget.md)

### Utility Widgets

- [FpsWidget](./fps-widget.md)
- [LoadingWidget](./loading-widget.md)
- [ScreenshotWidget](./screenshot-widget.md)
- [StatsWidget](./stats-widget.md)
- [ThemeWidget](./theme-widget.md)

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

### Using with Multiple Views

Widgets with UI (e.g. a button or panel) can be positioned relative to the deck.gl view they are controlling, via the `viewId` and `placement` props. See [WidgetProps](../core/widget.md#widgetprops).

The `viewId` controls which HTML container will mount to, and the `placement` prop will position it relative to the container it is in, like so:

```ts
new Deck({
  views:[
    new MapView({id: 'left-map'}),
    new MapView({id: 'right-map'})
  ],
  widgets: [
    new FullscreenWidget({placement: 'top-right'}),
    new ZoomWidget({viewId: 'left-map'}),
    new GimbalWidget({viewId: 'right-map'}),
  ]
})
```

This configuration will result in the following HTML structure:

```html
<!-- map container -->
<div class="deck-widget-container">
  <canvas id="deckgl-overlay">
  <!-- size of full map container -->
  <div>
    <div class="top-right">
      </FullscreenWidget>
    </div>
  </div>
  <!-- size and position of the "left-map" view -->
  <div>
    <div class="top-left">
      </ZoomWidget>
    </div>
  </div>
  <!-- size and position of the "right-map" view -->
  <div>
    <div class="top-left">
      </GimbalWidget>
    </div>
  </div>
</div>
```

Remarks:

* Widgets in the default container will be overlapped by view-specific widgets.
* Widget UI with dynamic positioning, such as an `InfoWidget`, may not expose the `placement` prop as they control positioning internally.
* For more information about using multiple deck.gl views, see the [Using Multiple Views](../../developer-guide/views.md#using-multiple-views) guide.

## Writing new Widgets

A widget should inherit the `Widget` class. 
Here is a custom widget that shows a spinner while layers are loading:

```ts
import {Deck, Widget} from '@deck.gl/core';

class LoadingIndicator extends Widget {
  element?: HTMLDivElement;
  size: number;

  constructor(options: {
    size: number;
  }) {
    this.size = options.size;
  }

  onRenderHTML(el: HTMLElement) {
    el.className = 'spinner';
    el.style.width = `${this.size}px`;
    // TODO - create animation for .spinner in the CSS stylesheet
  }

  onRedraw({layers}) {
    const isVisible = layers.some(layer => !layer.isLoaded);
    this.rootElement.style.display = isVisible ? 'block' : 'none';
  }
}

new Deck({
  widgets: [new LoadingIndicator({size: 48})]
});
```

## Themes and Styling

deck.gl widget appearance can be customized using [themes and CSS](./styling).
