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
at high zoom levels, unless using an offset mode around a local center.


### About 64-bit Layer Performance

Since WebGL does not expose native 64 bit floating point support to shaders,
deck.gl includes a library (fp64) emulating 64 bit floating point to allow
creation of "64 bit" layers.

As a very rough rule of thumb, on the GPU:
- Native 64 bit computations are ~4 times slower than 32 bit computations
- Emulated 64 bit computations are ~10 times slower than 32 bit computations

Now the amount of time spent in the vertex shader is only one part of
the rendering pipeline, and even a 64 bit vertex shader does not always perform
only 64 bit math, so the performance impact of using 64-bit calculations
will normally be significantly less than 10x.

There will also be a memory impact, in that all positions will require two
positions in your Float32Arrays. Usually a layer has some attributes that
are not positions, so the total memory impact normally be somewhat less than 2x.

If your data sets are modest in size (<100K) you will are unlikely to run into
performance issues with 64-bit layers, but if you have larger data sets you
may want to do some testing before moving to 64 bit layers.
