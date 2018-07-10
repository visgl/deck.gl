import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router';

import {examplePages, showcasePages, docPages} from '../../contents/pages';
import {toggleMenu, setHeaderOpacity} from '../actions/app-actions';
import Header from './header';

import Home from './home';
import Gallery from './gallery';

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

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/examples" >
            {(props) => <Gallery {...props} pages={examplePages} />}
          </Route>
          <Route path="/showcases" >
            {(props) => <Gallery {...props} pages={showcasePages} />}
          </Route>
          <Route path="/documentation" >
            {(props) => <Gallery {...props} pages={docPages} />}
          </Route>
          <Redirect to="/" />
        </Switch>
      </div>
    );
  }
}

export default connect(
  state => state.app,
  {toggleMenu, setHeaderOpacity}
)(App);
