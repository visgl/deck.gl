# GeolocateWidget (Experimental)

Provides a text input and button for navigating to specific coordinates. Supports various coordinate formats including decimal degrees and degrees-minutes-seconds (DMS).

```ts
import {GeolocateWidget} from '@deck.gl/widgets';
```

## Usage

```ts
import {Deck} from '@deck.gl/core';
import {GeolocateWidget} from '@deck.gl/widgets';

const deck = new Deck({
  widgets: [
    new GeolocateWidget({
      transitionDuration: 1000,
      label: 'Go to Location'
    })
  ]
});
```

## Types

### `GeolocateWidgetProps` {#geolocatewidgetprops}

The `GeolocateWidget` accepts the generic [`WidgetProps`](../core/widget.md#props) and:

- `viewId` (string, optional) - The view to navigate when coordinates are entered
- `label` (string, default `'Geolocate'`) - Tooltip label for the widget
- `transitionDuration` (number, default `200`) - Duration of the view transition animation in milliseconds

## Supported Coordinate Formats

The widget accepts coordinates in various formats:

### Decimal Degrees
- `37.7749, -122.4194`
- `-122.4194, 37.7749`

### Degrees, Minutes, Seconds (DMS)
- `37°46'30"N, 122°25'10"W`
- `N37°46'30", W122°25'10"`

### Cardinal Direction Indicators
- `37.7749N, 122.4194W`
- `S33.8688, E151.2093`

## Behavior

- Enter coordinates in the text input field
- Press Enter or click "Go" to navigate to the location
- Invalid coordinate formats display an error message
- The widget automatically determines latitude/longitude order using heuristics:
  - Values > 90° absolute are assumed to be longitude
  - Otherwise, assumes latitude, longitude order
- Smooth transitions with configurable duration