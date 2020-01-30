import React, {Component} from 'react';
import InfoPanel from '../components/info-panel';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {loadData} from '../utils/data-utils';
import {readableInteger} from '../utils/format-utils';
import App from '../../../examples/website/data-filter/app';

export default class DataFilterDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      count: 0
    };
  }

  componentDidMount() {
    loadData(`${DATA_URI}/earthquakes.txt`, '/workers/earthquakes-decoder.js', (response, meta) => {
      this.setState({
        data: response,
        count: meta.count
      });
    });
  }

  render() {
    const {data, count} = this.state;

    return (
      <div>
        <App mapStyle={MAPBOX_STYLES.LIGHT} data={data} />
        <InfoPanel sourceLink={`${GITHUB_TREE}/${this.props.path}`}>
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
              <b>{readableInteger(count)}</b>
            </div>
          </div>
        </InfoPanel>
      </div>
    );
  }
}
