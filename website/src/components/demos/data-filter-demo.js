import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import App from 'website-examples/data-filter/app';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, BaseProvider} from 'baseui';

const engine = new Styletron();

export default class DataFilterDemo extends Component {
  static get data() {
    return {
      url: `${DATA_URI}/earthquakes.txt`,
      worker: 'workers/earthquakes-decoder.js'
    };
  }

  static get parameters() {
    return {};
  }

  static get mapStyle() {
    return MAPBOX_STYLES.LIGHT;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>40 Years of Earthquakes</h3>
        <p>
          Earthquakes of manitude 4.5 and above
          <br />
          (1979 - 2019)
        </p>
        <p>
          Data source:
          <a href="https://earthquake.usgs.gov"> U.S. Geological Survey</a>
        </p>
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,85,170,1) 67%, rgba(0,200,255,1) 100%)',
            width: '100%',
            height: 8
          }}
        />
        <p className="layout">
          <span className="col-1-2">Shallow</span>
          <span className="col-1-2 text-right">Deep</span>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Earthquakes
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {data, ...otherProps} = this.props;
    // renders the data filter demo app wrapped in necessary BaseUI and Styletron providers
    return (
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <App data={data} {...otherProps} />
        </BaseProvider>
      </StyletronProvider>
    );
  }
}
