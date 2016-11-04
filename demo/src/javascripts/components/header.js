import 'babel-polyfill';
import React, {Component} from 'react';
import {Link} from 'react-router';

export default class Header extends Component {

  render() {
    return (
      <header>
        <div className="container">
          <div className="links">
            <Link activeClassName="active" to="examples">Examples</Link>
            <Link activeClassName="active" to="layers">Layers</Link>
            <Link activeClassName="active" to="documentation">Documentation</Link>
          </div>
          <a className="logo" href="#">deck.gl</a>
        </div>
      </header>
    );
  }
}
