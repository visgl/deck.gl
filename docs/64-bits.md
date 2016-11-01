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
