"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var window,isBrowser;module.link('@deck.gl/core/utils/globals',{window(v){window=v},isBrowser(v){isBrowser=v}},1);var setPropOverrides,applyPropOverrides;module.link('@deck.gl/core/lib/seer-integration',{setPropOverrides(v){setPropOverrides=v},applyPropOverrides(v){applyPropOverrides=v}},2);




test('Seer overrides', t => {
  const props = {
    id: 'arc-layer',
    opacity: {data: {value: 0.4}},
    one: 1
  };

  if (isBrowser) {
    window.__SEER_INITIALIZED__ = false;

    setPropOverrides('arc-layer', ['opacity', 'data', 'value'], 0.5);
    applyPropOverrides(props);
    t.equal(props.opacity.data.value, 0.4, 'The value should not have been overriden');

    window.__SEER_INITIALIZED__ = true;

    setPropOverrides('arc-layer', ['opacity', 'data', 'value'], 0.5);
    applyPropOverrides(props);
    t.equal(props.opacity.data.value, 0.5, 'The value should now have been changed');
  }

  t.end();
});
