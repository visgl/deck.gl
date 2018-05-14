# Adding Interactivity

> This article discusses interacting with data (i.e. selecting, or picking objects). Viewport controls (panning, zooming etc) are discussed in [Controllers](/docs/api-reference/map-controller.md).

## Overview

deck.gl includes a powerful picking engine that enables the application to precisely determine what object and layer is rendered on a certain pixel on the screen. This picking engine can either be called directly by an application (which is then typically implementing its own event handling), or it can be called automatically by the basic built-in event handling in deck.gl

### What can be Picked?

The "picking engine" identifies which object in which layer is at the given coordinates. While usually intuitive, what constitutes a pickable "object" is defined by each layer. Typically, it corresponds to one of the data entries that is passed in via `prop.data`. For example, in [Scatterplot Layer](/docs/layers/scatterplot-layer.md), an object is an element in the `props.data` array that is used to render one circle. In [GeoJson Layer](/docs/layers/geojson-layer.md), an object is a GeoJSON feature in the `props.data` feature collection that is used to render one point, path or polygon.

### Enabling Picking

Picking can be enabled or disabled on a layer-by-layer basis. To enable picking on a layer, set its [`pickable`](/docs/api-reference/layer.md#-pickable-boolean-optional-) prop to `true`. This value is `false` by default.

### The Picking Info Object

The picking engine returns "picking info" objects which contains a variety of fields describing what layer and object was picked.

| Key      | Value |
| ---      | --- |
| `layer`  | The layer that the picked object belongs to. Only layers with the `pickable` prop set to true can be picked. |
| `index`  | The index of the object in the layer that was picked. |
| `object` | The object that was picked. This is typically an entry in the layer's `props.data` array, but can vary from layer to layer. |
| `x`      | Mouse position x relative to the viewport. |
| `y`      | Mouse position y relative to the viewport. |
| `lngLat` | Mouse position in geospatial coordinates. Only applies if `layer.props.coordinateSystem` is a geospatial mode such as `COORDINATE_SYSTEM.LNGLAT`. |

> Specific deck.gl Layers may add additional fields to the picking `info` object. Check the documentation of each layer.

## Calling the Picking Engine Directly

The picking engine is exposed through the [`DeckGL.pickObject`]((/docs/api-reference/react/deckgl.md) and [`DeckGL.pickObjects`]((/docs/api-reference/react/deckgl.md) methods. These methods allow you to query what layers and objects within those layers are under a specific point or within a specified rectangle. They return `Picking Info` objects as described below.

`pickObject` allows an application to define its own event handling. When it comes to how to actually do event handling in a browser, there are many options. In a React application, perhaps the simplest is to just use React's "synthetic" event handling together with `pickObject`:

```js
class MyComponent extends React.Component {
  ...
  onClickHandler = (event) => {
    const pickInfo = this.deckGL.pickObject({x: event.clientX, y: event.clientY, ...});
    console.log(pickInfo.lngLat);
  }

  render() {
    return (
      <div onClick={this.onClickHandler}>
        <DeckGL ref={deck => { this.deckGL = deck; }} .../>
      </div>
    );
  }
}
```

Also note that by directly calling `queryObject`, integrating deck.gl into an existing application often becomes easier since you don't have to change the application's existing approach to event handling.

## Using the Built-in Event-Handling

For applications that have basic event handling needs, deck.gl has built-in support for handling the two most basic mouse events: `hover` and `click`. When the application registers callbacks, deck.gl automatically tracks these events, runs the picking engine and calls application callbacks with a single parameter `info` which contains the resulting picking info object.

There are two ways to subscribe to the built-in picking event handling:

* Set callback for each pickable layer by setting [`onHover`](/docs/api-reference/layer.md#-onhover-function-optional-) and [`onClick`](/docs/api-reference/layer.md#-onclick-function-optional-) props:

```js
const layer = new ScatterplotLayer({
    ...
    pickable: true,
    onHover: info => console.log('Hovered:', info),
    onClick: info => console.log('Clicked:', info)
});
```

* Set callback for all pickable layers by setting [`onLayerHover`](/docs/api-reference/react/deckgl.md#-onlayerhover-function-optional-) and [`onLayerClick`](/docs/api-reference/react/deckgl.md#-onlayerclick-function-optional-) props of the `DeckGL` canvas:

```js
<DeckGL
    ...
    onLayerHover={this._onHover}
    onLayerClick={this._onClick}
/>
```

The callbacks for `hover` and `click` events are called with a single parameter `info` that contains the mouse or touch event and what was hovered, including which layer was selected. Thus event handlers registered directly on the `DeckGL` components are also able to distinguish between clicks in different layers.

### Behavior of Built-in Event Handling

Picking events are triggered based on *pickable objects*:

* A `click` event is triggered every time the pointer clicked on an object in a pickable layer.
* A `hover` event is triggered every time the hovered object of a pickable layer changes.

When an event is fired, the `onHover` or `onClick` callback of the affected layer is called first. If the callback returns a truthy value, the event is marked as handled. Otherwise, the event will bubble up to the `DeckGL` canvas and be visible to its `onLayerHover` and `onLayerClick` callbacks.


## Under The Hood

If you are using the core layers, all has been taken care of.

If you are implementing a custom layer, read more about
[how picking is implemented](/docs/developer-guide/picking.md).
