# @deck.gl/extensions

Layer extensions are bonus features that you can optionally add to the core deck.gl layers. These features are not included in the layers by default because one or more of the following reasons:

- They do not work consistently for all layers, but still valuable for some;
- While they optimize for specific use cases, there is an unnecessary performance overhead for users who don't need them;
- Once separated from the core layer code, they can be tree shaken. Applications can have smaller bundle sizes by only including the features they need.

This module contains the following extensions:

- [BrushingExtension](/docs/api-reference/extensions/brushing-extension.md)
- [DataFilterExtension](/docs/api-reference/extensions/data-filter-extension.md)
- [Fp64Extension](/docs/api-reference/extensions/fp64-extension.md)

For instructions on authoring your own layer extensions, visit [developer guide](/docs/developer-guide/custom-layers/layer-extensions.md).


## Installation

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {DataFilterExtension} from '@deck.gl/extensions';
new DataFilterExtension({});
```

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^7.0.0/dist.min.js"></script>
```

```js
new deck.DataFilterExtension({});
```
