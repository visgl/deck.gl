# onAfterRender and hasActiveTransitions Enhancements

Enhanced APIs for detecting when deck.gl rendering is complete and the scene is "settled" - useful for frame capture, screenshots, and video export.

## onAfterRender Enhancement

The `onAfterRender` callback now includes a `pass` parameter to distinguish between different render passes.

### Usage

```typescript
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  onAfterRender: ({device, gl, pass}) => {
    console.log('Render complete:', pass);
    
    if (pass === 'screen') {
      // Main render to screen - safe to capture frame
      captureFrame(gl);
    }
    // pass === 'picking' for mouse picking renders
    // pass === 'shadow' for shadow map renders (if using shadows)
  }
});
```

### Parameters

**`context.device`** (`Device`): The luma.gl device

**`context.gl`** (`WebGL2RenderingContext`): The WebGL context

**`context.pass`** (`string`): The render pass type:
- `'screen'` - Main render to the canvas
- `'picking'` - Render for mouse picking (when layers are pickable)
- `'shadow'` - Shadow map render (when using ShadowEffect)
- Other custom pass types from effects

### Why This Matters

Before this enhancement, `onAfterRender` was called for all render passes without distinction. This made it difficult to:
- Capture frames only from screen renders (not picking passes)
- Distinguish between productive renders and internal renders
- Implement efficient frame capture for video export

**Example: Avoid Capturing Picking Passes**

```typescript
let framesCaptured = 0;

const deck = new Deck({
  onAfterRender: ({gl, pass}) => {
    // Only capture screen renders, not picking passes
    if (pass === 'screen') {
      captureFrame(gl);
      framesCaptured++;
    }
  }
});
```

## hasActiveTransitions Method

New method to check if any viewport or layer uniform transitions are active.

### Usage

```typescript
const hasTransitions = deck.hasActiveTransitions();

if (!hasTransitions) {
  // Scene is settled - safe to capture
  captureFrame();
}
```

### Returns

`boolean` - `true` if any transitions are active, `false` if the scene is settled.

### Detects

- **Layer uniform transitions**: Animated property changes (opacity, radius, etc.)
- **Viewport transitions**: Camera movement animations

### Why This Matters

When capturing frames for video export or screenshots, you want to wait for:
1. All layers to finish loading (`layer.isLoaded`)
2. All transitions to complete (`!deck.hasActiveTransitions()`)
3. Current frame to render (`onAfterRender`)

This method provides the missing piece for detecting transition state.

## Complete Frame Capture Example

```typescript
import {Deck} from '@deck.gl/core';

/**
 * Wait for deck.gl to be ready for frame capture:
 * - All layers loaded
 * - No active transitions
 * - Screen render complete
 */
async function waitForFrameReady(deck: Deck): Promise<void> {
  return new Promise(resolve => {
    // Check if ready
    function check() {
      const layers = deck.props.layers || [];
      const allLayersLoaded = layers.every(
        layer => !layer || (!Array.isArray(layer) && layer.isLoaded)
      );

      if (!allLayersLoaded) {
        // Still loading data
        requestAnimationFrame(check);
        return;
      }

      if (deck.hasActiveTransitions()) {
        // Animations in progress
        requestAnimationFrame(check);
        return;
      }

      // Wait for next screen render
      const cleanup = () => {
        deck.setProps({onAfterRender: originalCallback});
      };

      const originalCallback = deck.props.onAfterRender;
      deck.setProps({
        onAfterRender: ({pass, ...rest}) => {
          if (pass === 'screen') {
            cleanup();
            originalCallback?.(rest as any);
            resolve();
          }
        }
      });

      // Trigger render if needed
      deck.redraw();
    }

    check();
  });
}

// Usage
async function captureVideo(deck: Deck, frames: number) {
  for (let i = 0; i < frames; i++) {
    // Update scene (timeline position, camera, etc.)
    updateScene(i);

    // Wait for frame to be ready
    await waitForFrameReady(deck);

    // Capture
    const canvas = deck.canvas as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/png');
    saveFrame(imageData, i);
  }
}
```

## Video Export Pattern

```typescript
class VideoExporter {
  private deck: Deck;
  private encoder: VideoEncoder;
  private frameCount = 0;

  async captureFrame(): Promise<void> {
    // Wait for layers to load
    const layers = this.deck.props.layers || [];
    const allLoaded = layers.every(l => !l || l.isLoaded);
    if (!allLoaded) {
      await this.waitForLoad();
    }

    // Wait for transitions
    if (this.deck.hasActiveTransitions()) {
      await this.waitForTransitions();
    }

    // Capture on next screen render
    return new Promise(resolve => {
      const originalCallback = this.deck.props.onAfterRender;
      this.deck.setProps({
        onAfterRender: ({device, gl, pass}) => {
          if (pass === 'screen') {
            this.deck.setProps({onAfterRender: originalCallback});
            this.captureToEncoder(gl);
            this.frameCount++;
            resolve();
          }
          originalCallback?.({device, gl, pass});
        }
      });
      this.deck.redraw();
    });
  }

  private async waitForTransitions(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.deck.hasActiveTransitions()) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  private captureToEncoder(gl: WebGL2RenderingContext): void {
    const canvas = this.deck.canvas as HTMLCanvasElement;
    const frame = new VideoFrame(canvas, {timestamp: this.frameCount * 33333});
    this.encoder.encode(frame);
    frame.close();
  }
}
```

## Testing Frame Capture

```typescript
import {test, expect} from 'vitest';

test('Frame capture waits for transitions', async () => {
  const deck = new Deck({
    layers: [
      new ScatterplotLayer({
        opacity: 1,
        transitions: {opacity: 1000}
      })
    ]
  });

  // Trigger transition
  deck.setProps({
    layers: [
      new ScatterplotLayer({
        opacity: 0.5,
        transitions: {opacity: 1000}
      })
    ]
  });

  await new Promise(resolve => setTimeout(resolve, 50));
  expect(deck.hasActiveTransitions()).toBe(true);

  // Wait for settled
  await waitForFrameReady(deck);
  expect(deck.hasActiveTransitions()).toBe(false);
});
```

## Migration from onFrameComplete

If you were using a custom `onFrameComplete` callback, migrate to this pattern:

**Before (custom callback):**
```typescript
deck.setProps({
  onFrameComplete: ({layersRendered}) => {
    if (layersRendered > 0) {
      captureFrame();
    }
  }
});
```

**After (enhanced onAfterRender):**
```typescript
deck.setProps({
  onAfterRender: ({pass}) => {
    if (pass === 'screen' && !deck.hasActiveTransitions()) {
      const layers = deck.props.layers || [];
      const allLoaded = layers.every(l => !l || l.isLoaded);
      if (allLoaded) {
        captureFrame();
      }
    }
  }
});
```

## Related

- [waitForFrameReady utility](./wait-for-frame-ready.md) - Higher-level utility that combines these checks
- [Video Export Guide](../../developer-guide/video-export.md) - Complete video export tutorial
- [onAfterRender API](./deck.md#onafterrender) - Full API reference

