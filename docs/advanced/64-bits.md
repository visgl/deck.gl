# About 64-bit Layers

Since version `3.0.0`, deck.gl begins to provide high precision floating point math support
in GPU shaders using emulated 64-bit floating points. 64-bit shaders are used in all layers when the fp64 prop is set to true. Please find the sample usage of them in the examples section.


<div align="center">
  <div>
    <img src="/website/src/static/images/demo-mandelbrot.gif" />
    <p><i>32-bit vs 64-bit Mandelbrot Set Zoom</i></p>
  </div>
</div>

<center>Mandelbrot set rendered on GPU using native 32-bit (left) floating point shaders and emulated 64-bit (right)
floating point shaders provided by deck.gl.</center>

## Precision

With 64-bit floating point support in shader, deck.gl layers is able to interactively visualize data with extremely high dynamic range. Points covering a whole city and accurate down
to centimeter level can be processed and rendered to canvas
on-the-fly. Since WebGL does not support 64-bit floating point, deck.gl uses two 32-bit
native floating point number to extend and preserve significant digits and
uses algorithms similar to those used in many multiple precision math libraries
to achieve the precision close to what IEEE-754 double precision floating point
numbers provide. Generally speaking, this mechanism provide 46 significant
digits in mantissa (48 overall) within the normal range of 32-bit single precision
float point numbers. This transfers to ~ `1x10^-15` relative error within
~ `1.2x10^-38` and `1.7x10^+38`.

The error bound as tested on 2015 MacBook Pro with AMD Radeon R9 M370X GPU:

| Operation | Error |
| ---- | ---- |
| Addition and subtraction | < 1 ulp |
| Multiplication | ~1.5 ulps |
| Division | ~2 ulps |
| Square root | ~2.6 ulps |
| Exponential | ~2.6 ulps |
| Logarithm | ~11.6 ulps |
| Trigonometry | ~5 ulps |

Note: `ulp` = [unit of least precision](https://en.wikipedia.org/wiki/Unit_in_the_last_place)

## Performance Implications

Since the 64-bit floating point maths are emulated using the multiple
precision arithmetics, it costs more GPU cycles than native 32-bit
math (the shader execution time alone is about ~10x slower). However, since
64-bit floating point maths are usually only required in vertex shader, the
overall performance impact is usually much less than 10x.

There will be a memory impact too, in that all vertex attributes and uniform
that uses 64-bit maths require double storage space in JavaScirpt. Same as mentioned
above, since a layer usually has some attributes that do not require 64-bit maths, the
total memory impact normally significantly less than 2x.

For more information regarding the performance of 64-bit layers, please check the
performance benchmark layers in the layer-browser example in deck.gl repo.

## References

* [http://crd-legacy.lbl.gov/~dhbailey/mpdist](http://crd-legacy.lbl.gov/~dhbailey/mpdist)
* [https://gmplib.org](https://gmplib.org)
