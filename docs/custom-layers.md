# Creating Custom Layers

## Build Concerns

You need to decide how to organize your shader code. If you decide to use
the [glslify](https://github.com/stackgl/glslify) tool you will need to
install that module and add the required transform or plugin to your
application build process.

### Writing the Shaders

#### Supporting Map Coordinates

While you  have the freedom to create any type of layer you want,
with any type of coordinate system that suits your application, a common
characteristic of the layers provided by deck.gl is that they work seamlessly
as map overlays, both with positions specified as longitude and latitude
coordinates, as well as with positions specified in meters.

Deck.gl makes it easy to make your own layers work this way too. You just need
to import the project package in your shader file and the functions will be
made available to your shader.


#### Defining your vertex attributes.

- Will you support altitude?
- Do you need 64 bit support?
- Do you want to opt in to deck.gl's lighting system?
