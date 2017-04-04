# Performance Notes


## General Expectations

There are mainly two aspects that developers usually consider regarding the
performance of any computer programs: the time and the memory consumption, both
of which obviously depends on the specs of the hardware deck.gl is ultimately
running on.

On 2015 MacBook Pros with dual graphics cards, most basic layers
(like `ScatterplotLayer`) renders fluidly at 60 FPS during pan and zoom
operations up to about 1M (one million) data items, with framerates dropping
into low double digits (10-20FPS) when the data sets approach 10M items.

Even if interactivity is not an issue, browser limitations on how
big chunks of contiguous memory can be allocated (e.g. Chrome caps
individual allocations at 1GB) will cause most layers to crash
during WebGL buffer generation somewhere between 10M and 100M items.
You would need to break up your data into chunks and use multiple
deck.gl layers to get past this limit.

Modern phones (recent iPhones and higher-end Android phones) are
surprisingly capable in terms of rendering performance, but are considerably
more sensitive to memory pressure than laptops, resulting in browser restarts
or page reloads.

Remarks:
* The layer browser example has a couple of performance tests that you can use
  to get FPS readings for 1M and 10M data sets on your hardware.


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

It is good to be aware that excessive overdraw can generate very high fragment
counts and thus hurt performance.
As an example, a `Scatterplot` radius of 5 pixels generates ~ 100 pixels per point,
times 10M points, which can result in up to 1 billion fragment shader invocations
per frame. While dependent on zoom levels (clipping will improve performance
to some extent) this will certainly strain even a recent MacBook Pro GPU.


## Layer Picking Performance

Recommendation: Enabling picking has a small performance penalty so make sure
the `pickable` property is `false` in layers that do not need picking (this
is the default value).

deck.gl performs picking by drawing the layer into an off screen
picking buffer. This essentially means that every layer that supports picking
will be drawn off screen when panning and hovering.


## Layer Precision

32 bit precision in many layers means that there is a limit to precision
at high zoom levels, unless using an offset mode around a local center.
