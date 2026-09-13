# Universal Widgets

This guide covers the steps to implement widgets that are "universal", or framework agnostic, ensuring compatibility across any deck.gl application. A universal widget extends the [`Widget`](../../api-reference/core/widget.md) base class and renders its own UI using DOM APIs (or [Preact](./preact-widgets.md)).

## Implementing the Widget Lifecycle

The widget lifecycle methods define how a widget initializes, renders, updates, and cleans up its integration with deck.gl.

### Constructing a Widget

`constructor(props: PropsT)` - Called by the application when it creates the widget. Pass the props to `super()`, which merges them with the static `defaultProps` and stores the result on `this.props`.

```ts
import {Widget} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';

export type CustomWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  viewId?: string | null;
};

export class CustomWidget extends Widget<CustomWidgetProps> {
  static defaultProps: Required<CustomWidgetProps> = {
    ...Widget.defaultProps,
    id: 'custom',
    placement: 'top-left',
    viewId: null
  };

  className = 'deck-widget-custom';
  placement: WidgetPlacement = 'top-left';

  constructor(props: CustomWidgetProps = {}) {
    super(props);
    // Sync the `placement` and `viewId` members with the props
    this.setProps(this.props);
  }

  setProps(props: Partial<CustomWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement) {
    // Render your UI here
  }
}
```

Remarks:

* The `className` and `placement` members are abstract in the base class and must be defined by your subclass.
* The `Widget` constructor copies `props` into a new object, so the object passed by the application is never mutated. Do not mutate `this.props` outside of `setProps`.

### Adding a Widget

[`onAdd({deck, viewId})`](../../api-reference/core/widget.md#onadd) - deck.gl calls this method once when the widget is first added to a `Deck` instance. By the time it is called, `this.deck` is already assigned.

The default implementation returns nothing, and the base class creates a root `<div>` for you with the `deck-widget` class, your `className`, the application-supplied `props.className`, and `props.style` applied. deck.gl appends the root element to a container positioned according to your `placement` and `viewId` members, and then calls `updateHTML()` to render it.

Use `onAdd` to register global listeners or fetch resources:

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  onAdd({deck, viewId}) {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  onRemove() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    // ...
  };
}
```

You can also return your own `HTMLDivElement` from `onAdd`. If you do, the base class does not create one, and you become responsible for applying `props.className` and `props.style` to it.

### Rendering HTML

[`onRenderHTML(rootElement)`](../../api-reference/core/widget.md#onrenderhtml) - This is the only abstract method you must implement. It is called with the root element after the widget is added, after every `setProps`, and every time your widget calls `this.updateHTML()`. Render the entire UI from the current `this.props` and internal state each time:

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  count = 0;

  onRenderHTML(rootElement: HTMLElement) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Clicked ${this.count} times`;
    button.onclick = () => {
      this.count++;
      this.updateHTML();
    };
    rootElement.replaceChildren(button);
  }
}
```

Remarks:

* `updateHTML()` is a no-op until the widget is mounted, so it is safe to call from anywhere.
* Widget containers have `pointer-events: none` so that they do not block interaction with the canvas. Interactive elements you create must set `pointer-events: auto` (the `.deck-widget-button button` rule in the deck.gl stylesheet does this for the built-in widgets).
* The root element is recycled between renders. Rendering everything from scratch is simplest; if performance matters, compare against previous state and update only what changed. Frameworks such as [Preact](./preact-widgets.md) handle this diffing for you.

### Updating Properties

[`setProps(props: Partial<PropsT>)`](../../api-reference/core/widget.md#setprops) - Called whenever the application supplies new props, and by `useWidget` on every React render. The base implementation updates the root element's `className` and `style`, merges the new props into `this.props`, and calls `updateHTML()`.

Override it to sync any class members that mirror props, and call `super.setProps(props)`:

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  setProps(props: Partial<CustomWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }
}
```

Remarks:

* When an application re-renders with a *new* widget instance that has the same `id`, deck.gl keeps the *existing* instance and calls `existingWidget.setProps(newWidget.props)`. Internal state therefore survives re-renders. Do not rely on your constructor running again.
* If `placement` or `viewId` changes, deck.gl removes the old widget and adds the new one, so `onRemove` and `onAdd` run again.

### Handling Viewport Changes

[`onViewportChange(viewport: Viewport)`](../../api-reference/core/widget.md#onviewportchange) - Called on each redraw with the viewport of the view the widget is attached to. Targeting is done by the `viewId` member: a widget writer can target a specific view by setting `viewId`, or listen to all views by leaving it `null`. Using props, a widget author can also let application developers configure this targeting.

Specific view:

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  viewId = 'minimap';

  onViewportChange(viewport: Viewport) {
    // Called with the "minimap" viewport only
  }
}
```

All views:

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  viewId = null;

  onViewportChange(viewport: Viewport) {
    // Called once per viewport, on every redraw
  }
}
```

### Redrawing the Widget

[`onRedraw({viewports, layers})`](../../api-reference/core/widget.md#onredraw) - Invoked every time deck.gl renders. This is useful for updating the widget UI to correspond to changes in layers or viewports, such as a `HeatmapLayer`'s `colorRange` prop or a layer's loading status.

```ts
export class CustomWidget extends Widget<CustomWidgetProps> {
  loading = false;

  onRedraw({viewports, layers}: {viewports: Viewport[]; layers: Layer[]}) {
    const loading = layers.some(layer => !layer.isLoaded);
    // Only re-render when something visible has changed
    if (loading !== this.loading) {
      this.loading = loading;
      this.updateHTML();
    }
  }
}
```

Remarks:

* `layers` is the flattened list of all rendered layers, including the sublayers generated by composite layers. To list only the layers the application supplied, filter out layers with a `parent`: `layers.filter(layer => !layer.parent)`.
* `onRedraw` can run on every animation frame during transitions and interactions. Avoid calling `updateHTML()` unconditionally.

### Removing the Widget

[`onRemove()`](../../api-reference/core/widget.md#onremove) - Called when your widget is removed from the `widgets` prop or the `Deck` is finalized. Clean up any listeners and resources you created in `onAdd`. deck.gl removes the root element from the DOM and clears `this.deck`, `this.rootElement` and `this.widgetManager` for you.

-----

## Controlling the View

Widgets frequently need to read or change the camera, for example to implement zoom or rotate buttons. The `Widget` base class provides protected helpers for this:

* `this.viewIds` - the view ids this widget applies to. Returns `[this.viewId]` if `viewId` is set, otherwise the ids of all views on the deck.
* `this.getViewState(viewId)` - the current view state of a view.
* `this.setViewState(viewId, viewState)` - updates a view's state through the same path as a user interaction. This works with both `initialViewState` (uncontrolled) and `viewState` + `onViewStateChange` (controlled) applications.

```ts
import {Widget, FlyToInterpolator} from '@deck.gl/core';

export class RotateWidget extends Widget<RotateWidgetProps> {
  rotate(bearingDelta: number) {
    for (const viewId of this.viewIds) {
      const viewState = this.getViewState(viewId);
      const bearing = ((viewState.bearing as number) ?? 0) + bearingDelta;
      this.setViewState(viewId, {
        ...viewState,
        bearing,
        transitionDuration: 300,
        transitionInterpolator: new FlyToInterpolator()
      });
    }
  }
}
```

Use `this.deck?.getView(viewId)` if you need to check the type of a view, for example to apply different logic to an `OrthographicView` and a `MapView`. See the built-in [`ZoomWidget`](https://github.com/visgl/deck.gl/blob/master/modules/widgets/src/zoom-widget.tsx) source for a complete example that respects `minZoom`/`maxZoom` constraints.

## Handling Interaction Events

A widget can respond to the user interacting with the deck.gl view it is attached to. The picking info and the original gesture event are passed to the handler:

```ts
import type {PickingInfo} from '@deck.gl/core';
import type {MjolnirGestureEvent} from 'mjolnir.js';

export class CustomWidget extends Widget<CustomWidgetProps> {
  viewId = 'minimap';

  onClick(info: PickingInfo, event: MjolnirGestureEvent) {
    // Called when a click occurs in the minimap view.
    if (info.object) {
      this.selected = info.object;
      this.updateHTML();
    }
  }
}
```

The same pattern applies to `onHover`, `onDragStart`, `onDrag` and `onDragEnd`. If `viewId` is `null`, the handlers are called for events in any view; check `info.viewport?.id` to tell them apart. See the [Widget API reference](../../api-reference/core/widget.md#methods-for-widget-writers) for a complete list.

## Managing Widget State

Widgets with internal state should support both controlled and uncontrolled usage, following the conventions of the built-in widgets. Here is a toggle:

```ts
export type SwitchWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  viewId?: string | null;
  /** Initial value for uncontrolled usage. Default `false`. */
  initialOn?: boolean;
  /** Controlled value. When provided, the widget reflects this prop and does not manage its own state. */
  on?: boolean;
  /** Called when the user toggles the switch. */
  onChange?: (on: boolean) => void;
};

export class SwitchWidget extends Widget<SwitchWidgetProps> {
  static defaultProps: Required<SwitchWidgetProps> = {
    ...Widget.defaultProps,
    id: 'switch',
    placement: 'top-left',
    viewId: null,
    initialOn: false,
    on: undefined!,
    onChange: () => {}
  };

  className = 'deck-widget-switch';
  placement: WidgetPlacement = 'top-left';
  private on: boolean;

  constructor(props: SwitchWidgetProps = {}) {
    super(props);
    this.on = this.props.initialOn;
    this.setProps(this.props);
  }

  setProps(props: Partial<SwitchWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  /** Returns the current value in both controlled and uncontrolled mode */
  getOn(): boolean {
    return this.props.on ?? this.on;
  }

  onRenderHTML(rootElement: HTMLElement) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(this.getOn()));
    button.textContent = this.getOn() ? 'On' : 'Off';
    button.onclick = () => this.handleClick();
    rootElement.replaceChildren(button);
  }

  handleClick() {
    const next = !this.getOn();
    // Always notify the application
    this.props.onChange(next);
    // Only update internal state when uncontrolled
    if (this.props.on === undefined) {
      this.on = next;
      this.updateHTML();
    }
    // In controlled mode the application updates the `on` prop, which triggers setProps -> updateHTML
  }
}
```

## Customizing Styles

A good universal widget lets application developers customize the styles of the elements it creates. The base class already handles two of the three common mechanisms:

- **Inline styles prop** - `props.style` is applied to the root element by the base class and updated in `setProps`. Nothing to do.
- **CSS class prop** - `props.className` is added to the root element by the base class and updated in `setProps`. Nothing to do.
- **CSS variables** - Read theme variables in your stylesheet so applications can override them.

### CSS Variables

Give your root element a unique class name via the `className` member and define its styles in a stylesheet that ships with your widget. Read sizes and colors from CSS variables with sensible fallbacks:

```css
.deck-widget-custom {
  background: var(--custom-widget-background, var(--button-background, #fff));
  color: var(--button-text-color, rgba(24, 24, 26, 1));
  border-radius: var(--button-corner-radius, 8px);
  box-shadow: var(--button-shadow, 0px 0px 8px 0px rgba(0, 0, 0, 0.25));
}
```

Applications can then override the variables globally, per widget type, or per instance:

```css
.deck-widget {
  --custom-widget-background: rebeccapurple;
}
```

```ts
new CustomWidget({style: {'--custom-widget-background': 'chartreuse'}});
```

Reusing the [built-in theme variables](../../api-reference/widgets/styling.md#customizable-css-variables) lets your widget automatically follow the deck.gl `LightTheme`/`DarkTheme` and any custom theme the application applies. If your widget shows a tooltip, apply the `deck-widget-tooltip` class to get themed tooltips, see [Widget Tooltips](../../api-reference/widgets/tooltips.md#writing-tooltips-in-custom-widgets).

## Example: Layer Loading Widget in Vanilla JS

Below is a complete widget that indicates whether all asynchronous layers have finished loading, implemented without any UI framework:

```ts
import {Widget} from '@deck.gl/core';
import type {Layer, WidgetPlacement, WidgetProps} from '@deck.gl/core';

export type LayerLoadingWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. Default `null`. */
  viewId?: string | null;
  /** Called when the overall loading state changes. */
  onLoadingChange?: (loading: boolean) => void;
};

export class LayerLoadingWidget extends Widget<LayerLoadingWidgetProps> {
  static defaultProps: Required<LayerLoadingWidgetProps> = {
    ...Widget.defaultProps,
    id: 'layer-loading',
    placement: 'top-left',
    viewId: null,
    onLoadingChange: () => {}
  };

  className = 'deck-widget-layer-loading';
  placement: WidgetPlacement = 'top-left';
  layers: Layer[] = [];
  loading = false;

  constructor(props: LayerLoadingWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<LayerLoadingWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRedraw({layers}: {layers: Layer[]}) {
    // Only consider top-level layers, not sublayers generated by composite layers
    const topLevelLayers = layers.filter(layer => !layer.parent);
    const loading = topLevelLayers.some(layer => !layer.isLoaded);
    const layersChanged =
      topLevelLayers.length !== this.layers.length ||
      topLevelLayers.some((layer, i) => layer !== this.layers[i]);

    const loadingChanged = loading !== this.loading;
    if (loadingChanged) {
      this.loading = loading;
      this.props.onLoadingChange(loading);
    }
    if (loadingChanged || layersChanged) {
      this.layers = topLevelLayers;
      this.updateHTML();
    }
  }

  onRenderHTML(rootElement: HTMLElement) {
    const status = document.createElement('div');
    status.textContent = this.loading ? 'Loading layers...' : 'All layers loaded';
    status.style.fontWeight = 'bold';

    const list = document.createElement('ul');
    for (const layer of this.layers) {
      const item = document.createElement('li');
      item.textContent = `${layer.id}: ${layer.isLoaded ? 'Loaded' : 'Loading'}`;
      list.appendChild(item);
    }

    rootElement.replaceChildren(status, list);
  }
}
```

```css
.deck-widget-layer-loading {
  padding: 8px 12px;
  background: var(--menu-background, #fff);
  color: var(--menu-text, rgb(24, 24, 26));
  border-radius: var(--button-corner-radius, 8px);
  box-shadow: var(--menu-shadow, 0px 0px 8px 0px rgba(0, 0, 0, 0.25));
  font-size: 12px;
}
```

This widget provides a visual representation of layer load statuses and updates as the deck.gl state changes.

## Testing Widgets

Because lifecycle methods are plain methods, most widget logic can be unit tested without a GPU by calling them directly:

```ts
import {test, expect, vi} from 'vitest';

test('LayerLoadingWidget fires onLoadingChange', () => {
  const onLoadingChange = vi.fn();
  const widget = new LayerLoadingWidget({onLoadingChange});

  widget.onRedraw({viewports: [], layers: [{id: 'a', isLoaded: false} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(true);

  widget.onRedraw({viewports: [], layers: [{id: 'a', isLoaded: true} as any]});
  expect(onLoadingChange).toHaveBeenCalledWith(false);
});
```

For end-to-end tests that render HTML, create a `Deck` with a `parent` element and the `widgets` prop in a browser test environment, then query the parent for your widget's class name. The [deck.gl widget test suite](https://github.com/visgl/deck.gl/tree/master/test/modules/widgets) shows this approach.
