import 'babel-polyfill';
import React, {Component} from 'react';
import {toggleMenu, setHeaderOpacity} from '../actions/app-actions';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import Header from './header';
import stylesheet from '../constants/styles';

class App extends Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.props.setHeaderOpacity(1);
      this.props.toggleMenu(false);
    };
  }

  render() {
    const {children, isMenuOpen, headerOpacity, toggleMenu} = this.props;

    return (
      <div>
        <style>{ stylesheet }</style>
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} opacity={headerOpacity} />
        { children }
      </div>
    );
  }
}

export default connect(
  state => state.app,
  {toggleMenu, setHeaderOpacity}
)(App);
