# @deck.gl/extensions

Layer extensions are bonus features that you can optionally add to the core deck.gl layers. These features are not included in the layers by default because one or more of the following reasons:

* They do not work consistently for all layers, but still valuable for some;
* While they optimize for specific use cases, there is an unnecessary performance overhead for users who don't need them;
* Once separated from the core layer code, they can be tree shaken. Applications can have smaller bundle sizes by only including the features they need.

This module contains the following extensions:

* [BrushingExtension](https://deck.gl/docs/api-reference/extensions/brushing-extension.md)
* [ClipExtension](https://deck.gl/docs/api-reference/extensions/clip-extension.md)
* [CollisionFilterExtension](https://deck.gl/docs/api-reference/extensions/collision-filter-extension.md)
* [DataFilterExtension](https://deck.gl/docs/api-reference/extensions/data-filter-extension.md)
* [FillStyleExtension](https://deck.gl/docs/api-reference/extensions/fill-style-extension.md)
* [Fp64Extension](https://deck.gl/docs/api-reference/extensions/fp64-extension.md)
* [MaskExtension](https://deck.gl/docs/api-reference/extensions/mask-extension.md)
* [PathStyleExtension](https://deck.gl/docs/api-reference/extensions/path-style-extension.md)
* [TerrainExtension](https://deck.gl/docs/api-reference/extensions/terrain-extension.md)

For instructions on authoring your own layer extensions, visit [developer guide](https://deck.gl/docs/developer-guide/custom-layers/layer-extensions.md).

## Installation[​](#installation "Direct link to Installation")

### Install from NPM[​](#install-from-npm "Direct link to Install from NPM")

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```
import {DataFilterExtension} from '@deck.gl/extensions';

new DataFilterExtension({});
```

### Include the Standalone Bundle[​](#include-the-standalone-bundle "Direct link to Include the Standalone Bundle")

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```
new deck.DataFilterExtension({});
```
