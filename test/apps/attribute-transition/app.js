/* global document console */
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
      transitionType: 'spring',
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons,
      viewState: {
        target: [0, 0, 0],
        zoom: 0
      }
    };

    this._randomize = this._randomize.bind(this);
    this._onChangeTransitionType = this._onChangeTransitionType.bind(this);
  }

  _randomize() {
    this._dataGenerator.randomize();
    this.setState({
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons
    });
  }

  _onChangeTransitionType({currentTarget}) {
    this.setState({
      transitionType: currentTarget.value
    });
  }

  render() {
    const {points, polygons, viewState} = this.state;

    const interpolationSettings = {
      duration: 600,
      onStart: () => {
        console.log('onStart');
      },
      onEnd: () => {
        console.log('onEnd');
      },
      onInterrupt: () => {
        console.log('onInterrupt');
      }
    };

    const springSettings = {
      type: 'spring',
      stiffness: 0.01,
      damping: 0.15,
      onStart: () => {
        console.log('onStart');
      },
      onEnd: () => {
        console.log('onEnd');
      },
      onInterrupt: () => {
        console.log('onInterrupt');
      }
    };

    const scatterplotTransitionsByType = {
      interpolation: {
        getPosition: Object.assign({}, interpolationSettings, {enter: () => [0, 0]}),
        getRadius: Object.assign({}, interpolationSettings, {enter: () => [0]}),
        getFillColor: Object.assign({}, interpolationSettings, {enter: ([r, g, b]) => [r, g, b, 0]})
      },
      spring: {
        getPosition: Object.assign({}, springSettings, {enter: () => [0, 0]}),
        getRadius: Object.assign({}, springSettings, {enter: () => [0]}),
        getFillColor: Object.assign({}, springSettings, {enter: ([r, g, b]) => [r, g, b, 0]})
      }
    };

    const polygonTransitionsByType = {
      interpolation: {
        getPolygon: 600,
        getLineColor: Object.assign({}, interpolationSettings, {
          enter: ([r, g, b]) => [r, g, b, 0]
        }),
        getFillColor: Object.assign({}, interpolationSettings, {
          enter: ([r, g, b]) => [r, g, b, 0]
        }),
        getLineWidth: 600
      },
      spring: {
        getPolygon: springSettings,
        getLineColor: Object.assign({}, springSettings, {enter: ([r, g, b]) => [r, g, b, 0]}),
        getFillColor: Object.assign({}, springSettings, {enter: ([r, g, b]) => [r, g, b, 0]}),
        getLineWidth: springSettings
      }
    };

    const layers = [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: points,
        getPosition: d => d.position,
        getFillColor: d => d.color,
        getRadius: d => d.radius,
        transitions: scatterplotTransitionsByType[this.state.transitionType]
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
        transitions: polygonTransitionsByType[this.state.transitionType]
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
          <select value={this.state.transitionType} onChange={this._onChangeTransitionType}>
            <option value="interpolation">Interpolation Transition</option>
            <option value="spring">Spring Transition</option>
          </select>
        </div>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
