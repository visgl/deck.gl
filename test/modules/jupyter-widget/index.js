try {
  require('./binary-transport.spec');
  require('./create-deck.spec');
  require('./index.spec');
  require('./widget-tooltip.spec');
  require('./utils/google-maps-utils.spec');
} catch (err) {
  // eslint-disable-next-line no-console,no-undef
  console.log('Skipping browser tests');
}
