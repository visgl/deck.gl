# shaderlib

A set of reuseable shader functions that can be imported individually
using `glslify`. Sometimes accompanied by javascript code that can be
used to calculate necessary parameters in app before using the shaders.

## Projections

### mercator-project

A web mercator projection, projects `pos` (_vec2(lng, lat)_) to
`zoom` (_float_) dependent "projected world" coordinates.


### mercator-project

A web mercator projection, projects vec2(lng, lat) to
coordinates within a viewport.
