import React, {PureComponent} from 'react';
import LayerControls from './layer-controls';

export default class LayerSelector extends PureComponent {
  _renderExampleButton(exampleName, example) {
    const {activeExamples} = this.props;
    const settings = activeExamples[exampleName];

    return (
      <div key={exampleName}>
        <div className="checkbox">
          <input
            type="checkbox"
            id={exampleName}
            checked={Boolean(settings)}
            onChange={() => this.props.onToggleLayer(exampleName, example)}
          />
          <label htmlFor={exampleName}>
            <span>{exampleName}</span>
          </label>
        </div>

        {settings && (
          <LayerControls
            settings={settings}
            propTypes={example.propTypes}
            onChange={this.props.onUpdateLayer.bind(this, exampleName)}
          />
        )}
      </div>
    );
  }

  _renderExampleCategories(examples) {
    return Object.keys(examples).map(categoryName => {
      const category = examples[categoryName];
      return (
        <div key={categoryName}>
          <h4>{categoryName}</h4>
          {Object.keys(category).map(exampleName =>
            this._renderExampleButton(exampleName, category[exampleName])
          )}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="layer-selector">{this._renderExampleCategories(this.props.examples)}</div>
    );
  }
}
