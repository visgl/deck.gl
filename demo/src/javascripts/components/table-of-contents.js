import 'babel-polyfill';
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router'

export default class TableOfContents extends Component {

  _renderPage(parentRoute, page, i) {
    const {children, name} = page;
    const path = `${parentRoute}/${page.path}`;

    if (children) {
      return [
        (
          <Link className="list-header" activeClassName="active"
              key={`group-header${i}`} to={path}>
            { name }
          </Link>
        ), (
          <ul key={`group-list${i}`} style={{maxHeight: `${40 * children.length}px`}}>
            { children.map(this._renderPage.bind(this, path)) }
          </ul>
        )
      ];
    }
    return (
      <li key={`page-${i}`}>
        <Link className="link" to={ path } activeClassName="active">{ page.name }</Link>
      </li>
    );
  }

  render() {
    const {pages, parentRoute, isOpen} = this.props;

    return (
      <div className={`toc ${isOpen ? 'open' : ''}`}>
        <div>
          { pages.map(this._renderPage.bind(this, parentRoute)) }
        </div>
      </div>
    )
  }
}

TableOfContents.propTypes = {
  isOpen: PropTypes.bool,
  parentRoute: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired
};
