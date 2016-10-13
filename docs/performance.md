# deck.gl Performance Notes


## General Expectations

While performance is obviously hardware dependent here are some guidelines:

On recent MacBook Pros with dual graphics cards, we see most basic layers
rendering fluidly during pan and zoom operations up to about 1M (one million)
data items, with framerates dropping into low single digits when the data
sets approach 10M items.

Even if interactivity is not an issue, due to browser limitations on how
big chunks of contiguous memory can be allocated (e.g. Chrome caps allocations
at 1GB), most layers will crash during WebGL buffer generation somewhere
between 10M and 100M items. You would need to break up your data into chunks
and use multiple deck.gl layers to get past this limit.

In addition to rendering performance, another consideration is deck.gl's
automatic WebGL buffer generation which takes some time to complete
whenever data changes.
While often imperceptible for small, non-changing data sets, this step can take
multiple seconds for multi-million item layers, and if your data set is updated
frequently, buffer generation can cause "stutter" in e.g. animations,
even for layers with just a few thousand items. It is possible to overcome
these issues using special techniques, but it will require extra work.

TBA - test results on MacBook Air and iPhone


## Layer Update Performance

When the `data` prop changes, deck.gl will recalculate its webgl buffers.
The time required for this is proportional to the number of items in your
`data` prop.
Note that deck.gl will call the accessors you supply to the layer for
every object, so normally you would want the accessors to be trivial functions
that just return alreay precomputed/transformed data.


## Layer Rendering Performance

Layer rendering performance is essentially proportional to the number of items
in the layer's `data` prop (plus some overhead for setting up the GPU draw
call).


## Layer Picking Performance

Recommendation: Enabling picking has a performance penalty so make sure
`isPickable` is `false` in layers that do not need picking.

deck.gl performs picking by drawing the layer into an off screen
picking buffer. This essentially means that every layer that supports picking
will be drawn twice when panning and hovering.


## Layer Precision

32 bit precision in many layers means that there is a limit to precision
at high zoom levels.


### About 64-bit Layer Performance

As a very rough rule of thumb, on the GPU:
- Native 64 bit computations are ~4 times slower than 32 bit computations
- Emulated 64 bit computations are ~10 times slower than 32 bit computations

Since WebGL does not expose native 64 bit floating point support to shaders,
deck.gl uses emulated 64 bit floating point in its 64 bit shaders. Now the
amount of time spent in the vertex shader doing 64 bit calculation is only
a part of the rendering pipeline, so the performance impact will be limited
but not non-existent.

If your data sets are modest in size (<100K) you will probably not run into
performance issues with 64 bit layers, but if you have larger data sets you
may want to do some testing before moving to 64 bit layers.


## Instrumentation

deck.gl is built on luma.gl which has extensive debugging and instrumentation
support.

TBA


## Implementation notes:

Possible performance improvements:

- Picking performance improvement: It might be helpful to allow the
  application to control what type of picking a layer supports
  (e.g. hover vs. click vs. none) - as hovering over a large layer will
  cause a noticeable lag.
- Picking performance improvement: It might be helpful to disable picking
  during pan and zoom operations.
- Layer rendering, memory use and buffer creation time:
  Experiment with packing colors as Uint8s instead of Float32s
- Layer rendering: Experiment with creating single interleaved buffers with
  offsets and strides.
- Rewrite layer matching to handle many layers more efficiently.
