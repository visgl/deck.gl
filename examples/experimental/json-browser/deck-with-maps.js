/* global window */
import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {View} from '@deck.gl/core';

// TODO - Can StaticMap handle this?
const MAPBOX_STYLESHEET = `https://api.tiles.mapbox.com/mapbox-gl-js/v0.47.0/mapbox-gl.css`;

// Helper function to set mapbox stylesheet (avoids need for index.html just to set styles)
function setStyleSheet(url) {
  /* global document */
  document.body.style.margin = '0px';
  const styles = document.createElement('link');
  styles.type = 'text/css';
  styles.rel = 'stylesheet';
  styles.href = url;
  document.head.appendChild(styles);
}

const defaultProps = {
  mapboxAccessToken: null,
  mapboxStyleSheet: MAPBOX_STYLESHEET
};

export default class DeckWithMaps extends Component {
  constructor(props) {
    super(props);

    setStyleSheet(props.mapboxStyleSheet);

    this.state = {
      // NOTE: viewState is re-initialized from jsonProps when those change,
      // but can be updated independently by the user "panning".
      viewState: null
    };
  }

  componentDidMount() {}

  _onViewStateChange({viewState}) {
    // TODO - It would be cool to update the viewState here!
    this.setState({viewState});
  }

  render() {
    const viewState = this.state.viewState || this.props.viewState || this.props.initialViewState;

    const {views = []} = this.props;

    const maps = [];
    for (const view of views) {
      if (view.props.map || view.props.mapStyle) {
        maps.push(
          <View id={view.props.id} key={view.props.id}>
            <this.props.StaticMap
              reuseMap
              mapStyle={view.props.mapStyle}
              style={{}}
              mapboxApiAccessToken={view.props.mapToken || this.props.mapboxApiAccessToken}
            />
          </View>
        );
      }
    }

    return (
      <DeckGL
        id="json-deck"
        {...this.props}
        viewState={viewState}
        onViewStateChange={this._onViewStateChange.bind(this)}
      >
        {maps}
      </DeckGL>
    );
  }
}

DeckWithMaps.defaultProps = defaultProps;
