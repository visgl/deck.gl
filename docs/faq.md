# Frequently Asked Questions

deck.gl is designed to be easy to use, however it is built on top of a complex technology (WebGL) and supports a functional/reactive programming paradigm which many users are initially unfamiliar with.


## Installing npm modules, learning React, it is just too much!

Not to worry, there are easier ways to use deck.gl:

* **Scripting** - deck.gl has a scripting API that allows you get started just by adding a `<script>` statement to your HTML to use standard JavaScript. For an easy introduction to deck.gl scripting, see our [blog post](https://medium.com/vis-gl/start-scripting-with-deck-gl-c9036d7a6011).

* **JSON Layers** - It is even possible to use deck.gl without programming, by specifying deck.gl layers using a simple JSON format. See [JSON Layer Browser](deck.gl/json).

* **kepler.gl** - If scripting JSON is also too much, and you just want to play around with deck.gl visualizations in a polished application user interface, please check out [kepler.gl](http://kepler.gl/).


## Layer pixels render randomly on top of each other

You are likely experiencing a well-known issue in 3D graphics known as Z-fighting. The good news is that there are many ways to mitigate Z-fighting and deck.gl provides several mechanisms to help you. To get started, see the [tips and tricks](/docs/developer-guide/tips-and-tricks.md) article.


## Should I really regenerate all layers every time something changes?

Q: If I wanted to, say, change the opacity of a layer, Is my only option to create a new layer with the same Id and different properties?

Yes. deck.gl is a "reactive" application architecture and is optimized to be used like this. The layer and its props are essentially only a "descriptor", deck.gl matches and "diffs" the layers under the hood and only does the necessary changes based on actual differences compared to last layer.

This is a "functional" take on programming, and it parallels key ideas in the widely used React library. The reactive architecture has big benefits when writing larger prgrams, but these are not as evident when writing smaller scripts.

If you are coming from a more "imperative" programming experience, it can initially seem a little counter-intuitive (especially from a performance perspective). But in spite of how the API looks, performance should be very good, if this is not the case you are likely doing something else wrong.

For more information, see the article about [updates](/docs/developer-guide/performance.md).


## I can't "extend" my Custom Layer

Q: Why does deck.gl call `Object.seal` on the `Layer` base class? I can't add members to my subclass.

An important thing to understand about layer instances is that they are essentially just "disposable descriptors". All permanent state is stored in the `layer.state` object, which "moves" between layers.

Every time you change your layer, you create a new layer and pass it to Deck or DeckGL. Internally DeckGL matches new layers with old layers, and the old layers are released for garbage collection. So storing data on the layer itself typically does not make sense.


## How do I **debug** deck.gl applications?

Both deck.gl and luma.gl have powerful logging capabilities.

See the article about [debugging](/docs/developer-guide/debugging.md).


## How do I **test** deck.gl applications?

Q: It is hard to test webgl based applications, assuming deck.gl is no different?

Check out `@deck.gl/test-utils`, which (among other things) supports visual regression testing.
