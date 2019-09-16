import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/geo-layers';

// To manage dependencies and bundle size, the app must decide which supporting loaders to bring in
import {DracoLoader, DracoWorkerLoader} from '@loaders.gl/draco';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYTExNWEwZC00MWFmLTRmNWUtOTA1Zi00OGUzMzlkMDVlNWQiLCJpZCI6NDQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJhc3NldHMiOlsyODk1N10sImlhdCI6MTU2ODM5OTgxNn0.Bqe4IWmT6etdZYqm12WcgdW52wDLzdbKM4Xx_8lRZmk';

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -75,
  pitch: 45,
  maxPitch: 60,
  bearing: 0,
  minZoom: 2,
  maxZoom: 30,
  zoom: 17
};

export class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      attributions: []
    };

    this._onTilesetLoad = this._onTilesetLoad.bind(this);
  }

  // Called by Tile3DLayer when a new tileset is loaded
  _onTilesetLoad(tileset) {
    this.setState({attributions: tileset.credits.attributions});
    this._centerViewOnTileset(tileset);
    if (this.props.updateAttributions) {
      this.props.updateAttributions(tileset.credits.attributions);
    }
  }

  // Recenter view to cover the new tileset, with a fly-to transition
  _centerViewOnTileset(tileset) {
    const {cartographicCenter, zoom} = tileset;
    this.setState({
      viewState: {
        ...this.state.viewState,

        // Update deck.gl viewState, moving the camera to the new tileset
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom,
        bearing: INITIAL_VIEW_STATE.bearing,
        pitch: INITIAL_VIEW_STATE.pitch
      }
    });
  }

  // Called by DeckGL when user interacts with the map
  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _renderTile3DLayer() {
    return new Tile3DLayer({
      id: 'tile-3d-layer',
      _ionAssetId: 28957,
      _ionAccessToken: ION_TOKEN,
      DracoWorkerLoader,
      DracoLoader,
      onTilesetLoad: this._onTilesetLoad
    });
  }

  render() {
    const {viewState} = this.state;
    const tile3DLayer = this._renderTile3DLayer();
    const {mapStyle = 'mapbox://styles/mapbox/dark-v9'} = this.props;

    return (
      <div>
        <DeckGL
          layers={[tile3DLayer]}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          onViewStateChange={this._onViewStateChange.bind(this)}
          controller={true}
        >
          <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_TOKEN} preventStyleDiffing />
        </DeckGL>
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
