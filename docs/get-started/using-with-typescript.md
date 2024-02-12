# Using deck.gl with TypeScript

Starting from v9.0, deck.gl publishes official TypeScript types for all modules. If TypeScript is enabled in your project, imports from deck.gl packages will include types. Examples:

```js
// Values and types.
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';

// Types only.
import type {DeckGLRef} from '@deck.gl/react';
import type {GeoJsonLayerProps} from '@deck.gl/layers';
```

Help us improve the types by reporting issues or sending suggestions on GitHub!

## Alternative Solution for deck.gl v8.x

Starting from v8.8, deck.gl publishes "public preview" TypeScript types via an opt-in only entry point. To use the official types in your application, find the following statements:

```js
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
```

and replace the package name with `@deck.gl/<module_name>/typed`:

```typescript
import DeckGL from '@deck.gl/react/typed';
import {GeoJsonLayer} from '@deck.gl/layers/typed';
```

You can also import additional type definitions:

```typescript
import type {DeckGLRef} from '@deck.gl/react/typed';
import type {GeoJsonLayerProps} from '@deck.gl/layers/typed';
```

Note that the typed exports are a work in progress. They are not exposed by default to prevent any typing errors from breaking existing TypeScript applications. Help us improve them by reporting any issues or suggestions on GitHub!

The typed exports will remain at the `typed` entry points throughout the rest of the 8.x releases. They will be exposed directly at the package roots starting in v9.0.


## Alternative Solution for Legacy Versions

If you are using a version before v8.8, a third-party typings library is available.

Find the compatible version of `@danmarshall/deckgl-typings` based on your `deck.gl` version:

| deck.gl version | deckgl-typings version |
| --------------- | ---------------------- |
| 5.x.x           | 1.x.x                  |
| 6.x.x           | 2.x.x                  |
| 7.x.x           | 3.x.x                  |
| 8.x.x           | 4.x.x                  |

For example, for `deck.gl` 7.x, install the following package:

```bash
npm install @danmarshall/deckgl-typings@^3.0.0
```

Create a new file like `deckgl.d.ts` in your source directory with the following code:

```typescript
import * as DeckTypings from "@danmarshall/deckgl-typings"
declare module "deck.gl" {
    export namespace DeckTypings {}
}
```
