import test from 'tape-catch';

test('@deck.gl/jupyter-widget Transport', t => {
  let transportModule;
  try {
    transportModule = require('@deck.gl/jupyter-widget/transport');
  } catch (error) {
    t.comment('dist mode, skipping binary-transport tests');
    t.end();
    return;
  }

  t.test('delayed onInitialized()', t0 => {
    const transport = new transportModule.Transport();

    transport._initialize();

    transport.setCallbacks({
      onIntialize: () => t0.end()
    });
  });

  t.end();
});
