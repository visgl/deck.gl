# IconClusterLayer Globe Example

This example demonstrates the `IconClusterLayer` working on a globe projection with text-based cluster counts.

## Features Demonstrated

- **Globe View**: Uses `_GlobeView` for 3D globe rendering
- **Point Clustering**: Automatic clustering using Supercluster algorithm
- **Dynamic Text Labels**: Cluster counts rendered as text (e.g., "47", "152")
- **Globe-Aware Rendering**:
  - Text labels use billboard mode to face the camera
  - `depthTest: false` ensures visibility regardless of sphere curvature
- **Interactive Controls**:
  - Adjust cluster radius (20-200px)
  - Change point count (100-2000 points)
  - Modify cluster max zoom level (8-20)
- **Real-time Stats**: Shows current zoom level and visible point count

## Running the Example

```bash
# Install dependencies
yarn install

# Start the development server
yarn start
```

The example will open in your browser at `http://localhost:5173`

## Usage

1. **Zoom In/Out**: Use mouse wheel or pinch gesture to zoom
2. **Rotate Globe**: Click and drag to rotate the globe
3. **Click Clusters**: Click on cluster circles to see point details in console
4. **Adjust Settings**: Use the control panel to modify clustering behavior

## What to Observe

- **At Low Zoom**: Points cluster into large groups with high counts
- **At High Zoom**: Clusters break apart into smaller groups and individual points
- **Text Rendering**: Cluster counts are rendered as actual text, not icon sprites
- **Globe Curvature**: Text labels remain visible and face the camera even on the back side of the globe

## Implementation Notes

- Uses `Record<string, unknown>` type for data instead of generics
- Billboard text rendering ensures labels face the camera
- `depthTest: false` prevents z-fighting on curved surfaces
- Supercluster efficiently handles thousands of points
