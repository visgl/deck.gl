/* global window */
import React, {Component, PropTypes} from 'react';
import autobind from 'autobind-decorator';

export default class Blog extends Component {

  componentWillReceiveProps(nextProps) {
    const {route} = nextProps;
    if (this.props.route !== route) {
    }
  }

  // redirect links to parent window
  @autobind _onPostLoaded(evt) {
    const doc = evt.target.contentDocument;
    const anchors = doc.getElementsByTagName('a');
    const pathname = window.location.pathname || '';
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const href = anchor.getAttribute('href');
      if (href.indexOf('/blog/') === 0) {
        anchor.href = `${pathname}#${href}`;
        anchor.target = '_parent';
      }
    }
  }

  render() {
    let {routeParams: {splat = 'index'}} = this.props;

    splat = splat.replace(/\.html$/, '');

    return (
      <div className="blog-page">
        <iframe src={`./blog/${splat}.html`} onLoad={ this._onPostLoaded } />
      </div>
    );
  }
}
