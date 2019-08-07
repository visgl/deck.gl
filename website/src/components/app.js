import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router';

import {examplePages, showcasePages, docPages} from '../../contents/pages';
import {toggleMenu} from '../actions/app-actions';
import Header from './header';

import Home from './home';
import Gallery from './gallery';

import '../stylesheets/main.scss';

class App extends Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      this.props.toggleMenu(false);
    }
  }

  render() {
    const {isMenuOpen} = this.props;

    return (
      <div>
        <Header isMenuOpen={isMenuOpen} toggleMenu={this.props.toggleMenu} />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/examples">{props => <Gallery {...props} pages={examplePages} />}</Route>
          <Route path="/showcases">{props => <Gallery {...props} pages={showcasePages} />}</Route>
          <Route path="/documentation">{props => <Gallery {...props} pages={docPages} />}</Route>
          <Redirect to="/" />
        </Switch>

        <a
          href="https://docs.google.com/forms/d/1wWtNqKs6ry9u0iuDjezFv6h7xZ40fEPzt0C_CMUOnBQ"
          target="_new"
          className="floater"
        >
          Take our developer survey
        </a>
      </div>
    );
  }
}

export default connect(
  state => state.app,
  {toggleMenu}
)(App);
