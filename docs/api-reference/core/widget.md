# Widget

A widget is a UI component that can interact with deck.gl's layers and views.
You can write your own widgets, or use any of the many ready-to-use widgets in the [`@deck.gl/widgets`](../widgets/overview.md) module.

## Usage

The `Widget` class is a base class used to define new widgets and should not be instantiated directly by an application. See the [Widget Documentation](../widgets/overview.md) for information about how to write your own widgets.

## Types 

#### `WidgetProps` (object) {#widgetprops}

Options for the widget, as passed into the constructor and can be updated with `setProps`.

#### `id` (string) {#id}

The `id` string must be unique among all your widgets at a given time. While a default `id` is provided, it is recommended to set `id` explicitly if you have multiple widgets of the same type.

#### `viewId` (string | null) {#viewid}

The `viewId` prop controls how a widget interacts with views. If `viewId` is defined, the widget is placed in that view and interacts exclusively with it; otherwise, it is placed in the root widget container and affects all views.

* Default: `null`

When a widget instance is added to Deck, the user can optionally specify a `viewId` that it is attached to (default `null`). If assigned, this widget will only respond to events occurred inside the specific view that matches this id.

The id of the view that the widget is attached to. If `null`, the widget receives events from all views. Otherwise, it only receives events from the view that matches this id.

#### `placement` (string, optional) {#placement}

Widget position within the view relative to the map container.

* Default: `'top-left'`

Widget positioning within the view. One of:

- `'top-left'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-right'`
- `'fill'`

#### `style` (object, optional) {#style}

Additional inline CSS styles on the top HTML element.

```ts
  style?: Partial<CSSStyleDeclaration>;
```

* Default: `{}`

#### `className` (string, optional) {#classname}

Additional CSS classnames on the top HTML element.
  
* Default: `''`

### Methods for Widget Writers

#### `constructor` {#constructor}

Supply the props and default props to the base class.

#### `setProps` {#setprops}

Called to update widget options.

#### `updateHTML` {#updatehtml}

Updates the widget. Called by the specific widget when state has changed. Calls `onRenderHTML()`

#### `onRenderHTML` {#onrenderhtml}

This function is implemented by the specific widget subclass to update the HTML for the widget

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
