# Creating Layer Extensions

> It's recommended that you read [subclassing layers](/docs/developer-guide/custom-layers/subclassed-layers.md) before proceeding

Sometimes we need to modify several deck.gl layers to add similar functionalities. If we create custom layer classes for each one of them, it will require multiple files that contain more or less the same code. [Layer extension](/docs/api-reference/extensions/overview.md) is a way to generalize, reuse, and share subclassed layer code.

## Example: Subclassing Is Not Enough

Consider a hypothetical use case: in a `ScatterplotLayer`, we inject a piece of custom code into the fragment shader to highlight every object that is red.

```js
import {ScatterplotLayer} from '@deck.gl/layers';

class FilteredScatterplotLayer extends ScatterplotLayer {
  getShaders() {
    return {
      ...super.getShaders(),
      inject: {
        // Declare custom uniform
        'fs:#decl': 'uniform bool highlightRed;',
        // Standard injection hook - see "Writing Shaders"
        'fs:DECKGL_FILTER_COLOR': `
          if (highlightRed) {
            if (color.r / max(color.g, 0.001) > 2. && color.r / max(color.b, 0.001) > 2.) {
              // is red
              color = vec4(1.0, 0.0, 0.0, 1.0);
            } else {
              discard;
            }
          }
        `
      }
    };
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.highlightRed !== oldProps.highlightRed) {
      // Set the custom uniform
      this.state.model.setUniforms({
        highlightRed: props.highlightRed
      });
    }
  }
}

new FilteredScatterplotLayer({...});
```

If we want to do the same for `GeoJsonLayer`, it becomes more complicated. We will need to subclass all of `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`, then tell the `GeoJsonLayer` to use our custom classes:

```js
import {ScatterplotLayer, PathLayer, SolidPolygonLayer} from '@deck.gl/layers';

class FilteredScatterplotLayer extends ScatterplotLayer {
  // same code
}
class FilteredPathLayer extends PathLayer {
  // same code
}
class FilteredSolidPolygonLayer extends SolidPolygonLayer {
  // same code
}

new GeoJsonLayer({
  ...
  _subLayerProps: {
    points: {type: FilteredScatterplotLayer},
    linestrings: {type: FilteredPathLayer},
    'polygons-stroke': {type: FilteredPathLayer},
    'polygons-fill': {type: FilteredSolidPolygonLayer}
  }
});
```

We end up with copying and pasting a lot of code.

The same functionality can be achieved by creating a layer extension. When we give an extension to a composite layer such as `GeoJsonLayer`, it's automatically passed down to all its sublayers, including `ScatterplotLayer`, `PathLayer` and `SolidPolygonLayer`.

```js
import {LayerExtension} from '@deck.gl/core';

class RedFilter extends LayerExtension {
  // TODO - This is our reusable code
}

new GeoJsonLayer({
  ...
  extensions: [new RedFilter()]
});
```

Now we can implement the red filter once and only once in the custom extension, and use it everywhere!


## LayerExtension Interface

### Constructor

```js
class RedFilter extends LayerExtension {}

const extension = new RedFilter({color: [1, 1, 0]});
console.log(extension.opts);
```

The base layer extension constructor optionally takes one argument `opts` and stores it in `this.opts`. This object will be accessible to lifecycle methods via `extension.opts`. Additional properties can also be attached to the extension instance in the constructor for future use.

Note that if two extension instances are of the same class and have the same `opts` object, they are considered equal during layer updates. Creating a new extension instance with different options can potentially lead to the layers that use this extension to recompile their shaders, which may be an expensive operation. `opts` is generally only used for options that require shader updates.


### Methods

When a layer extension is used, it injects itself into a layer. This means that you can implement most of the [layer lifecycle methods](/docs/developer-guide/custom-layers/layer-lifecycle.md) as part of the extension, and they will be executed in addition to the layer's own.

##### `getShaders`

Called to retrieve the *additional* shader parameters. Returns an object that will be merged with the layer's own `getShaders` result before sending to luma.gl's [shader assembly](https://github.com/uber/luma.gl/blob/8.0-release/docs/api-reference/shadertools/assemble-shaders.md#assembleshaders). See [writing shaders](/docs/developer-guide/custom-layers/writing-shaders.md) for deck.gl-specific modules and hooks.

When this method is executed, `this` points to the layer.

Receives one argument:

* `extension` - the source extension instance.

##### `initializeState`

Called after the layer's own `initializeState`.

When this method is executed, `this` points to the layer.

Arguments:

* `context` - same context object passed to `layer.initializeState`.
* `extension` - the source extension instance.

##### `updateState`

Called after the layer's own `updateState`.

When this method is executed, `this` points to the layer.

Arguments:

* `params` - same object passed to `layer.updateState`.
* `extension` - the source extension instance.


##### `draw`

Called before the layer's own `draw`.

When this method is executed, `this` points to the layer.

Arguments:

* `params` - same object passed to `layer.draw`.
* `extension` - the source extension instance.


##### `finalizeState`

Called after the layer's own `finalizeState`.

When this method is executed, `this` points to the layer.

Arguments:

* `extension` - the source extension instance.

##### `getSubLayerProps`

Called by composite layers to retrieve the *additional* props that should be passed to its sublayers. Normally, a composite layer only passes through props that it recognizes. If an extension adds new props to a layer, then it is responsible of collecting these props by implementing this method.

Arguments:

* `extension` - the source extension instance.


## Example: Layer Extension

Back to our example use case. We can implement the red filter with the following code that works with all deck.gl layers:

```js
import {LayerExtension} from '@deck.gl/core';

class RedFilter extends LayerExtension {
  getShaders() {
    return {
      inject: {
        // Declare custom uniform
        'fs:#decl': 'uniform bool highlightRed;',
        // Standard injection hook - see "Writing Shaders"
        'fs:DECKGL_FILTER_COLOR': `
          if (highlightRed) {
            if (color.r / max(color.g, 0.001) > 2. && color.r / max(color.b, 0.001) > 2.) {
              // is red
              color = vec4(1.0, 0.0, 0.0, 1.0);
            } else {
              discard;
            }
          }
        `
      }
    };
  }

  updateState(params) {
    const {highlightRed = true} = params.props;
    for (const model of this.getModels()) {
      model.setUniforms({highlightRed});
    }
  }

  getSubLayerProps() {
    const {highlightRed = true} = params.props;
    return {
      highlightRed
    };
  }
}

new GeoJsonLayer({
  ...
  extensions: [new RedFilter()]
});
```

This example is on [codepen](https://codepen.io/vis-gl/pen/bXpNpK).
