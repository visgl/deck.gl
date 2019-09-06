/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, OrthographicView, ScatterplotLayer, PolygonLayer} from 'deck.gl';

import DataGenerator from './data-generator';

class Root extends Component {
  constructor(props) {
    super(props);

    this._dataGenerator = new DataGenerator();

    this.state = {
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons,
      viewState: {
        target: [0, 0, 0],
        zoom: 0
      }
    };

    this._randomize = this._randomize.bind(this);
  }

  _randomize() {
    this._dataGenerator.randomize();
    this.setState({
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons
    });
  }

  render() {
    const {points, polygons, viewState} = this.state;

    const layers = [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: points,
        getPosition: d => d.position,
        getFillColor: d => d.color,
        getRadius: d => d.radius,
        transitions: {
          getPosition: 600,
          getRadius: 600,
          getFillColor: {
            duration: 600,
            enter: ([r, g, b]) => [r, g, b, 0]
          }
        }
      }),
      new PolygonLayer({
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: polygons,
        stroked: true,
        filled: true,
        getPolygon: d => d.polygon,
        getLineColor: d => d.color,
        getFillColor: d => [d.color[0], d.color[1], d.color[2], 128],
        getLineWidth: d => d.width,
        transitions: {
          getPolygon: 600,
          getLineColor: {
            duration: 600,
            enter: ([r, g, b]) => [r, g, b, 0]
          },
          getFillColor: {
            duration: 600,
            enter: ([r, g, b]) => [r, g, b, 0]
          },
          getLineWidth: 600
        }
      })
    ];

    return (
      <div>
        <DeckGL
          views={new OrthographicView()}
          controller={true}
          viewState={viewState}
          onViewStateChange={evt => this.setState({viewState: evt.viewState})}
          layers={layers}
        />
        <div id="control-panel">
          <button onClick={this._randomize}>Randomize</button>
        </div>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
