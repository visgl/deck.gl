import React from 'react';

function renderExampleButtons({examples, activeExamples, onChange}) {
  const children = [];
  for (const exampleName of Object.keys(examples)) {
    children.push(
      <div key={ exampleName } className="checkbox" >
        <input
          type="checkbox"
          id={exampleName}
          name="layerStatus"
          value={exampleName || ''}
          checked={activeExamples[exampleName] || ''}
          onChange={e => onChange(exampleName)}
        />
        <label htmlFor={ exampleName } >
          <span>{ exampleName }</span>
        </label>
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
        <h4>{ categoryName }</h4>
        { renderExampleButtons({examples: category, activeExamples, onChange}) }
      </div>
    );
  }
  return children;
}

export default function LayerSelector({examples, activeExamples, onChange}) {
  return (
    <div id="layer-selector" >
      {
        renderExampleCategories({examples, activeExamples, onChange})
      }
    </div>
  );
}
