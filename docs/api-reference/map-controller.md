# MapController

The `MapController` class can be passed to the `Deck.controller` or `View.controller` prop to specify that map interaction should be enabled.

`MapController` is the default controller for `MapView`.

## Usage

Use with the default view:

```jsx
import DeckGL, {MapController} from 'deck.gl';

<DeckGL
controller={{type: MapController, dragRotate: false}}
viewState={viewState}
onViewportChange={v => this.setState({viewport: v})}
/>
```

Use with multiple views:

```jsx
import DeckGL, {MapView} from 'deck.gl';

<DeckGL
views={[
  new MapView({
    controller: {doubleClickZoom: false}
  })
]}
viewState={viewState}
onViewportChange={v => this.setState({viewport: v})}
/>
```

## Options

- `scrollZoom` (`Boolean`) - enable zooming with mouse wheel. Default `true`
- `dragPan` (`Boolean`) - enable panning with pointer drag. Default `true`
- `dragRotate` (`Boolean`) - enable rotating with pointer drag. Default `true`
- `doubleClickZoom` (`Boolean`) - enable zooming with double click. Default `true`
- `touchZoom` (`Boolean`) - enable zooming with multi-touch. Default `true`
- `touchRotate` (`Boolean`) - enable rotating with multi-touch. Default `false`
- `keyboard` (`Boolean`) - enable interaction with keyboard. Default `true`


## Methods

Note that the `MapController` class should not be instantiated by the application.
