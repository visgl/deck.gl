# RFC: Advanced Event Handling

* Authors: Xiaoji Chen
* Date: September 26, 2018
* Status: **Draft**


## Overview

This RFC proposes an extensible system where layers can specify callbacks to additional pointer events beyond `onHover` and `onClick`.

## Background

In the context of creating "editable" layers, it is desirable to package event listeners inside a custom layer. In the current system, where old layer instances are disposed each rendering cycle, event listeners created inside a layer must be unbound and bound every time the layer updates. See [example in nebula](https://github.com/uber/nebula.gl/blob/989c56ef647af374e85c7cb2360b567c69676f7b/modules/core/src/lib/layers/editable-layer.js).

Another issue in editable layers is that in the current system, event handlers can only be supplied to the `props` object at layer construction. This makes it difficult for a custom layer to encapsulate event handling code as part of the class.

The goal of this proposal is to support callback for any of the [mjolnir.js events](https://github.com/uber-web/mjolnir.js/blob/master/docs/api-reference/event-manager.md#supported-events-and-gestures).

## Proposal

### New Layer Props

A layer accepts additional props in the form of `on<CamelCaseEventName>`. For example:

```js
new ScatterplotLayer({
    ...
    onPanStart: this._onPanStart,
    onPanMove: this._onPanMove,
    onPanCancel: this._onPanEnd
    onPanEnd: this._onPanEnd
});
```

Each callback will be invoked with a [`PickingInfo`](/docs/get-started/interactivity.md) object if the specified event is fired over the layer's rendered content.

### New Deck Props

Deck accepts additional props in the form of `onLayer<CamelCaseEventName>`. For example:

```js
new Deck({
    ...
    onLayerPanStart: this._onLayerPanStart,
    onLayerPanMove: this._onLayerPanMove,
    onLayerPanCancel: this._onLayerPanEnd
    onLayerPanEnd: this._onLayerPanEnd
});
```

Each callback will be invoked with a [`PickingInfo`](/docs/get-started/interactivity.md) object if the specified event is fired on the canvas.

### Packaged Event Handling in CompositeLayer

Allow layers to override default event handling using `on*` methods:

```js
class MyLayer extends CompositeLayer {

    onClick(...args) {
        // do something
        if (this.props.onClick) {
            this.props.onClick(...args);
        }
    }

    onDrag(...args) {
        // do something
        if (this.props.onDrag) {
            this.props.onDrag(...args);
        }
    }
}
```


### Event Handling in Deck

`Deck` currently executes `pickLayers` on `hover` (pointer move without button down) and `click` regardless whether they are being listened to. The most recent result of `hover` is saved in `layerManager.context.lastPickingInfo`.

In the proposed new event system, during each update cycle, `LayerManager` will produce a list of events that are being listened to by any of the current layers/sublayers. `Deck` then merges this list with the list of events that are being listened to by top-level props. Event listeners are added/removed from `EventManager` if events are added/removed from the list. This ensures that only the event that have handlers will be fired.

To avoid additional perf hit, picking should not be performed on every event. Other than `hover`, no event will invoke picking. Instead, they use the last-picked object stored in `lastPickingInfo`.


## Cost and Impact

The proposal will require the following changes:
- `mjolnir.js`: new utility to validate a list of events
- `LayerManager` class: a new method that returns a list of events that are being listened to
- `Deck` class: a new method that diffs lists of events and update `EventManager`, executed after each `setProps`; a new method that handles any new event

If implemented:
- Existing applications should not see visible difference in terms of behavior or performance.
- Adding new event handlers to a layer does not have significant perf implication.
- Adding event handlers to a large amount of layers, verses adding them to a single layer, have no impact on perf.
- Changing the handler function to an existing event has no impact on perf.
