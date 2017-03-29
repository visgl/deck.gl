import React, {Component} from 'react';
import {connect} from 'react-redux';

import GenericInput from './input';
import * as Demos from './demos';
import {updateParam} from '../actions/app-actions';

class InfoPanel extends Component {

  render() {
    const {demo, hasFocus, onInteract, params, owner, meta} = this.props;
    const DemoComponent = Demos[demo];
    const metaLoaded = owner === demo ? meta : {};

    return (
      <div className={`options-panel top-right ${hasFocus ? 'focus' : ''}`} onClick={onInteract}>

        {DemoComponent.renderInfo(metaLoaded)}

        {Object.keys(params).length > 0 && <hr />}

        {Object.keys(params).map((name, i) => (
          <GenericInput key={i}
            name={name}
            {...params[name]}
            onChange={this.props.updateParam} />
        ))}

        {this.props.children}

      </div>
    );
  }
}

export default connect(state => state.vis, {updateParam})(InfoPanel);
