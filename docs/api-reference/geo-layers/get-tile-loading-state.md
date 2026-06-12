# getTileLoadingState

Get detailed loading state for tiles in a TileLayer's viewport.

```typescript
import {getTileLoadingState} from '@deck.gl/geo-layers';
import type {TileLoadingState} from '@deck.gl/geo-layers';
```

## Usage

```typescript
import {Deck} from '@deck.gl/core';
import {TileLayer, getTileLoadingState} from '@deck.gl/geo-layers';

const tileLayer = new TileLayer({
  data: 'https://tile.example.com/tiles/{z}/{x}/{y}.json',
  getTileData: async ({index, id, bbox}) => {
    const response = await fetch(getURLFromTemplate(id, index));
    if (!response.ok) throw new Error('Tile not found');
    return await response.json();
  },
  renderSubLayers: props => {
    return new ScatterplotLayer(props);
  }
});

// Check detailed loading state
const state = getTileLoadingState(tileLayer);

console.log(`${state.loaded}/${state.total} tiles loaded`);
console.log(`${state.failed} tiles failed`);
console.log(`${state.percentLoaded}% complete`);

if (state.isComplete && !state.isSuccess) {
  console.warn('Some tiles failed to load');
}
```

## Parameters

### `layer` (TileLayer)

A TileLayer instance to inspect.

## Returns

`TileLoadingState` object with the following properties:

- **`total`** (`number`): Total number of tiles in the current viewport
- **`loaded`** (`number`): Number of tiles that loaded successfully (with content)
- **`failed`** (`number`): Number of tiles that failed to load (404, network error, etc.)
- **`pending`** (`number`): Number of tiles still loading
- **`percentLoaded`** (`number`): Percentage of successfully loaded tiles (0-100)
- **`isComplete`** (`boolean`): True if all tile requests are settled (loaded or failed)
- **`isSuccess`** (`boolean`): True if all tiles loaded successfully (no failures)

## Understanding layer.isLoaded vs getTileLoadingState

deck.gl's `layer.isLoaded` property returns `true` once all tile requests are "settled" (completed or failed). This is **intentional** to prevent waiting forever for tiles that will never load (404s, network errors, missing tiles, etc.).

From the source code comments:

> "Error / empty tiles resolve to `content === null`. Once Tile2DHeader marks those requests as loaded, do not wait for generated sublayers because there is nothing to render for that tile and `tile.layers` will remain null."

### When to use each

**Use `layer.isLoaded`** when you want to know:
- Are all tile requests complete? (boolean)
- Is the layer ready to render?
- Should I wait or proceed with what's available?

**Use `getTileLoadingState()`** when you need:
- How many tiles loaded vs failed? (granular counts)
- Progress percentage for a loading indicator
- To distinguish between "loading", "loaded successfully", and "loaded with errors"
- To show error states in the UI

## Examples

### Progress Bar

```typescript
function ProgressBar({tileLayer}) {
  const state = getTileLoadingState(tileLayer);
  
  return (
    <div className="progress-bar">
      <div className="progress" style={{width: `${state.percentLoaded}%`}} />
      <span>{state.loaded}/{state.total} tiles loaded</span>
      {state.failed > 0 && (
        <span className="error">{state.failed} failed</span>
      )}
    </div>
  );
}
```

### Wait for Complete Load

```typescript
// Wait for all tiles to load successfully
async function waitForTiles(layer: TileLayer): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = () => {
      const state = getTileLoadingState(layer);
      
      if (!state.isComplete) {
        // Still loading, check again
        requestAnimationFrame(check);
        return;
      }
      
      if (state.isSuccess) {
        resolve();
      } else {
        reject(new Error(`${state.failed} tiles failed to load`));
      }
    };
    
    check();
  });
}
```

### Video Export

```typescript
// For video export, you might want to proceed even if some tiles failed
async function captureFrame(deck: Deck): Promise<void> {
  const tileLayers = deck.props.layers.filter(l => l instanceof TileLayer);
  
  // Check if all tile requests are settled (loaded or failed)
  const allSettled = tileLayers.every(layer => {
    const state = getTileLoadingState(layer);
    return state.isComplete;
  });
  
  if (!allSettled) {
    // Wait for tiles to finish loading or failing
    await new Promise(resolve => setTimeout(resolve, 100));
    return captureFrame(deck);
  }
  
  // Proceed with frame capture (may have missing tiles)
  const canvas = deck.canvas as HTMLCanvasElement;
  const imageData = canvas.toDataURL('image/png');
  
  // Log any failures
  tileLayers.forEach(layer => {
    const state = getTileLoadingState(layer);
    if (state.failed > 0) {
      console.warn(`Layer ${layer.id}: ${state.failed} tiles failed`);
    }
  });
}
```

### Error Recovery

```typescript
function TileLayerWithRetry({...props}) {
  const [retryCount, setRetryCount] = useState(0);
  const layerRef = useRef<TileLayer>(null);
  
  useEffect(() => {
    if (!layerRef.current) return;
    
    const state = getTileLoadingState(layerRef.current);
    
    if (state.isComplete && !state.isSuccess && retryCount < 3) {
      console.log(`${state.failed} tiles failed, retrying...`);
      setRetryCount(retryCount + 1);
      // Trigger layer update to retry failed tiles
      layerRef.current.setNeedsUpdate();
    }
  }, [retryCount]);
  
  return <TileLayer ref={layerRef} {...props} />;
}
```

## Source

[modules/geo-layers/src/tile-layer/get-tile-loading-state.ts](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/tile-layer/get-tile-loading-state.ts)
