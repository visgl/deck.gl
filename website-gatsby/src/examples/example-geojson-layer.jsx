import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App, {COLOR_SCALE} from '../../../examples/website/geojson/app';

export default class GeoJSONDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      polygonCount: 0,
      vertexCount: 0
    };
  }

  componentDidMount() {
    loadData(
      `${DATA_URI}/vancouver-blocks.txt`,
      '/workers/geojson-data-decoder.js',
      (response, meta) => {
        this.setState({
          data: response,
          polygonCount: meta.count,
          vertexCount: meta.vertexCount
        });
      }
    );
  }

  render() {
    const {data, polygonCount, vertexCount} = this.state;

    const legends = COLOR_SCALE.domain();
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.LIGHT} data={data} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
          <h3>Vancouver Property Value</h3>
          <p>The property value of Vancouver, BC</p>
          <p>
            Height of polygons - average property value per square meter of lot
            <br />
            Color - value growth from last assessment
          </p>
          <div className="layout">
            {legends.map((l, i) => (
              <div
                key={i}
                className="legend"
                style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
              />
            ))}
          </div>
          <div className="layout">
            {legends.map(
              (l, i) =>
                i % 2 === 0 && (
                  <div key={i} style={{width}}>
                    {Math.round(l * 100)}%
                  </div>
                )
            )}
          </div>
          <p>
            Data source:&nbsp;
            <a href="http://data.vancouver.ca/">City of Vancouver</a>
          </p>
          <div className="layout">
            <div className="stat col-1-2">
              No. of Polygons<b>{readableInteger(polygonCount) || 0}</b>
            </div>
            <div className="stat col-1-2">
              No. of Vertices<b>{readableInteger(vertexCount || 0)}</b>
            </div>
          </div>
        </InfoPanel>
      </div>
    );
  }
}
