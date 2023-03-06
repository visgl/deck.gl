import React, {Component} from 'react';
import styled from 'styled-components';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/icon/app';

import {makeExample} from '../components';

const IconDemoContainer = styled.div`
  .tooltip {
    h5 {
      font-size: 1.1em;
      margin: 8px 0 0;
    }
    p {
      display: none;
      text-indent: 4px;
    }
  }
  .tooltip.interactive {
    border: solid 4px transparent;
    margin: -4px;
    background: #ffffff;
    color: #19202c;
    pointer-events: all;
    width: 240px;
    max-height: 320px;
    overflow-y: auto;

    p {
      display: block;
    }
  }
`;

class IconDemo extends Component {
  static title = 'Meteorites Landings';

  static data = {
    url: `${DATA_URI}/meteorites.txt`,
    worker: '/workers/meteorites-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/icon`;

  static parameters = {
    cluster: {displayName: 'Cluster', type: 'checkbox', value: true}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Data set from The Meteoritical Society showing information on all of the known meteorite
          landings.
        </p>
        <p>Hover on a pin to see the list of names</p>
        <p>Click on a pin to see the details</p>
        <p>
          Data source:
          <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh"> NASA</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Meteorites
            <b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;

    return (
      <IconDemoContainer>
        <App
          {...otherProps}
          data={data}
          iconAtlas={`${DATA_URI}/../examples/icon/location-icon-atlas.png`}
          iconMapping={`${DATA_URI}/../examples/icon/location-icon-mapping.json`}
          showCluster={params.cluster.value}
        />
      </IconDemoContainer>
    );
  }
}

export default makeExample(IconDemo);
