import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';

const ITEM_HEIGHT = 40;
const INDENT_BASE = 16;
const INDENT_INC = 12;

const getContentHeight = (page) =>
  page.children ?
    page.children.reduce((height, child) => height + getContentHeight(child), ITEM_HEIGHT) :
    ITEM_HEIGHT;

export default class TableOfContents extends Component {

  _renderPage(parentRoute, page, i) {
    const {children, name, expanded} = page;
    const path = `${parentRoute}/${page.path}`;
    const indent = INDENT_BASE + page.depth * INDENT_INC;

    if (children && page.depth === 0) {
      const maxHeight = getContentHeight(page) - ITEM_HEIGHT;

      return (
        <div key={`page-${i}`}>
          <NavLink className={`list-header ${expanded ? 'expanded' : ''}`}
            activeClassName="active" key={`group-header${i}`} to={path}>
            {name}
          </NavLink>
          <div className="subpages" style={{maxHeight}}>
            <ul key={`group-list${i}`} >
              {children.map(this._renderPage.bind(this, path))}
            </ul>
          </div>
        </div>
      );
    }

    if (children) {
      return (
        <div key={`page-${i}`}>
          <h4 style={{paddingLeft: indent}}>{name}</h4>
          <ul key={`group-list${i}`} >
            {children.map(this._renderPage.bind(this, path))}
          </ul>
        </div>
      );
    }

    const tag = page.tag && <span className="badge">{page.tag}</span>;

    if (page.external) {
      // is external link
      return (
        <li key={`page-${i}`}>
          <a className="link" style={{paddingLeft: indent}} href={page.external} target="_blank" >{page.name}</a>
          {tag}
        </li>
      );
    }

    return (
      <li key={`page-${i}`}>
        <NavLink className="link" style={{paddingLeft: indent}} to={path} activeClassName="active">{page.name}</NavLink>
        {tag}
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
