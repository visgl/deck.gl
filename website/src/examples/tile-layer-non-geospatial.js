/* global requestAnimationFrame */
import React, {Component} from 'react';
import styled from 'styled-components';
import {GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App from 'website-examples/image-tile/app';

import {makeExample} from '../components';

const ImageTileDemoContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000;
`;

class ImageTileDemo extends Component {
  static title = 'LROC WAC Mosaic of the Lunar Nearside';

  static code = `${GITHUB_TREE}/examples/website/image-tile`;

  static parameters = {
    autoHighlight: {displayName: 'Highlight tile on hover', type: 'checkbox', value: false}
  };

  static renderInfo(meta) {
    return (
      <div>
        <p>
          Data source:
          <a href="http://lroc.sese.asu.edu/posts/293">NASA/GSFC/Arizona State University</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Tiles Loaded
            <b>{readableInteger(meta.tileCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  _onTilesLoad = tiles => {
    // onViewportLoad is called during tileLayer.updateState
    // Updating React state here may trigger another round of layer updates and create a racing condition
    // TODO - Fix this in TileLayer
    requestAnimationFrame(() => this.props.onStateChange({tileCount: tiles.length}));
  };

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <ImageTileDemoContainer>
        <App
          {...otherProps}
          autoHighlight={params.autoHighlight.value}
          onTilesLoad={this._onTilesLoad}
        />
      </ImageTileDemoContainer>
    );
  }
}

export default makeExample(ImageTileDemo);
