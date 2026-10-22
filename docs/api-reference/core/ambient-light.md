# AmbientLight

Create an ambient light source which illuminates all the objects equally. Ambient light comes from all directions, adding ambient light ensures that object colors are rendered but does not show structure in 3D objects like directional and point lights do. Only one ambient light is supported.

![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/ambient-light.gif)

*Two spheres with ambient light*

## Usage[​](#usage "Direct link to Usage")

Create an ambient light source with color and intensity.

```
const ambientLight= new AmbientLight({

  color: [128, 128, 0],

  intensity: 2.0

});
```

## Methods[​](#methods "Direct link to Methods")

### constructor[​](#constructor "Direct link to constructor")

The constructor for the `AmbientLight` class. Use this to create a new `AmbientLight`.

```
const ambientLight = new AmbientLight({color, intensity});
```

* `color` - (number\[3],) RGB color of ambient light source, default value is `[255, 255, 255]`.
* `intensity` - (number) Strength of ambient light source, default value is `1.0`.
