# Widget

A widget is a UI component that can interact with deck.gl's cameras and layers. Some examples are:

- A tooltip that follows the pointer and provide information for the hovered object
- A marker pinned to a geo-location containing HTML content
- Buttons to manipulate the camera, such as +/- zoom buttons, a compass rose for the MapView, a gimble widget for the OrbitView, etc.
- A legend that offers visual comparison of sizes, colors etc. corresponding to the rendered layers and viewport. For example a distance ruler, a color scale for the HeatmapLayer, etc.

You may find many ready-to-use widgets in the `@deck.gl/widgets` module.

The `Widget` class is not used directly by an app. It is a base class used to define new widgets.


A widget should inherit the `Widget` class. Here is a custom widget that shows a spinner while layers are loading:

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

## Widget Interface

When a widget instance is added to Deck, the user can optionally specify a `viewId` that it is attached to (default `null`). If assigned, this widget will only respond to events occurred inside the specific view that matches this id.

### Members

A `Widget` implements the following members.

#### `id` {#id}

Unique identifier of the widget.

#### `props` (object) {#props}

Any options for the widget, as passed into the constructor and can be updated with `setProps`.

#### `viewId` (string | null) {#viewid}

* Default: `null`

The id of the view that the widget is attached to. If `null`, the widget receives events from all views. Otherwise, it only receives events from the view that matches this id.

#### `placement` (string, optional) {#placement}

* Default: `'top-left'`

Widget positioning within the view. One of:

- `'top-left'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-right'`
- `'fill'`

### Methods

#### `setProps` {#setprops}

Optional. Called to update widget options.

#### `updateHTML` {#updatehtml}

Updates the widget. Normally called automatically.


### Lifecycle Methods

The following methods are available when implementing a new widget.

#### `constructor`

Supply the props and default props to the base class.

#### `onRenderHTML`

#### `onAdd` {#onadd}

Required. Called when the widget is added to a Deck instance.

Receives the following arguments:

- `context` (object)
  + `deck` (Deck) - the Deck instance that this widget is being attached to.
  + `viewId` (string | null) - the view id that this widget is being attached to.

Returns an optional UI element that should be appended to the Deck container.

#### `onRemove` {#onremove}

Optional. Called when the widget is removed.

#### `onViewportChange` {#onviewportchange}

Op†ional. Called when the containing view is changed. If `viewId: null`, will be called if any viewport changes.

Receives the following arguments:
- `viewport` (Viewport) - the viewport that has changed

#### `onRedraw` {#onredraw}

Optional. Called when the containing view is redrawn. If `viewId: null`, will be called if anything redraws.

Receives the following arguments:
- `params`
  + `viewports` (Viewport[]) - the viewports that are being redrawn
  + `layers` (Layer[]) - the layers that are being redrawn

#### `onHover` {#onhover}

Optional. Called when a hover event occurs in the containing view. If `viewId: null`, will be called if hover occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-pickinginfo-object) describing the object being hovered.
* `event` - the original gesture event


#### `onClick` {#onclick}

Optional. Called when a click event occurs in the containing view. If `viewId: null`, will be called if click occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-pickinginfo-object) describing the object being clicked.
* `event` - the original gesture event


#### `onDragStart` {#ondragstart}

Optional. Called when a dragstart event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event

#### `onDrag` {#ondrag}

Optional. Called when a drag event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event

#### `onDragEnd` {#ondragend}

Optional. Called when a dragend event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event
