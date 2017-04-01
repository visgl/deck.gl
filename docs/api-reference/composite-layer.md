# CompositeLayer Class

The CompositeLayer is a subclass of the
[Layer Class](/docs/api-reference/base-layer.md), with its own implementation
of certain
[layer lifecycle methods](/docs/advanced/layer-lifecycle.md#lifecycle-methods)
to help create sublayers and handle events.

If you intend to implement a layer that generates other layers, it is recommended
that you extend this class.