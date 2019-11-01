import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';

import {FRAMEWORK_NAME, FRAMEWORK_GITHUB_URL} from '../../contents/framework';
import FRAMEWORK_LINKS from '../../contents/links';

export default class Header extends Component {

  _renderLinks() {
    const links = Object.keys(FRAMEWORK_LINKS).filter(name => name !== FRAMEWORK_NAME);
    return (
      <div className="site-links">
        <div className="site-link" key={FRAMEWORK_NAME}>
          <a href="#">{FRAMEWORK_NAME}</a>
        </div>
        {
          links.map(name =>
            <div className="site-link" key={name}>
              <a href={FRAMEWORK_LINKS[name]}>{name}</a>
            </div>
          )
        }
      </div>
    );
  }

  render() {
    const {isMenuOpen, toggleMenu} = this.props;

    return (
      <header className={isMenuOpen ? 'open' : ''}>
        <div className="bg" />
        <div className="container stretch">
          <a className="logo" href="#">
            {FRAMEWORK_NAME}
          </a>
          { this._renderLinks() }
          <div className="menu-toggle" onClick={ () => toggleMenu(!isMenuOpen) }>
            <i className={`icon icon-${isMenuOpen ? 'close' : 'menu'}`} />
          </div>
          <div className="links">
            <NavLink activeClassName="active" to="/examples">Examples</NavLink>
            <NavLink activeClassName="active" to="/showcases">Showcases</NavLink>
            <NavLink activeClassName="active" to="/documentation">Documentation</NavLink>
            <a href="https://medium.com/vis-gl">Blog</a>
            <a href={FRAMEWORK_GITHUB_URL}>
              Github<i className="icon icon-github" />
            </a>
          </div>
        </div>
      </header>
    );
  }
}
