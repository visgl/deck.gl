require('@babel/register')({
  presets: [
    [
      '@babel/env',
      {
        targets: {node: '14'}
      }
    ]
  ]
});

require('./index');
