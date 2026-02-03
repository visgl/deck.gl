# OrthographicView Rotation Example

This example demonstrates the rotation feature of `OrthographicView`.

## Controls

- **Drag**: Pan the view
- **Ctrl/Cmd + Drag**: Rotate the view
- **Scroll**: Zoom in/out
- **Buttons**: Rotate left/right, reset, or set specific angle

## Usage

```js
import {Deck, OrthographicView} from '@deck.gl/core';

const deck = new Deck({
  views: new OrthographicView({
    controller: {dragRotate: true}
  }),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 0,
    rotationOrbit: 0  // Initial rotation angle in degrees
  }
});

// Access the controller for programmatic rotation control
const controller = deck.viewManager.controllers['default-view'];

// Rotate by delta angle
controller.rotate(45);        // Rotate 45 degrees clockwise
controller.rotateLeft(15);    // Rotate 15 degrees counter-clockwise
controller.rotateRight(15);   // Rotate 15 degrees clockwise

// Set absolute rotation
controller.setRotation(90);   // Set rotation to 90 degrees

// Get current rotation
const angle = controller.getRotation();
```

## Running

```bash
npm install
npm start
```
