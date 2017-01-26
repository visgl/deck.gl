import React, {Component} from 'react';
import {connect} from 'react-redux';

import {toggleMenu, setHeaderOpacity} from '../actions/app-actions';
import Header from './header';

import '../stylesheets/main.scss';

class App extends Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.props.setHeaderOpacity(1);
      this.props.toggleMenu(false);
    }
  }

  render() {
    const {children, isMenuOpen, headerOpacity} = this.props;

    return (
      <div>
        <Header
          isMenuOpen={isMenuOpen}
          toggleMenu={this.props.toggleMenu}
          opacity={headerOpacity} />
        {children}
      </div>
    );
  }
}

export default connect(
  state => state.app,
  {toggleMenu, setHeaderOpacity}
)(App);
