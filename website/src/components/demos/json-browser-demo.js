import React, {Component} from 'react';
import {Parser} from 'expr-eval';
import autobind from 'autobind-decorator';
import {App} from 'website-examples/experimental/json-browser/app';

export default class JSONBrowserDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {};
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>JSON Browser</h3>
        <p>Enables deck.gl visualizations to be specified using JSON descriptions</p>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const {} = this.state;

    return (
      <App />
    );
  }
}
