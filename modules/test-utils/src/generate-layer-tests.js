// Automatically generate testLayer test cases
export function generateLayerTests(t, {Layer, sampleProps = {}, assert = () => {}}) {
  t.ok(Layer.layerName, 'Layer should have display name');

  const logTitle = title => () => t.comment(`${Layer.layerName}#${title}`);
  const validate = params => {
    if (params.layer.isComposite) {
      t.ok(params.subLayers.length, 'Layer has sublayers');
    } else {
      t.ok(params.layer.getModels().length, 'Layer has models');
    }
    // User callback
    assert(params);
  };

  const testCases = [
    {
      assertBefore: logTitle('Empty props'),
      props: {}
    },
    {
      assertBefore: logTitle('Null data'),
      updateProps: {data: null}
    },
    {
      assertBefore: logTitle('Sample data'),
      updateProps: sampleProps,
      assert: validate
    }
  ];

  try {
    // Calling constructor for the first time resolves default props
    // eslint-disable-next-line
    new Layer({});
  } catch (error) {
    t.fail(`Error constructing ${Layer.layerName}: ${error.message}`);
  }

  const {_propTypes: propTypes, _mergedDefaultProps: defaultProps} = Layer;

  // Test alternative data formats
  for (const {title, props} of makeAltDataTestCases(sampleProps, propTypes)) {
    testCases.push({
      assertBefore: logTitle(title),
      updateProps: props,
      assert: validate
    });
  }

  for (const propName in Layer.defaultProps) {
    if (!(propName in sampleProps)) {
      // Do not override user provided props - they may be layer-specific
      const newTestCase = makeAltPropTestCase(propName, propTypes, defaultProps);
      if (newTestCase) {
        testCases.push({
          assertBefore: logTitle(newTestCase.title),
          updateProps: newTestCase.props,
          assert: validate
        });
      }
    }
  }

  return testCases;
}

function makeAltPropTestCase(propName, propTypes, defaultProps) {
  const newProps = {};
  const propDef = propTypes[propName];
  let title;

  if (!propDef) {
    return null;
  }

  switch (propDef.type) {
    case 'boolean':
      newProps[propName] = !defaultProps[propName];
      title = String(newProps[propName]);
      break;

    case 'number':
      if ('max' in propDef) {
        newProps[propName] = propDef.max;
      } else if ('min' in propDef) {
        newProps[propName] = propDef.min;
      } else {
        newProps[propName] = defaultProps[propName] + 1;
      }
      title = String(newProps[propName]);
      break;

    case 'accessor':
      if (typeof defaultProps[propName] === 'function') {
        return null;
      }
      newProps[propName] = () => defaultProps[propName];
      newProps.updateTriggers = {
        [propName]: propName
      };
      title = `() => ${defaultProps[propName]}`;
      break;

    default:
      return null;
  }
  return {title: `${propName}: ${title}`, props: newProps};
}

function makeAltDataTestCases(props, propTypes) {
  const originalData = props.data;
  if (!Array.isArray(originalData)) {
    return [];
  }
  // data should support any iterable
  const genIterableProps = {
    data: new Set(originalData)
  };
  // data in non-iterable form
  const nonIterableProps = {
    data: {
      length: originalData.length
    }
  };
  for (const propName in props) {
    if (propTypes[propName].type === 'accessor') {
      nonIterableProps[propName] = (_, {index}) => props[propName](originalData[index]);
    }
  }

  return [
    {
      title: 'Generic iterable data',
      props: genIterableProps
    },
    {
      title: 'non-iterable data',
      props: nonIterableProps
    }
  ];
}
