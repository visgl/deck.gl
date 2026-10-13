# Widget

A widget is a UI component that can interact with deck.gl's layers and views. You can write your own widgets, or use any of the many ready-to-use widgets in the [`@deck.gl/widgets`](https://deck.gl/next/docs/api-reference/widgets/overview.md) module.

## Usage[​](#usage "Direct link to Usage")

The `Widget` class is a base class used to define new widgets and should not be instantiated directly by an application. See the [Widget Documentation](https://deck.gl/next/docs/api-reference/widgets/overview.md) for information about how to write your own widgets.

## Types[​](#types "Direct link to Types")

### `WidgetProps` (object)[​](#widgetprops "Direct link to widgetprops")

Options for the widget, as passed into the constructor and can be updated with `setProps`.

#### `id` (string, optional)[​](#id "Direct link to id")

* Default: the widget's name.

The `id` string must be unique among all your widgets at a given time. While a default `id` is provided, it is recommended to set `id` explicitly if you have multiple widgets of the same type.

Remarks:

* `id` is used to match widgets between rendering calls. deck.gl requires each widget to have a unique `id`. A default `id` is assigned based on widget type, which means if you are using more than one widget of the same type (e.g. two `InfoWidget`s) you need to provide a custom `id` for at least one of them.

#### `style` (object, optional)[​](#style "Direct link to style")

* Default: `{}`

Additional inline CSS styles on the top HTML element of the widget. camelCase CSS properties (e.g. `backgroundColor`) and kebab-case CSS variables are accepted (e.g. `--button-size`).

```
  style?: Partial<CSSStyleDeclaration>;
```

#### `className` (string, optional)[​](#classname "Direct link to classname")

* Default: `''`

Additional CSS classnames on the top HTML element.

#### `_container` (string | HTMLDivElement, optional)[​](#_container "Direct link to _container")

Experimental. Selects the DOM container used for this widget. Defaults to `viewId`.

* If set to `'root'`, the widget is placed relative to the shared widget root.
* If set to a valid view id, the widget is placed relative to that view.
* If set to an HTMLElement, `placement` is ignored and the widget is appended into the given element.

Deck-managed containers remain under one shared widget root. In multi-canvas mode, a view-specific container is positioned using the bounds of the presentation canvas assigned to that view; the widget is not appended to the canvas element.

### Additional `WidgetProps` on UI Widgets[​](#additional-widgetprops-on-ui-widgets "Direct link to additional-widgetprops-on-ui-widgets")

#### `viewId` (string | null)[​](#viewid "Direct link to viewid")

* Default: `null`

The `viewId` prop controls both positioning and event scope. If defined, the widget is positioned relative to the matching view and only responds to events inside that view. If `null`, the widget is positioned in the shared root widget container and receives events from all views.

In multi-canvas mode, the matching view's `canvasId` determines which presentation-canvas bounds are used to position the widget. The widget DOM remains under the shared widget root rather than being reparented into that canvas.

#### `placement` (string, optional)[​](#placement "Direct link to placement")

* Default: `'top-left'`

Widget positioning within the selected view, or within the shared widget root when `viewId` is `null`. One of:

* `'top-left'`
* `'top-right'`
* `'bottom-left'`
* `'bottom-right'`
* `'fill'`

### Methods for Widget Writers[​](#methods-for-widget-writers "Direct link to Methods for Widget Writers")

#### `constructor`[​](#constructor "Direct link to constructor")

Supply the props and default props to the base class.

#### `setProps`[​](#setprops "Direct link to setprops")

Called to update widget options.

#### `updateHTML`[​](#updatehtml "Direct link to updatehtml")

Updates the widget. Called by the specific widget when state has changed. Calls `onRenderHTML()`

#### `onRenderHTML`[​](#onrenderhtml "Direct link to onrenderhtml")

This function is implemented by the specific widget subclass to update the HTML for the widget

#### `onAdd`[​](#onadd "Direct link to onadd")

Required. Called when the widget is added to a Deck instance.

Receives the following arguments:

* `context` (object)

  <!-- -->

  * `deck` (Deck) - the Deck instance that this widget is being attached to.
  * `viewId` (string | null) - the view id that this widget is being attached to.

Returns an optional UI element that should be appended to the Deck container.

#### `onRemove`[​](#onremove "Direct link to onremove")

Optional. Called when the widget is removed.

#### `onViewportChange`[​](#onviewportchange "Direct link to onviewportchange")

Op†ional. Called when the containing view is changed. If `viewId: null`, will be called if any viewport changes.

Receives the following arguments:

* `viewport` (Viewport) - the viewport that has changed

#### `onRedraw`[​](#onredraw "Direct link to onredraw")

Optional. Called when the containing view is redrawn. If `viewId: null`, will be called if anything redraws.

Receives the following arguments:

* `params`

  * `viewports` (Viewport\[]) - the viewports that are being redrawn
  * `layers` (Layer\[]) - the layers that are being redrawn

#### `onHover`[​](#onhover "Direct link to onhover")

Optional. Called when a hover event occurs in the containing view. If `viewId: null`, will be called if hover occurs in any view.

Receives arguments:

* `info` - the [picking info](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) describing the object being hovered.
* `event` - the original gesture event

#### `onClick`[​](#onclick "Direct link to onclick")

Optional. Called when a click event occurs in the containing view. If `viewId: null`, will be called if click occurs in any view.

Receives arguments:

* `info` - the [picking info](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) describing the object being clicked.
* `event` - the original gesture event

#### `onDragStart`[​](#ondragstart "Direct link to ondragstart")

Optional. Called when a dragstart event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event

#### `onDrag`[​](#ondrag "Direct link to ondrag")

Optional. Called when a drag event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event

#### `onDragEnd`[​](#ondragend "Direct link to ondragend")

Optional. Called when a dragend event occurs in the containing view. If `viewId: null`, will be called if drag occurs in any view.

Receives arguments:

* `info` - the [picking info](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) describing the object being dragged.
* `event` - the original gesture event
