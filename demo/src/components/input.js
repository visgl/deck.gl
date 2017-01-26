import React, {Component} from 'react';
import pureRender from 'pure-render-decorator';

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
