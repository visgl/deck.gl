
# JSONConfiguration

Object with the following fields.

* `classes` - a map of general classes that should be made available to the JSON class resolver. (In the case of deck.gl, this would typically be `Layer` and `View` classes).
* `enumerations` - a map of enumerations that should be made available to the JSON string resolver.

> * `reactComponents` - a map of general react components that should be made available to the JSON class resolver.
> React support is experiemntal. The React dependency has to be injected via the configuration

See more details in the `Configuration Reference` section.