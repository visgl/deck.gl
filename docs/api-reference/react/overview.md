# @deck.gl/react

This module integrates deck.gl with React. First-time deck.gl developers may find it helpful to read [Using deck.gl with React](../../get-started/using-with-react.md) before getting started.

This module contains the following:

### React Components

- [\<DeckGL/>](./deckgl.md)
- Widgets in the [`@deck.gl/widgets`](../widgets/overview.md) module are re-exported as React components in this module.
  - e.g. `import { ZoomWidget } from '@deck.gl/react';`

### React Hooks

- [useWidget](./use-widget.md)

## Installation

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/react
```

```jsx
import DeckGL from '@deck.gl/react';

<DeckGL/>
```

## Using React-wrapped Widgets

Here's a typical example of how to switch from using pure-js widgets in the [`@deck.gl/widgets`](../widgets/overview.md) module to their React-equivalent:

```diff
-import { ZoomWidget } from '@deck.gl/widgets';
+import { ZoomWidget } from '@deck.gl/react';

-<DeckGL widgets={[new ZoomWidget({})]}>
+<DeckGL>
+  <ZoomWidget/>
</DeckGL>
```

React props are passed to the widget:

```diff
-new ZoomWidget({ id: 'zoom', placement: 'top-right' })
+<ZoomWidget id='zoom' placement='top-right'/>
```

### Authoring Custom Widgets with React

Learn how author your own custom widgets in React with the `useWidget` hook by reading the [Custom Widget Developer Guide](../../developer-guide/custom-widgets/).
