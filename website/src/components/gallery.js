import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router';

import Page from './page';
import TableOfContents from './table-of-contents';

function getDefaultPath(pages) {
  const path = [];
  let page;
  while (pages) {
    page = pages[0];
    pages = page.children;
    path.push(page.path);
  }
  return path.join('/');
}

function renderRoutes(pages, parentPath) {
  const defaultPath = `${parentPath}/${getDefaultPath(pages)}`;
  const results = [
    <Redirect key="redirect" exact from={parentPath} to={defaultPath} />
  ];

  pages.forEach((page, i) => {
    const {children, content} = page;
    const path = `${parentPath}/${page.path}`;

    if (children) {
      results.push(renderRoutes(children, path))
    } else {
      results.push(
        <Route key={i} path={path}>
          {props => <Page {...props} content={content} />}
        </Route>
      );
    }
  });

  return results;
}

class Gallery extends Component {

  render() {
    const {children, match: {path}, pages, isMenuOpen} = this.props;

    return (
      <div className="gallery-wrapper">
        <div className="fullheight">
          <div className="flexbox--row">
            <div className="flexbox-item" style={{zIndex: 1}}>
              <TableOfContents parentRoute={path} pages={pages} isOpen={isMenuOpen} />
            </div>
            <div className={'flexbox-item flexbox-item--fill'}>
              
              <Switch>
                {renderRoutes(pages, path)}
              </Switch>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.app)(Gallery);
