# @deck.gl/react

This module integrates deck.gl with React. First-time deck.gl developers may find it helpful to read [Using deck.gl with React](https://deck.gl/next/docs/get-started/using-with-react.md) before getting started.

This module contains the following:

### React Components[​](#react-components "Direct link to React Components")

* [\<DeckGL/>](https://deck.gl/next/docs/api-reference/react/legacy/deckgl.md)
* Widgets in the [`@deck.gl/widgets`](https://deck.gl/next/docs/api-reference/widgets/overview.md) module are re-exported as React components in this module.
  <!-- -->
  * e.g. `import { ZoomWidget } from '@deck.gl/react';`

### React Hooks[​](#react-hooks "Direct link to React Hooks")

* [useWidget](https://deck.gl/next/docs/api-reference/react/legacy/use-widget.md)

## Installation[​](#installation "Direct link to Installation")

### Install from NPM[​](#install-from-npm "Direct link to Install from NPM")

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/react
```

```
import {DeckGL} from '@deck.gl/react';



<DeckGL initialViewState={{longitude: -122.45, latitude: 37.78, zoom: 12}}/>
```

### `@deck.gl/react/legacy`[​](#deckglreactlegacy "Direct link to deckglreactlegacy")

The same API is also exported from `@deck.gl/react/legacy`. In v10 the package root is planned to become a React renderer for deck.gl ([#11036](https://github.com/visgl/deck.gl/issues/11036)), and this API stays available at `@deck.gl/react/legacy`. To stay on this API after that change, import from `@deck.gl/react/legacy`:

```
import {DeckGL, ZoomWidget} from '@deck.gl/react/legacy';
```

## Using React-wrapped Widgets[​](#using-react-wrapped-widgets "Direct link to Using React-wrapped Widgets")

Here's a typical example of how to switch from using pure-js widgets in the [`@deck.gl/widgets`](https://deck.gl/next/docs/api-reference/widgets/overview.md) module to their React-equivalent:

```
-import { ZoomWidget } from '@deck.gl/widgets';

+import { ZoomWidget } from '@deck.gl/react';



-<DeckGL widgets={[new ZoomWidget()]}>

+<DeckGL>

+  <ZoomWidget/>

</DeckGL>
```

React props are passed to the widget:

```
-new ZoomWidget({ id: 'zoom', placement: 'top-right' })

+<ZoomWidget id='zoom' placement='top-right'/>
```
