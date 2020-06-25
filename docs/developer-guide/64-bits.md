# About 64-bit Layers

deck.gl can leverage high precision GPU floating point using emulated 64-bit floating point. For supportd layers (look for the 64-bit icon in the docs), 64-bit shaders are used when the `fp64` prop is set to true.

> With the improved precision 32 bit projection mode in deck.gl 6.1, the use of `fp64` is no longer required to achieve sub-centimeter precision. The new 32 bit projection mode has much better performance. This makes the `fp64` mode more of a niche technology that demonstrates how to use 64 bit calculations should you need to use them in your own applications.

<div align="center">
  <div>
    <img src="https://raw.github.com/visgl/deck.gl-data/master/images/fp64-mandelbrot.gif" />
    <p><i>32-bit vs 64-bit Mandelbrot Set Zoom</i></p>
  </div>
</div>

<center>Mandelbrot set rendered on GPU using native 32-bit (left) floating point shaders and emulated 64-bit (right)
floating point shaders provided by deck.gl.</center>


## Precision

With 64-bit floating point support in shader, deck.gl layers is able to visualize data with very high dynamic range. Points covering a whole city and accurate down to sub-centimeter level can be processed and rendered to canvas on-the-fly.

Since WebGL does not support 64-bit floating point, deck.gl uses two 32-bit native floating point number to extend and preserve significant digits and uses algorithms similar to those used in many multiple precision math libraries to achieve the precision close to what IEEE-754 double precision floating point numbers provide.

Generally speaking, this mechanism provide 46 significant digits in mantissa (48 overall) within the normal range of 32-bit single precision float point numbers. This transfers to ~ `1x10^-15` relative error within ~ `1.2x10^-38` and `1.7x10^+38`.

The error bound as tested on 2015 MacBook Pro with AMD Radeon R9 M370X GPU:

| Operation      | Error      |
| ----           | ----       |
| Addition       | < 1 ulp    |
| Subtraction    | < 1 ulp    |
| Multiplication | ~1.5 ulps  |
| Division       | ~2 ulps    |
| Square root    | ~2.6 ulps  |
| Exponential    | ~2.6 ulps  |
| Logarithm      | ~11.6 ulps |
| Trigonometry   | ~5 ulps    |

Note: `ulp` = [unit of least precision](https://en.wikipedia.org/wiki/Unit_in_the_last_place)


## Performance Implications

Since the 64-bit floating point maths are emulated using the multiple precision arithmetics, it costs more GPU cycles than native 32-bit
math (the shader execution time alone is about 10x slower). However, since 64-bit floating point maths are usually only required in vertex shader, the overall performance impact is usually less than 10x.

There will be a memory impact too, in that all vertex attributes and uniform that uses 64-bit maths require double storage space in JavaScirpt. Same as mentioned above, since a layer usually has some attributes that do not require 64-bit maths, the total memory impact is normally significantly less than 2x.

Shaders are more complex and can take time to compile on some systems, notably Windows.

For more information regarding the performance of 64-bit layers, please check the performance benchmark layers in the layer-browser example in deck.gl repo.


## Other Considerations

64-bit shaders push the GPU drivers quite a bit, and workarounds are needed to prevent GPU drivers from optimizing away critical parts of the code. The fp64 shader module has been tested on a range of GPUs and drivers however every now and then we encounter a new driver that needs special treatment.

If you mainly deploy into a know set of clients that you can test in advance, this is not a big issue, however if you expect your applications to work across a large set of devices you may want to stay with 32-bit calculations.


## References

* [http://crd-legacy.lbl.gov/~dhbailey/mpdist](http://crd-legacy.lbl.gov/~dhbailey/mpdist)
* [https://gmplib.org](https://gmplib.org)
