# UI Module RFC

* **Author**: Xiaoji Chen
* **Date**: December 2022
* **Status**: **Approved**

## Overview

Visualization applications often require some chrome around the WebGL canvas to offer better user experience. While it is possible for every app to implement their own UI components that interact with deck.gl, it is no trivial effort to implement them well. 

This RFC proposes to add a new module that packages common UI components that seamlessly integrate with deck.gl. The following components have been suggested during the RFC process:

- Marker: HTML element pinned to a location in the world space
- Navigation: buttons to manipulate the camera, such as +/- zoom buttons, a compass rose for the MapView, a gimble widget for the OrbitView, etc.
- Fullscreen: button to enter / exit fullscreen mode
- Geolocate: button to track the user's location using the browser's Geolocation API
- Legend: visual comparison of sizes, colors etc. corresponding to the rendered layers and viewport. For example a distance ruler, a color scale for the HeatmapLayer, etc.
- Timeline: a temporal slider to control that can also be continuously animated. E.g. playback in the TripsLayer. Possible integration with [TheatreJS](https://www.theatrejs.com/) or [motion dev tools](https://motion.dev/tools).
- Layer designer panels to speed up visual iteration using libraries, such as dat.gui or [Leva](https://github.com/pmndrs/leva). 
- In-world control widgets for positioning views, lighting, and other effects. Similar to [transform controls](https://threejs.org/examples/?q=controls#misc_controls_transform) and [arc balls](https://threejs.org/examples/?q=controls#misc_controls_arcball) in three.js


## Background

Deck.gl does not currently export any DOM-based UI components. The documentation recommends react-map-gl as a companion library in the following pattern:

```jsx
import {StaticMap, MapContext, NavigationControl, FullscreenControl} from 'react-map-gl'

<DeckGL
  ContextProvider={MapContext.Provider}
>
  <StaticMap />
  <NavigationControl />
  <FullscreenControl />
</DeckGL>
```

There are major limitations with this approach:

- It is only supported by react-map-gl v5 and v6, versions no longer actively maintained. v7 dropped deck.gl support to prioritize standalone performance, see https://github.com/visgl/react-map-gl/issues/1646.
- It pulls in an entire base map library even if the application does not need Mapbox.
- It is React only, cannot be used in vanilla JS.
- It is geospatial only, does not work with non-geospatial views.
- It cannot be used via the declarative interface e.g. with pydeck.


## Proposal

1. Export a new interface `Widget` from `@deck.gl/core`. It will define certain hook methods that a UI component can implement, along the lines of:

```js
interface Widget<PropsT> {
  /// Populated by core when mounted
  deck?: Deck;
  container?: HTMLDivElement;

  constructor(props: PropsT);

  /// Lifecycle hooks
  onAdd: () => void;
  onRemove: () => void;
  setProps: (props: PropsT) => void;

  /// Event hooks
  onViewStateChange?: () => void;
  onRedraw?: () => void;
  onHover?: (info) => void;
  onClick?: (info) => void;
}
```

2. Add a new module `@deck.gl/widgets` which exports common UI components that implement the `Widget` interface.

3. Add the following APIs to the `Deck` class:

```js
/// Prop type for React / declarative usage
new Deck({
  widgets: Widget[]
})

/// Imperative methods for vanilla JS usage
addUIControl(widget: Widget, opts?: {
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  viewId?: string;
}): void
removeUIControl(widget: Widget): void
```

Users will use this new module like the following:

```js
import {NavigationWidget, FullscreenWidget} from '@deck.gl/widgets'

new Deck({
  ...
  uiControls: [
    new NavigationWidget(),
    new FullscreenWidget()
  ]
})
```

## Implementation details and concerns

### Terminology

React and Mapbox users use "controls" to refer to UI components. However, we already call an input handler "controller" in the deck.gl context. I have seen users not differentiating the two in issues and discussions. I am concerned that introducing another concept called "control" is going to add to the confusion.

Edit: per feedback I'm tentatively naming these "widgets"

### React

All components in `@deck.gl/widgets` should work without React. `@deck.gl/react` can offer thin wrappers that work with the `DeckGL` component:

```jsx
import {NavigationWidget, FullscreenWidget} from '@deck.gl/react'

<DeckGL>
  <MapView>
    <NavigationControl />
    <FullscreenControl />
  </MapView>
</DeckGL>
```

### Performance impact

A new `WidgetManager` will be added to `Deck` alongside `ViewManager` `EffectManager` etc. It will handle calling the lifecycle and event hooks of registered controls. For existing apps, where no UI controls are used, the performance impact is projected to be neglegible.

I would like to call out the expected behavior when the `widgets` prop shallowly changes. Following existing behavior pattern of `layers`, `views` and `effects`, upon `setProps`:

- `WidgetManager` deeply compares the elements of `widgets`' old and new values. Two controls are be the "same" if they share the same constructor and the same id.
- If a widget only exists in the new array, call `onAdd`
- If a widget only exists in the old array, call `onRemove`
- If a widget exists in both old and new arrays, transfer the new props to the old instance, instead of adopting the new instance

This would avoid the performance hit by constantly adding/removing controls when using React.

### CSS packaging

react-map-gl (inherited from mapbox-gl) requires a separate CSS stylesheet be included in the page's head. deck.gl traditionally uses CSS-in-JS (see [getTooltip](/docs/api-reference/core/deck.md)). While I like the convenience of everything-in-one-bundle approach, the new UI module will have much more complex DOM structures, and it will be harder to design an API that allows users to customize the look and feel of their UI.

Ideas:
- Use CSS-in-JS
- Add classes to each DOM element to allow for customization
- Utilize CSS [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) for theming

### Accessibility

While it does not block initial release, the UI components should strive for accessibility compliance. That includes good out-of-the-box support for keyboard navigation, screen reader, and localization.

### Nebula.gl compatibility

Nebula.gl currently implements a HTMLOverlay for its UI. The library has extensive integration with deck.gl throughout the render / event cycle and is a good test for the flexibility of the Widget interface. We should inspect the code base to make sure that the Widget interface will be sufficient for its use case.
