# View State Transitions

View state transitions provide smooth and visually appealing transitions when ViewState change from one state to the other. Transitions are supported using `Deck's` `viewState` prop.

Following fields of `viewState` can be used to achieve viewport transitions.

* `transitionDuration` (Number|String, optional, default: 0) - Transition duration in milliseconds, default value 0, implies no transition.
When using `FlyToInterpolator`, it can also be set to `'auto'` where actual duration is auto calculated based on start and end viewports and is linear to the distance between them. This duration can be further customized using `speed` parameter to `FlyToInterpolator` constructor.
* `transitionEasing` (Function, optional, default: `t => t`) - Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. (list of sample easing functions: <http://easings.net/>)
* `transitionInterpolator` (Object, optional, default: `LinearInterpolator`) - An interpolator object that defines the transition behavior between two viewports, deck.gl provides `LinearInterpolator` and `FlyToInterpolator`. Default value, `LinearInterpolator`, performs linear interpolation on `ViewState` fields. `FlyToInterpolator` animates `ViewStates` similar to MapBox `flyTo` API and applicable for `MapState`, this is pretty useful when camera center changes by long distance. But a user can provide any custom implementation for this object using `TrasitionInterpolator` base class.    
* `transitionInterruption` (TRANSITION_EVENTS (Number), optional, default: BREAK) - This field controls how to process a new `ViewState` change that occurs while performing an existing transition. This field has no impact once transition is complete. Here is the list of all possible values with resulting behavior.

| TRANSITION_EVENTS | Result |
| ---------------   | ------ |
| BREAK             | Current transition will stop at the current state and next `ViewState` update is processed. |
| SNAP_TO_END       | Current transition will skip remaining transition steps and `ViewState` is updated to final value, transition is stopped and next `ViewState` update is processed. |
| IGNORE            | Any `ViewState` update is ignored until current transition is complete, this also includes `ViewState` changes due to user interaction. |

* `onTransitionStart` (Functional, optional) - Callback fires when requested transition starts.
* `onTransitionInterrupt` (Functional, optional) - Callback fires when transition is interrupted.
* `onTransitionEnd` (Functional, optional) - Callback fires when transition ends.


## Usage

Sample code that provides `flyTo` style transition to move camera from current location to NewYork city.

```js
import DeckGL, {FlyToInterpolator} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: {
        latitude: 37.7751,
        longitude: -122.4193,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500
      }
    };
    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _goToNYC() {
    this.setState({
      viewState: {
        ...this.state.viewState,
        longitude: -74.1,
        latitude: 40.7,
        zoom: 14,
        pitch: 0,
        bearing: 0,
        transitionDuration: 8000,
        transitionInterpolator: new FlyToInterpolator()
      }
    });
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const {viewState} = this.state;

    return (
      <div>
        <DeckGL
          viewState={viewState}
          controller={MapController}
          onViewStateChange={this._onViewStateChange}
        >
          <StaticMap
            // props
            ...
          />
        </DeckGL>

        <button onClick={this._goToNYC}>New York City</button>
      </div>
    );
  }
}
```

Sample code to get continuous rotations along vertical axis until user interrupts by rotating the map by mouse interaction. It uses `LinearInterpolator` and restricts transitions for `bearing` prop. Continuous transitions are achieved by triggering new transitions using `onTranstionEnd` callback.

```js
import DeckGL from 'deck.gl';
import {StaticMap} from 'react-map-gl';

const transitionInterpolator = new LinearInterpolator(['bearing']);

const INITIAL_VIEW_STATE = {
  // set to required initial view state
...
};

class App extends Component {
  constructor(props) {
    super(props);
    this.rotationStep = 0;
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };

    this._onLoad = this._onLoad.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);
  }

  _onLoad() {
    this._rotateCamera();
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _rotateCamera() {
    // change bearing by 120 degrees.
    const bearing = this.state.viewState.bearing + 120;
    this.setState({
      viewState: {
        ...this.state.viewState,
        bearing,
        transitionDuration: 1000,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _renderLayers() {
    // render any deck.gl layers
    ...
  }

  render() {
    const {viewState} = this.state;
    return (
      <DeckGL
        layers={this._renderLayers()}
        viewState={viewState}
        onLoad={this._onLoad}
        onViewStateChange={this._onViewStateChange}
        controller={true}
      >
        <StaticMap
          // props
          ...
        />
      </DeckGL>
    );
  }
}
```


## TransitionInterpolator

Base interpolator class that provides common functionality required to interpolate between two ViewState props. This class can be subclassed to implement any custom interpolation.

### Constructor

Parameters:

* opts (Object | Array) -

Object with following fields
* compare: prop names used in equality check.
* extract: prop names needed for interpolation.
* required: prop names that must be supplied.

* Array of prop names that are used for all above fields.

### Methods

#### arePropsEqual

Parameters:

* currentProps: Object with ViewState props.
* nextProps: Object with ViewState props.

Returns:

* `true` if the ViewStates have equal value for all `compare` props.

#### initializeProps

Parameters:

* startProps (Object): Object with staring ViewState props.
* endProps (Object): Object with ending ViewState props.

Returns:

* {start, end}, transition props are validated and extracted from inputs and returned.

#### interpolateProps

* This method is not implemented, it must be implemented by subclasses.


## LinearInterpolator

Interpolator class, inherits from `TransitionInterpolator`. Performs linear interpolation between two ViewStates.

### Constructor

Parameters:

* transitionProps (Array, default: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch']): Array of props that are linearly interpolated.

#### interpolateProps

Parameters:

* startProps (Object): Object with staring ViewState props.
* endProps (Object): Object with ending ViewState props.
* t (Number) : Number in [0, 1] range.

Returns:

* Object with interpolated ViewState props.


## FlyToInterpolator

Interpolator class, inherits from `TransitionInterpolator`. This class is designed to perform `flyTo` style interpolation between two `MapState` objects.

### Constructor

Parameters:

* props (Object) -

Object with following fields
* `curve` (Number, optional, default: 1.414) - The zooming "curve" that will occur along the flight path.
* `speed` (Number, optional, default: 1.2) - The average speed of the animation defined in relation to `options.curve`, it linearly affects the duration, higher speed returns smaller durations and vice versa.
* `screenSpeed` (Number, optional) - The average speed of the animation measured in screenfuls per second. Similar to `opts.speed` it linearly affects the duration,  when specified `opts.speed` is ignored.
* `maxDuration` (Number, optional) - Maximum duration in milliseconds, if calculated duration exceeds this value, `0` is returned.

Initializes super class with an object with following props:

* compare: ['longitude', 'latitude', 'zoom', 'bearing', 'pitch']
* extract: ['width', 'height', 'longitude', 'latitude', 'zoom', 'bearing', 'pitch']
* required: ['width', 'height', 'latitude', 'longitude', 'zoom']

### Methods

#### interpolateProps

Parameters:

* startProps (Object): Object with staring ViewState props.
* endProps (Object): Object with ending ViewState props.
* t (Number) : Number in [0, 1] range.

Returns:

* Object with interpolated ViewState props.

#### getDuration

Parameters:

* startProps (Object): Object with staring ViewState props.
* endProps (Object): Object with ending ViewState props.

Returns:

* `transitionDuration` value in milliseconds.
