import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

export default class TableOfContents extends Component {

  _renderPage(parentRoute, page, i) {
    const {children, name, expanded} = page;
    const path = `${parentRoute}/${page.path}`;

    if (children) {
      return (
        <div key={`page-${i}`}>
          <Link className={`list-header ${expanded ? 'expanded' : ''}`}
            activeClassName="active" key={`group-header${i}`} to={path}>
            {name}
          </Link>
          <div className="subpages" style={{maxHeight: `${40 * children.length}px`}}>
            <ul key={`group-list${i}`} >
              {children.map(this._renderPage.bind(this, path))}
            </ul>
          </div>
        </div>
      );
    }

    if (page.external) {
      // is external link
      return (
        <li key={`page-${i}`}>
          <a className="link" href={page.external} target="_blank" >{page.name}</a>
        </li>
      );
    }

    return (
      <li key={`page-${i}`}>
        <Link className="link" to={path} activeClassName="active">{page.name}</Link>
      </li>
    );
  }

  render() {
    const {pages, parentRoute, isOpen} = this.props;

    return (
      <div className={`toc ${isOpen ? 'open' : ''}`}>
        <div>
          {pages.map(this._renderPage.bind(this, parentRoute))}
        </div>
      </div>
    );
  }
}

TableOfContents.propTypes = {
  isOpen: PropTypes.bool,
  parentRoute: PropTypes.string.isRequired,
  pages: PropTypes.arrayOf(PropTypes.object).isRequired
};
