import React, {Component, createRef} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'website-examples/election/app';

import makeExample from '../components/example';

class GoogleMapsDemo extends Component {
  static title = 'US Presidential Election 2000-2016';
  
  static code = `${GITHUB_TREE}/examples/website/election`;

  static data = {
    url: `${DATA_URI}/election.txt`,
    worker: '/workers/election-data-decoder.js'
  };

  static parameters = {
    year: {displayName: 'Year', type: 'range', value: 2016, step: 4, min: 2000, max: 2016}
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>How each county voted in historic presidencial elections.</p>

        <div className="layout">
          <div className="legend"
            style={{
              background: 'linear-gradient(90deg, rgb(43,131,186) 0%, rgb(255,255,191) 50%, rgb(215,25,28) 100%)',
              width: '100%'
            }} />
        </div>
        <p className="layout">
          <span className="col-1-2">100% Democrat</span>
          <span className="col-1-2 text-right">100% Republican</span>
        </p>

        <p>Data source: <a href="https://www.fec.gov/">Federal Election Commission</a></p>
      </div>
    );
  }

  _containerRef = createRef();

  componentDidMount() {
    const {data, params} = this.props;
    renderToDOM(this._containerRef.current, {
      data,
      year: params.year.value
    }).then(instance => (this._view = instance));
  }

  componentDidUpdate() {
    if (this._view) {
      const {data, params} = this.props;
      this._view.update({
        data,
        year: params.year.value
      })
    }
  }

  componentWillUnmount() {
    if (this._view) {
      this._view.remove();
    }
  }

  render() {
    return <div ref={this._containerRef} style={{width: '100%', height: '100%'}} />;
  }
}

export default makeExample(GoogleMapsDemo);
