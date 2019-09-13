import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {View} from '@deck.gl/core';

export default class DeckWithMaps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // NOTE: viewState is re-initialized from jsonProps when those change,
      // but can be updated independently by the user "panning".
      viewState: props.initialViewState
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialViewState !== prevProps.initialViewState) {
      this.setState({viewState: this.props.initialViewState});
    }
  }

  _onViewStateChange({viewState}) {
    // TODO - It would be cool to update the viewState here!
    this.setState({viewState});
  }

  render() {
    const {viewState} = this.state;
    const {views = []} = this.props;

    const maps = [];
    for (const view of views) {
      if (view.props.map || view.props.mapStyle) {
        maps.push(
          <View id={view.props.id} key={view.props.id}>
            <this.props.Map
              reuseMap
              mapStyle={view.props.mapStyle}
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
        onViewStateChange={this._onViewStateChange}
      >
        {maps}
      </DeckGL>
    );
  }
}
