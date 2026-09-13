# JSONConfiguration

A `JSONConfiguration` is created from a single plain object. The same object shape is also accepted by `JSONConfiguration.merge()` and `JSONConverter`'s `configuration` and `mergeConfiguration()` props.

## Fields

* `classes` - a map of classes available to the JSON class resolver. In deck.gl this is typically `Layer` and `View` classes.
* `functions` - a map of functions available to the JSON function resolver.
* `enumerations` - a map of enumerations available to the JSON string resolver.
* `constants` - a map of constants available to the JSON string resolver.
* `reactComponents` - a map of React components available to the JSON class resolver.
* `React` - injected React runtime used when resolving `reactComponents`.
* `typeKey` - override for the class discriminator key. Defaults to `@@type`.
* `functionKey` - override for the function discriminator key. Defaults to `@@function`.
* `convertFunction` - hook for converting `@@=` accessor strings into executable functions.
* `preProcessClassProps` - hook that receives a resolved class/component and its props before instantiation.
* `postProcessConvertedJson` - hook that receives the fully converted result before it is returned.

## Example

```js
import {JSONConfiguration} from '@deck.gl/json';
import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const configuration = new JSONConfiguration({
  classes: {MapView, ScatterplotLayer},
  functions: {
    scaleRadius: ({value}) => value * 2
  },
  postProcessConvertedJson: json => ({
    ...json,
    layers: (json.layers || []).filter(Boolean)
  })
});
```

See more details in the `Configuration Reference` section.
