/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, ScatterplotLayer, PolygonLayer} from 'deck.gl';

import DataGenerator from './data-generator';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAP_CENTER = [-122.45, 37.78];
const VIEW_STATE = {
  longitude: MAP_CENTER[0],
  latitude: MAP_CENTER[1],
  zoom: 10
};

function diffGeometries(oldData, newData) {
  let start = newData.length;
  let end = -1;
  for (let i = 0; i < newData.length; i++) {
    if (oldData[i] !== newData[i]) {
      start = i < start ? i : start;
      end = i;
    }
  }
  return [{startRow: start, endRow: end + 1}];
}

class Root extends Component {
  constructor(props) {
    super(props);

    this._dataGenerator = new DataGenerator({countRange: [1000, 1000]});

    this.deckRef = React.createRef();

    this.state = {
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons,
      dragPolygonIndex: -1,
      dragStartPosition: null
    };

    this._onDragPolygonStart = this._onDragPolygonStart.bind(this);
    this._onDragPolygon = this._onDragPolygon.bind(this);
    this._onDragPolygonEnd = this._onDragPolygonEnd.bind(this);
  }

  _updateGeometries(offset) {
    const {originalPolygons, originalPoints, dragPolygonIndex} = this.state;

    const viewport = this.deckRef.current.deck.getViewports()[0];
    offset[0] *= viewport.distanceScales.metersPerPixel[0];
    offset[1] *= viewport.distanceScales.metersPerPixel[1];

    const newPolygons = originalPolygons.map((obj, i) => {
      if (i === dragPolygonIndex) {
        obj = Object.assign({}, obj, {
          polygon: obj.polygon.map(p => [p[0] + offset[0], p[1] + offset[1]])
        });
      }
      return obj;
    });
    const newPoints = originalPoints.map(obj => {
      if (obj.polygonIndex === dragPolygonIndex) {
        obj = Object.assign({}, obj, {
          position: [obj.position[0] + offset[0], obj.position[1] + offset[1]]
        });
      }
      return obj;
    });
    return {
      points: newPoints,
      polygons: newPolygons
    };
  }

  _onDragPolygonStart(info) {
    if (info.index >= 0) {
      this.setState({
        dragPolygonIndex: info.index,
        originalPolygons: this.state.polygons,
        originalPoints: this.state.points
      });
    }
  }
  _onDragPolygon(info, event) {
    this.setState(this._updateGeometries([event.deltaX, event.deltaY]));
  }
  _onDragPolygonEnd(info, event) {
    this.setState({
      ...this._updateGeometries([event.deltaX, event.deltaY]),
      dragPolygonIndex: -1,
      originalPolygons: null,
      originalPoints: null
    });
  }

  render() {
    const {points, polygons, dragPolygonIndex} = this.state;
    const isDragging = dragPolygonIndex >= 0;

    const layers = [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: MAP_CENTER,
        data: points,
        _dataDiff: isDragging ? diffGeometries : null,

        getPosition: d => d.position,
        getFillColor: d => (isDragging ? [255, 200, 0] : d.color),
        getRadius: d => d.radius
      }),
      new PolygonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: MAP_CENTER,
        data: polygons,
        _dataDiff: isDragging ? diffGeometries : null,
        stroked: true,
        filled: true,
        getPolygon: d => d.polygon,
        getLineColor: d => (isDragging ? [255, 200, 0] : d.color),
        getFillColor: d =>
          isDragging ? [255, 200, 0, 128] : [d.color[0], d.color[1], d.color[2], 128],
        getLineWidth: d => d.width,

        pickable: true,
        onDragStart: this._onDragPolygonStart,
        onDrag: this._onDragPolygon,
        onDragEnd: this._onDragPolygonEnd
      })
    ];

    return <DeckGL ref={this.deckRef} controller={false} viewState={VIEW_STATE} layers={layers} />;
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
