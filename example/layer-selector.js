/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

function renderExampleButtons({examples, activeExamples, onChange}) {
  const children = [];
  for (const exampleName of Object.keys(examples)) {
    const example = examples[exampleName];
    children.push(
      <div key={ exampleName } className="checkbox"
          style={{pointerEvents: 'auto'}}>
        <input
          type="checkbox"
          id={ exampleName }
          name="layerStatus"
          value={ exampleName }
          checked={ activeExamples[exampleName] }
          onChange={ e => onChange(exampleName) }
        />
        <label htmlFor={ exampleName } style={{display: 'inline-block'}}>
          <div style={{marginLeft: 30}}>
            { exampleName }
          </div>
        </label>
        <span>
        </span>
      </div>
    );
  }
  return children;
}

export default function LayerSelector({examples, activeExamples, onChange}) {
  return (
    <div id="example-selector" style={{
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 98
    }}>
      <div style={ {
        padding: 0,
        width: 400,
        height: 500,
        overflowX: 'hidden',
        overflowY: 'scroll'
      } }>
      {
        renderExampleButtons({examples, activeExamples, onChange})
      }
      </div>
    </div>
  );
}
