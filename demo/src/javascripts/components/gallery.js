import 'babel-polyfill';
import React, {Component} from 'react';

import Header from './header';
import TableOfContents from './table-of-contents';
import stylesheet from '../constants/styles';

export default class Gallery extends Component {

  render() {
    const {children, route: {path, pages}} = this.props;

    return (
      <div className="gallery-wrapper">
        <style>{ stylesheet }</style>
        <Header />
        <div className="fullheight">
          <div className="flexbox--row">
            <div className="flexbox-item">
              <TableOfContents parentRoute={path} pages={pages} />
            </div>
            <div className={`flexbox-item flexbox-item--fill`}>
              { children }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
