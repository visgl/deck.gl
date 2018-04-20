# Performance Notes


## General Expectations

There are mainly two aspects that developers usually consider regarding the
performance of any computer programs: the time and the memory consumption, both of which obviously depends on the specs of the hardware deck.gl is ultimately running on.

On 2015 MacBook Pros with dual graphics cards, most basic layers
(like `ScatterplotLayer`) renders fluidly at 60 FPS during pan and zoom
operations up to about 1M (one million) data items, with framerates dropping into low double digits (10-20FPS) when the data sets approach 10M items.

Even if interactivity is not an issue, browser limitations on how big chunks of contiguous memory can be allocated (e.g. Chrome caps individual allocations at 1GB) will cause most layers to crash during WebGL buffer generation somewhere between 10M and 100M items. You would need to break up your data into chunks and use multiple deck.gl layers to get past this limit.

Modern phones (recent iPhones and higher-end Android phones) are surprisingly capable in terms of rendering performance, but are considerably more sensitive to memory pressure than laptops, resulting in browser restarts or page reloads. They also tend to load data significantly slower than desktop computers, so some tuning is usually needed to ensure a good overall user experience on mobile.

## Layer Update Performance

In addition to rendering performance, another consideration is deck.gl's
automatic WebGL buffer generation which takes some time to complete
whenever data changes.

When the `data` prop changes, deck.gl will recalculate its WebGL buffers.
The time required for this is proportional to the number of items in your
`data` prop.
Note that deck.gl will call the accessors you supply to the layer for
every object, so normally you would want the accessors to be trivial functions
that just return already precomputed/transformed data.

While often imperceptible for small, non-changing data sets, this step can take
multiple seconds for multi-million item layers, and if your `data` prop is updated
frequently, buffer generation can cause "stutter" in e.g. animations,
even for layers with just a few thousand items. While it is usually possible to
overcome these issues using special techniques, but it can require extra work.
Before optimizing data updates, make sure that:

* you are not modifying the data prop when it hasn't changed. The layer will
   do a shallow equal to determine if it needs to regenerate buffers. So if
   nothing has changed, make sure you supply the **same** data object (typically
   an Array) every time you render.


## Layer Rendering Performance

Layer rendering time (for large data sets) is essentially proportional to:

1. The number of vertex shader invocations,
   which corresponds to the number of items in the layer's `data` prop
2. The number of fragment shader invocations, which corresponds to the total
   number of pixels drawn.

Thus it is possible to render a scatterplot layer with 10M items with reasonable
frame rates on recent GPUs, provided that the radius (number of pixels) of each
point is small.

It is good to be aware that excessive overdraw (drawing many objects/pixels on top of each other) can generate very high fragment counts and thus hurt performance. As an example, a `Scatterplot` radius of 5 pixels generates ~ 100 pixels per point. If you have a `Scatterplot` layer with 10 million points, this can result in up to 1 billion fragment shader invocations per frame. While dependent on zoom levels (clipping will improve performance to some extent) this many fragments will certainly strain even a recent MacBook Pro GPU.


## Layer Precision

* 32 bit precision is the default in most layers which means that there is a limit to precision that usually becomes evident at high zoom levels (objects start to "wobble" at around mercator zoom 18). These precision can be worked around by setting the `fp64` prop to true, or by using an offset mode based coordinate system (assumes data is clusted around a local center). Flipping on 64 bit precision affects performance as described above and in the separate chapter about the 64-bit GPU solution in deck.gl.


## Layer Picking Performance

deck.gl performs picking by drawing the layer into an off screen picking buffer. This essentially means that every layer that supports picking will be drawn off screen when panning and hovering. The picking is performed using the same GPU code that does the visual rendering, so the performance should be easy to predict.

Picking limitations:

* The picking system can only distinguish between 16M items per layer.
* The picking system can only handle 256 layers with the pickable flag set to true.


## Number of Layers

The layer count of an advanced deck.gl application tends to gradually increase, especially when using composite layers. We have built and optimized a highly complex application using close to 100 deck.gl layers (this includes hierarchies of sublayers rendered by custom composite layers rendering other composite layers) without seeing any performance issues related to the number of layers. If you really need to, it is probably possible to go a little higher (a few hundred layers). Just keep in mind that deck.gl was not designed to be used with thousands of layers.


## Profiling Ideas

Some profiling techniques:

* Using the `seer` chrome extension you can also get GPU timings for your layers.
* The `layer-browser` example (in the `examples` folder has a couple of performance tests that you can use to get FPS readings on your hardware for Scatterplot layers with 1M and 10M points.

## Common Issues

A couple of particular things to watch out for that tend to have a big impact on performance:

* If not needed disable Retina/High DPI rendering. It generetes 4x the number of pixels (fragments) and can have a big performance impact that depends on which computer or monitor is being used. This feature can be controlled using `useDevicePixels` prop of `DeckGL` component and it is on by default.
* Avoid using luma.gl debug mode in production. It queries the GPU error status after each operation which has a big impact on performance.

Smaller considerations:

* Enabling picking can have a small performance penalty so make sure the `pickable` property is `false` in layers that do not need picking (this is the default value).
