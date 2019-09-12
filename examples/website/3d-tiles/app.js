import '@babel/polyfill';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {MapController, FlyToInterpolator} from '@deck.gl/core';
import {lumaStats} from '@luma.gl/core';
import {StatsWidget} from '@probe.gl/stats-widget';

// To manage dependencies and bundle size, the app must decide which supporting loaders to bring in
import {DracoLoader, DracoWorkerLoader} from '@loaders.gl/draco';

import {Tile3DLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxN2NhMzkwYi0zNWM4LTRjNTYtYWE3Mi1jMDAxYzhlOGVmNTAiLCJpZCI6OTYxOSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU2MjE4MTMxM30.OkgVr6NaKYxabUMIGqPOYFe0V5JifXLVLfpae63x-tA';

const TRANSITION_DURAITON = 4000;
const EXAMPLES_VIEWSTATE = {
  latitude: 40.04248558075302,
  longitude: -75.61213987669433
};

export const INITIAL_VIEW_STATE = {
  ...EXAMPLES_VIEWSTATE,
  pitch: 45,
  maxPitch: 60,
  bearing: 0,
  minZoom: 2,
  maxZoom: 30,
  zoom: 17
};

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // CURRENT VIEW POINT / CAMERA POSITIO
      viewState: INITIAL_VIEW_STATE,
      attributions: []
    };

    this._deckRef = null;
    this._onTilesetLoad = this._onTilesetLoad.bind(this);
    this._onTilesetChange = this._onTilesetChange.bind(this);
  }

  async componentDidMount() {
    const container = this._statsWidgetContainer;
    // TODO - This is noisy. Default formatters should already be pre-registered on the stats object
    // TODO - Revisit after upgrade luma to use most recent StatsWidget API
    this._memWidget = new StatsWidget(lumaStats.get('Memory Usage'), {
      framesPerUpdate: 1,
      formatters: {
        'GPU Memory': 'memory',
        'Buffer Memory': 'memory',
        'Renderbuffer Memory': 'memory',
        'Texture Memory': 'memory'
      },
      container
    });

    this._tilesetStatsWidget = new StatsWidget(null, {container});
  }

  // Updates stats, called every frame
  _updateStatWidgets() {
    this._memWidget.update();
    this._tilesetStatsWidget.update();
  }

  // Called by Tile3DLayer when a new tileset is loaded
  _onTilesetLoad(tileset) {
    this.setState({attributions: tileset.credits.attributions});
    this._tilesetStatsWidget.setStats(tileset.stats);
    this._centerViewOnTileset(tileset);
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
        zoom: zoom + 1.5, // TODO - remove adjustment when Tileset3D calculates correct zoom
        bearing: INITIAL_VIEW_STATE.bearing,
        pitch: INITIAL_VIEW_STATE.pitch,

        // Tells deck.gl to animate the camera move to the new tileset
        transitionDuration: TRANSITION_DURAITON,
        transitionInterpolator: new FlyToInterpolator()
      }
    });
  }

  // Called by Tile3DLayer whenever an individual tile in the current tileset is load or unload
  _onTilesetChange(tileHeader) {
    this._updateStatWidgets();
    this.forceUpdate();
  }

  // Called by DeckGL when user interacts with the map
  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _renderStats() {
    // TODO - too verbose, get more default styling from stats widget?
    return (
      <div
        style={{
          position: 'absolute',
          padding: 12,
          zIndex: '10000',
          maxWidth: 300,
          background: '#000',
          color: '#fff'
        }}
        ref={_ => (this._statsWidgetContainer = _)}
      />
    );
  }

  _renderTile3DLayer() {
    return new Tile3DLayer({
      id: 'tile-3d-layer',
      ionAssetId: 33301,
      ionAccessToken: ION_TOKEN,
      DracoWorkerLoader,
      DracoLoader,
      onTilesetLoad: this._onTilesetLoad,
      onTileLoad: this._onTilesetChange,
      onTileUnload: this._onTilesetChange,
      onTileLoadFail: this._onTilesetChange
    });
  }

  render() {
    const {viewState} = this.state;
    const tile3DLayer = this._renderTile3DLayer();
    const {mapStyle = 'mapbox://styles/mapbox/light-v9'} = this.props;

    return (
      <div>
        {this._renderStats()}
        <DeckGL
          ref={_ => (this._deckRef = _)}
          layers={[tile3DLayer]}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          onViewStateChange={this._onViewStateChange.bind(this)}
          controller={{type: MapController, maxPitch: 85}}
          onAfterRender={() => this._updateStatWidgets()}
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
