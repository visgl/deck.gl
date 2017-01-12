import React, {PureComponent} from 'react';

export default class LayerSelector extends PureComponent {

  _renderExampleButton(exampleName, example) {
    const {activeExamples, onChange} = this.props;

    return (
      <div key={ exampleName } className="checkbox" >
        <input
          type="checkbox"
          id={exampleName}
          name="layerStatus"
          checked={activeExamples[exampleName] || ''}
          onChange={e => onChange(exampleName)}
        />
        <label htmlFor={ exampleName } >
          <span>{ exampleName }</span>
        </label>
      </div>
    );
  }

  _renderExampleCategories(examples) {
    return Object.keys(examples).map(categoryName => {
      const category = examples[categoryName];
      return (
        <div key={categoryName}>
          <h4>{ categoryName }</h4>
          {
            Object.keys(category)
              .map(exampleName => this._renderExampleButton(exampleName, category[exampleName]))
          }
        </div>
      );
    });
  }

  render() {
    return (
      <div id="layer-selector" >
        {
          this._renderExampleCategories(this.props.examples)
        }
      </div>
    );
  }
}
