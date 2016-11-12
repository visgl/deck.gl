import 'babel-polyfill';
import pureRender from 'pure-render-decorator';
import React, {Component} from 'react';

@pureRender
export default class GenericInput extends Component {

  render() {
    const {displayName, name, displayValue, onChange} = this.props;
    const props = {...this.props};
    delete props.displayName;
    delete props.displayValue;

    return (
      <div className="input">
        <label>{displayName}</label>
        <input
          {...props}
          value={displayValue}
          onChange={ e => onChange(name, e.target.value) }/>
      </div>
    );
  }
}
