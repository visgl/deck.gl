import React, {Component, createRef} from 'react';
import {DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {renderToDOM} from 'website-examples/safegraph/app';

import {makeExample} from '../components';

class MapboxDemo extends Component {
  static title = 'Who Is Visiting San Francisco?';

  static code = `${GITHUB_TREE}/examples/website/safegraph`;

  static data = {
    url: `${DATA_URI}/safegraph.txt`,
    worker: '/workers/poi-data-decoder.js'
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Visitors to San Francisco businesses, grouped by their home census block group, during the
          first week of Feb 2020.
        </p>
        <p>Click on a region to see where its visitors come from.</p>
        <p>
          Data source: <a href="https://docs.safegraph.com/docs/weekly-patterns">SafeGraph</a>
        </p>
      </div>
    );
  }

  _containerRef = createRef();

  componentDidMount() {
    /* global document */
    // Attach mapbox stylesheet
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', 'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css');
    document.head.appendChild(style);

    this._view = renderToDOM(this._containerRef.current, this.props.data);
  }

  componentDidUpdate(prevProps) {
    if (this.props.data && !prevProps.data) {
      this._view.update(this.props.data);
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

export default makeExample(MapboxDemo);
