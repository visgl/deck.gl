import React, {PureComponent} from 'react';

export default class InfoPanel extends PureComponent {
  render() {
    const { name, controls, sourceLink} = this.props;

    return (
      <div className="top-right options-panel" tabIndex="0">
        <h3>{name}</h3>
        <div className="control-panel" />
        {this.props.children}

        {sourceLink && (
          <div className="source-link">
            <a href={sourceLink} target="_new">
              {'View Code ↗'}
            </a>
          </div>
        )}
      </div>
    );
  }
}
