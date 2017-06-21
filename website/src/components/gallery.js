import React, {Component} from 'react';
import {connect} from 'react-redux';

import TableOfContents from './table-of-contents';

class Gallery extends Component {

  render() {
    const {children, route: {path, pages}, isMenuOpen} = this.props;

    return (
      <div className="gallery-wrapper">
        <div className="fullheight">
          <div className="flexbox--row">
            <div className="flexbox-item" style={{zIndex: 1}}>
              <TableOfContents parentRoute={path} pages={pages} isOpen={isMenuOpen} />
            </div>
            <div className={'flexbox-item flexbox-item--fill'}>
              { children }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.app)(Gallery);
