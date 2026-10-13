# @deck.gl/widgets

Widgets are UI components around the WebGL2/WebGPU canvas to offer controls and information for a better user experience.

This module contains the following widgets:

### Navigation Widgets[​](#navigation-widgets "Direct link to Navigation Widgets")

* [GimbalWidget](https://deck.gl/next/docs/api-reference/widgets/gimbal-widget.md)
* [ResetViewWidget](https://deck.gl/next/docs/api-reference/widgets/reset-view-widget.md)
* [ZoomWidget](https://deck.gl/next/docs/api-reference/widgets/zoom-widget.md)
* [ScrollbarWidget](https://deck.gl/next/docs/api-reference/widgets/scrollbar-widget.md)

### Geospatial Widgets[​](#geospatial-widgets "Direct link to Geospatial Widgets")

* [CompassWidget](https://deck.gl/next/docs/api-reference/widgets/compass-widget.md)
* [GeocoderWidget](https://deck.gl/next/docs/api-reference/widgets/geocoder-widget.md)
* [ScaleWidget](https://deck.gl/next/docs/api-reference/widgets/scale-widget.md)

### View Widgets[​](#view-widgets "Direct link to View Widgets")

* [FullscreenWidget](https://deck.gl/next/docs/api-reference/widgets/fullscreen-widget.md)
* [SplitterWidget](https://deck.gl/next/docs/api-reference/widgets/splitter-widget.md)
* [View Layout](https://deck.gl/next/docs/api-reference/widgets/view-layout.md)

### Information Widgets[​](#information-widgets "Direct link to Information Widgets")

* [ContextMenuWidget](https://deck.gl/next/docs/api-reference/widgets/context-menu-widget.md)
* [InfoWidget](https://deck.gl/next/docs/api-reference/widgets/info-widget.md)
* [PopupWidget](https://deck.gl/next/docs/api-reference/widgets/popup-widget.md)

### Control Widgets[​](#control-widgets "Direct link to Control Widgets")

* [IconWidget](https://deck.gl/next/docs/api-reference/widgets/icon-widget.md)
* [ToggleWidget](https://deck.gl/next/docs/api-reference/widgets/toggle-widget.md)
* [SelectorWidget](https://deck.gl/next/docs/api-reference/widgets/selector-widget.md)
* [TimelineWidget](https://deck.gl/next/docs/api-reference/widgets/timeline-widget.md)

### Utility Widgets[​](#utility-widgets "Direct link to Utility Widgets")

* [LoadingWidget](https://deck.gl/next/docs/api-reference/widgets/loading-widget.md)
* [ScreenshotWidget](https://deck.gl/next/docs/api-reference/widgets/screenshot-widget.md)
* [StatsWidget](https://deck.gl/next/docs/api-reference/widgets/stats-widget.md)
* [ThemeWidget](https://deck.gl/next/docs/api-reference/widgets/theme-widget.md)

## Installation[​](#installation "Direct link to Installation")

### Install from NPM[​](#install-from-npm "Direct link to Install from NPM")

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/widgets
```

```
import {FullscreenWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new FullscreenWidget();
```

### Include the Standalone Bundle[​](#include-the-standalone-bundle "Direct link to Include the Standalone Bundle")

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<link href="https://unpkg.com/deck.gl@^9.0.0/dist/stylesheet.css" rel='stylesheet' />

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist.min.js"></script>

<link href="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
```

## Using Widgets[​](#using-widgets "Direct link to Using Widgets")

```
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

```
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

### Using with Multiple Views[​](#using-with-multiple-views "Direct link to Using with Multiple Views")

Widgets with UI (e.g. a button or panel) can be positioned relative to the deck.gl view they are controlling, via the `viewId` and `placement` props. See [WidgetProps](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops).

The `viewId` selects a deck-managed view container under the shared widget root, and the `placement` prop positions the widget within that container:

```
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

```
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
* For more information about using multiple deck.gl views, see the [Using Multiple Views](https://deck.gl/next/docs/developer-guide/views.md#using-multiple-views) guide.

### Using with Multiple Canvases[​](#using-with-multiple-canvases "Direct link to Using with Multiple Canvases")

When [`Deck._canvases`](https://deck.gl/next/docs/api-reference/core/deck.md#_canvases) is supplied, deck.gl still mounts generated widget DOM under one shared `.deck-widget-container`. A widget's `viewId` selects the view used for positioning and event handling; that view's [`canvasId`](https://deck.gl/next/docs/api-reference/core/view.md#canvasid) determines which presentation-canvas bounds offset the view container. The widget is not reparented into the canvas element.

```
new Deck({

  parent: document.getElementById('deck-root'),

  _canvases: ['canvas-london', 'canvas-tokyo'],

  views: [

    new MapView({id: 'london', canvasId: 'canvas-london'}),

    new MapView({id: 'tokyo', canvasId: 'canvas-tokyo'})

  ],

  widgets: [

    new ZoomWidget({viewId: 'london'}),

    new ZoomWidget({id: 'tokyo-zoom', viewId: 'tokyo'})

  ]

});
```

Widgets without a `viewId` stay in the root widget container and are positioned relative to the shared parent, not a specific presentation canvas. Use a common `parent` that covers the presentation canvases when deck-managed widgets need to span them. To opt out of deck-managed positioning, supply an HTMLElement through [`_container`](https://deck.gl/next/docs/api-reference/core/widget.md#_container).

## Controlled vs Uncontrolled Mode[​](#controlled-vs-uncontrolled-mode "Direct link to Controlled vs Uncontrolled Mode")

Many deck.gl widgets support both controlled and uncontrolled modes, similar to React form components.

### Uncontrolled Mode (Default)[​](#uncontrolled-mode-default "Direct link to Uncontrolled Mode (Default)")

By default, widgets manage their own internal state. You can optionally provide an initial value and receive callbacks when the state changes:

```
new ThemeWidget({

  initialThemeMode: 'light',

  onThemeModeChange: (mode) => console.log('Theme changed:', mode)

})
```

### Controlled Mode[​](#controlled-mode "Direct link to Controlled Mode")

When you provide a state prop (e.g., `themeMode`, `fullscreen`, `time`), the widget enters controlled mode. In this mode, the widget's state is driven entirely by the prop value, and you must update it via callbacks:

```
let themeMode = 'light';



new ThemeWidget({

  themeMode,

  onThemeModeChange: (mode) => {

    themeMode = mode;

    deck.setProps({widgets: [new ThemeWidget({themeMode, onThemeModeChange: ...})]});

  }

})
```

### Reading Widget State[​](#reading-widget-state "Direct link to Reading Widget State")

Widgets with internal state expose getter methods (e.g., `getThemeMode()`, `getFullscreen()`) that return the current state regardless of whether the widget is controlled or uncontrolled.

## Writing new Widgets[​](#writing-new-widgets "Direct link to Writing new Widgets")

A widget should extend the [`Widget`](https://deck.gl/next/docs/api-reference/core/widget.md) class. Here is a custom widget that shows a spinner while layers are loading:

```
import {Deck, Widget} from '@deck.gl/core';

import type {Layer, WidgetProps, WidgetPlacement} from '@deck.gl/core';



type LoadingIndicatorProps = WidgetProps & {

  placement?: WidgetPlacement;

  size?: number;

};



class LoadingIndicator extends Widget<LoadingIndicatorProps> {

  static defaultProps: Required<LoadingIndicatorProps> = {

    ...Widget.defaultProps,

    id: 'loading-indicator',

    placement: 'top-left',

    size: 32

  };



  className = 'spinner';

  placement: WidgetPlacement = 'top-left';

  loading = false;



  constructor(props: LoadingIndicatorProps = {}) {

    super(props);

    this.placement = this.props.placement;

  }



  onRenderHTML(el: HTMLElement) {

    el.style.width = `${this.props.size}px`;

    el.style.display = this.loading ? 'block' : 'none';

    // TODO - create animation for .spinner in the CSS stylesheet

  }



  onRedraw({layers}: {layers: Layer[]}) {

    const loading = layers.some(layer => !layer.isLoaded);

    if (loading !== this.loading) {

      this.loading = loading;

      this.updateHTML();

    }

  }

}



new Deck({

  widgets: [new LoadingIndicator({size: 48})]

});
```

For a full walk-through of the widget lifecycle, styling, and using Preact or React to render widget UI, see the [Writing Custom Widgets](https://deck.gl/next/docs/developer-guide/custom-widgets.md) developer guide.

## Tooltips[​](#tooltips "Direct link to Tooltips")

Built-in button widgets show styled tooltips on hover. See [Widget Tooltips](https://deck.gl/next/docs/api-reference/widgets/tooltips.md) for customization and usage in custom widgets.

## Themes and Styling[​](#themes-and-styling "Direct link to Themes and Styling")

deck.gl widget appearance can be customized using [themes and CSS](https://deck.gl/next/docs/api-reference/widgets/styling.md).
