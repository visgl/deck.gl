# Writing Your Own Layer

## Preparations

Before creating a new layer, it is recommended that you verify that you can not achive the desired effect either through layer subclassing or through using composite layers.

There are a couple of ways to build a layer in deck.gl, and it is helpful to consider what approach will serve you best before starting:

* **[Create a composite layer](/docs/developer-guide/composite-layers.md)** - A composite layer is a special kind of layer that creates other layers. This allows you to build e.g. a "semantic layer" - a layer that presents a different interface (set of props) than an existing layer, transforms those props into a format that fits and existing layer, etc.
* **[Subclass a layer](/docs/developer-guide/subclassed-layers.md)** - Subclassed layer is a new layer created by subclassing another layers. This allows the developer to reuse all of the interfaces and implementations of an existing layer unless they are explicitly overriden.
* **[Implement a layer from scratch](/docs/developer-guide/primitive-layers.md)** - If you want to draw something completely different and you are comfortable with WebGL and shader programming, this option gives you the most flexibility. You have full control of the layer lifecycle, you can manage your own model(s) and directly manipulate the WebGL context.


## Creating The Layer class

Your layer class must be a subclass of [Layer](/docs/api-reference/layer.md).

```js
import {Layer} from 'deck.gl';

class AwesomeLayer extends Layer {...}
```

It can be a direct subclass of `Layer`, or extend another layer.

### Naming Your Layer

Store the layer name in the `layerName` static property on your `Layer` subclass:

```js
AwesomeLayer.layerName = 'AwesomeLayer';
```

The layer name will be used as the default id of layer instances and also during
debugging.


### Defining Layer Properties

The list of properties is the main API your new layer will provide to
applications. So it makes sense to carefully consider what properties
your layer should offer.

You also need to define the default values of the layer's properties.

The most efficient method of doing this is to define a static `defaultProps`
member on your layer class.

```js
AwesomeLayer.defaultProps = {
  color: [255, 0, 0],
  opacity: 0.5
};
```

Also consider the properties of the base [Layer](/docs/api-reference/layer.md) class,
as well as any other inherited properties if you are deriving.
