# About 64-bit Layers

From version `3.0.0`, deck.gl begins to provide basic 64-bit math support
in GPU shaders. 64-bit maths are used in various 64-bit layers that are provided
with deck.gl. Please find the sample usage of them in the examples section.

<div align="center">
  <img src="/demo/src/static/images/demo-mandelbrot.gif" />
</div>

<center>Mandelbrot set rendered on GPU using native 32-bit (left) math and 64-bit (right)
math library provided by deck.gl.</center>

## Precision

Using 64-bit layers, deck.gl is able to visualize data with extremely high
dynamic range interactively. Points covering a whole city and accurate down
to centimeter level at the same time can be processed and drawn to canvas
on-the-fly. Since WebGL does not expose native 64-bit floating point number
support of certain modern desktop GPUs to developers, deck.gl uses two 32-bit
native floating point number to extend and preserve significant digits and
uses algorithms similar to those used in many multiple precision math libraries
to achieve precision close to what IEEE-754 double precision floating point
numbers provide. Generally speaking, this mechanism provide 46 significant
digits in mantissa (48 overall) within the normal range of 32-bit single precision
float point numbers. This transfers to ~ `1x10^-15` relative error within
~ `1.2x10^-38` and `1.7x10^+38`.

The error bound as tested on 2015 MacBook Pro with AMD Radeon R9 M370X GPU:

```
Addition and subtraction: < 1 ulp
Multiplication: ~1.5 ulps
Division: ~2 ulps
Square root: ~2.6 ulps
Exponential: ~2.6 ulps
Logarithm: ~11.6 ulps (depends on the accuracy of native log() function)
Trigonometry: ~5 ulps
```
Note: `ulp` = [unit of least precision](https://en.wikipedia.org/wiki/Unit_in_the_last_place)

## Performance Implications

Since the 64-bit floating point maths are emulated using the multiple precision
arithmetics, it costs much more GPU cycles than native 32-bit math (more than an
order of magnitude, not to mention the non-IEEE compliant "fast-math" functions
that most GPUs use to trade accuracy for speed. However, for most data visualization
applications, the amount of time spent in the vertex shading stage is only part
of the time spent in the whole the rendering pipeline, and 64-bit layers only
perform 64-bit maths in accuracy critical paths, so the performance impact of using
64-bit calculations will normally be significantly less than an order of magnitude.

There will be a memory impact too, in that all vertex attributes and uniform data
that uses 64-bit maths require double storage space in JavaScirpt. Same as mentioned
above, since a layer usually has some attributes that do not require 64-bit maths,the
total memory impact normally be somewhat less than 2x.

If your data sets are modest in size (<100K) you will are unlikely to run into
performance issues with 64-bit layers on modern GPUs, but if you have larger data
sets you may want to do some testing before moving to 64-bit layers.

## References

- http://crd-legacy.lbl.gov/~dhbailey/mpdist
- https://gmplib.org
