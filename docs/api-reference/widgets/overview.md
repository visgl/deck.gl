# @deck.gl/widgets

Widgets are UI components around the WebGL canvas to offer controls and information for a better user experience.

This module contains the following extensions:

- [FullscreenWidget](./fullscreen-widget.md)

## Installation

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/widgets
```

```js
import {FullscreenWidget} from '@deck.gl/widgets';
new FullscreenWidget({});
```

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.10.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.10.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/widgets@^8.10.0/dist.min.js"></script>
```

```js
new deck.FullscreenWidget({});
```