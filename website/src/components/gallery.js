import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import Page from './page';
import TableOfContents from './table-of-contents';

function getDefaultPath(pages) {
  if (!pages || !pages.length) {
    return [];
  }
  const page = pages[0];
  return [page.path].concat(getDefaultPath(page.children));
}

// We can't use <Route> here because for viewport transition to work, <Page> cannot be unmounted
function findPage(pages, path) {
  const p = path.shift();
  const page = pages.find(page => page.path === p);

  if (!page) {
    return {redirect: getDefaultPath(pages)};
  }
  if (page.children) {
    const result = findPage(page.children, path);
    if (result.page) {
      return result;
    }
    return {redirect: [p].concat(result.redirect)};
  }
  if (path.length) {
    return {redirect: []};
  }
  return {page};
}

class Gallery extends Component {

  _renderPage() {
    const {match, history, location, pages} = this.props;
    const path = location.pathname.replace(match.path, '').split('/').filter(Boolean);
    const {page, redirect} = findPage(pages, path);

    if (redirect) {
      return <Redirect from="*" to={`${match.path}/${redirect.join('/')}`} />
    }

    return <Page history={history} location={location} content={page.content} />;
  }

  render() {
    const {match: {path}, pages, isMenuOpen} = this.props;

    return (
      <div className="gallery-wrapper">
        <div className="fullheight">
          <div className="flexbox--row">
            <div className="flexbox-item" style={{zIndex: 1}}>
              <TableOfContents parentRoute={path} pages={pages} isOpen={isMenuOpen} />
            </div>
            <div className={'flexbox-item flexbox-item--fill'}>
              
              {this._renderPage()}

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.app)(Gallery);
