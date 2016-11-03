/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

function renderExampleButtons({examples, activeExamples, onChange}) {
  const children = [];
  for (const exampleName of Object.keys(examples)) {
    children.push(
      <div key={ exampleName } className="checkbox"
          style={{pointerEvents: 'auto'}}>
        <input
          type="checkbox"
          id={exampleName}
          name="layerStatus"
          value={exampleName || ''}
          checked={activeExamples[exampleName] || ''}
          onChange={e => onChange(exampleName)}
        />
        <label htmlFor={ exampleName } style={{display: 'inline-block'}}>
          <div style={{marginLeft: 30, whiteSpace: 'nowrap'}}>
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

function renderExampleCategories({examples, activeExamples, onChange}) {
  const children = [];
  for (const categoryName of Object.keys(examples)) {
    const category = examples[categoryName];
    children.push(
      <div key={categoryName}>
        { categoryName }
        { renderExampleButtons({examples: category, activeExamples, onChange}) }
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
      bottom: 20,
      right: 0,
      zIndex: 98
    }}>
      <div style={ {
        padding: 0,
        width: 270,
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll'
      } }>
      {
        renderExampleCategories({examples, activeExamples, onChange})
      }
      </div>
    </div>
  );
}
