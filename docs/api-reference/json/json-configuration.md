
# JSONConfiguration

Object with the following fields.

* `classes` - a map of general classes that should be made available to the JSON class resolver. (In the case of deck.gl, this would typically be `Layer` and `View` classes).
* `functions` - a map of functions that should be made available to the JSON function resolver.
* `enumerations` - a map of enumerations that should be made available to the JSON string resolver.
* `constants` - A map of constants that should be made available to the JSON string resolver.

> * `reactComponents` - a map of general react components that should be made available to the JSON class resolver.
> React support is experimental. The React dependency has to be injected via the configuration

See more details in the `Configuration Reference` section.
