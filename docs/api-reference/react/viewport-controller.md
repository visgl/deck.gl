# ViewportController (React Component)

`ViewportController` is a React Component that wraps the deck.gl `Controls` class.


## Usage

```js
import DeckGL, {ViewportController, ScatterplotLayer} from 'deck.gl';

class App extends Component {

  render() {
    return (
      <ViewportController
        {...this.state.viewState}
        onViewportChange={viewState => this.setState({viewState})} >
        <DeckGL
          {...this.state.viewState}
          layers={[new ScatterplotLayer({data})]} />
      </ViewportController>
    );
  }
};
```

## Properties

### ViewState Properties

##### `width` (Number, required)

Width of the canvas.

##### `height` (Number, required)

Height of the canvas.

##### `latitude` (Number, optional)

Current latitude - used to define a mercator projection if `viewState` is not supplied.

##### `longitude` (Number, optional)

Current longitude - used to define a mercator projection if `viewState` is not supplied.

##### `zoom` (Number, optional)

Current zoom - used to define a mercator projection if `viewState` is not supplied.

##### `bearing` (Number, optional)

Current bearing - used to define a mercator projection if `viewState` is not supplied.

##### `pitch` (Number, optional)

Current pitch - used to define a mercator projection if `viewState` is not supplied.


### Configuration Properties

##### `controls` (Object)

A map control instance to replace the default map controls

The object must expose these methods:

* `setProps` - Update the props of the control.
* `finalize` - Called when the control is being removed.


### Event Callbacks

##### `onViewportChange` (Function)

`onViewportChange` callback is fired when the user interacted with the
map. The object passed to the callback contains viewport properties
such as `longitude`, `latitude`, `zoom` etc.

##### `getCursor` (Function, optional)

Accessor that returns a cursor style to show interactive state.


### Event Handling Options

##### `scrollZoom` (Boolean, optional)

* Default: `true`

Enable scroll to zoom.

##### `dragPan` (Boolean, optional)

* Default: `true`

Enable drag to pan.

##### `dragRotate` (Boolean, optional)

* Default: `true`

Enable drag to rotate.

##### `doubleClickZoom` (Boolean, optional)

* Default: `true`

Enable double click to zoom.

##### `touchZoom` (Boolean, optional)

* Default: `true`

Enable pinch to zoom (touch).

##### `touchRotate` (Boolean, optional)

* Default: `false`

Enable pinch to rotate.

##### `keyboard` (Boolean, optional)

* Default: `true`

Enable keyboard navigation.


### Viewport Constraints

##### `maxZoom` (Number, optional)

* Default: `20`

Max zoom level.

##### `minZoom` (Number, optional)

* Default: `0`

Min zoom level.

##### `maxPitch` (Number, optional)

* Default: `60`

Max pitch in degrees.

##### `minPitch` (Number, optional)

* Default: `0`

Min pitch in degrees.


## Source

[modules/react/src/viewport-controller.js](https://github.com/uber/deck.gl/blob/5.3-release/modules/react/src/viewport-controller.js)
