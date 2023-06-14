# Widget Class

A widget is a UI component that can interact with deck.gl's cameras and layers. Some examples are:

- A tooltip that follows the pointer and provide information for the hovered object
- A marker pinned to a geo-location containing HTML content
- Buttons to manipulate the camera, such as +/- zoom buttons, a compass rose for the MapView, a gimble widget for the OrbitView, etc.
- A legend that offers visual comparison of sizes, colors etc. corresponding to the rendered layers and viewport. For example a distance ruler, a color scale for the HeatmapLayer, etc.

You may find many ready-to-use widgets in the `@deck.gl/widgets` module.

A widget is expected to implement the `IWidget` interface. Here is a custom widget that shows a spinner while layers are loading:

```ts
import {IWidget} from '@deck.gl/core';

class LoadingIndicator extends IWidget {
  element?: HTMLDivElement;
  size: number;

  constructor(options: {
    size: number
  }) {
    this.size = options.size;
  }

  onAdd() {
    const element = document.createElement('div');
    element.className = 'spinner';
    element.style.width = `${this.size}px`;
    // TODO - create animation for .spinner in the CSS stylesheet
    return element;
  }

  onRedraw({layers}) {
    const isVisible = layers.some(layer => !layer.isLoaded);
    this.element.style.display = isVisible ? 'block' : 'none';
  }
}

deckgl.addWidget(new LoadingIndicator({size: 48}));
```

## IWidget

### Methods

##### `onAdd`

Required. Called when the widget is added to a Deck instance.

Returns an optional UI element that should be appended to the Deck container.

##### `onRemove`

Required. Called when the widget is removed.

##### `onViewportChange`

Op†ional. Called when the containing view is changed. If `viewId: null`, will be called if any viewport changes.

Receives the following arguments:
- `viewport` (Viewport) - the viewport that has changed

##### `onRedraw`

Optional. Called when the containing view is redrawn. If `viewId: null`, will be called if anything redraws.

Receives the following arguments:
- `params`
  + `viewports` (Viewport[]) - the viewports that are being redrawn
  + `layers` (Layer[]) - the layers that are being redrawn

##### `onHover`

Optional. Called when a hover event occurs in the containing view. If `viewId: null`, will be called if hover occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-picking-info-object) describing the object being hovered.
* `event` - the original gesture event


##### `onClick`

Optional. Called when a click event occurs in the containing view. If `viewId: null`, will be called if click occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-picking-info-object) describing the object being clicked.
* `event` - the original gesture event


##### `onDragStart`

Optional. Called when a dragstart event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event

##### `onDrag`

Optional. Called when a drag event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event

##### `onDragEnd`

Optional. Called when a dragend event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](../../developer-guide/interactivity.md#the-picking-info-object) describing the object being dragged.
* `event` - the original gesture event


## Widget

The `Widget` base class provides some handy implementations, as a convenient starting point.

### constructor

Expects one arguments that defines any options for the instance.

### Members

The `Widget` class manages the following members.

#####  `deck` (Deck)

The [Deck](./deck.md) instance that this widget is attached to.

##### `element` (HTMLDivElement | null)

The HTML element that this widget creates.

##### `viewId` (String | null)

The id of the view that the widget is attached to. If `null`, the widget receives events from all views. Otherwise, it only receives events from the view that matches this id.

##### `props` (Object)

Any options for the widget, as passed into the constructor and can be updated with `setProps`.

### Methods

##### `setProps`

```js
widget.setProps(partialProps);
```

Merges the incoming object with `this.props`.
