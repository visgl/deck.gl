import {IJupyterWidgetRegistry} from '@jupyter-widgets/base';

import {DeckGLModel, DeckGLView} from './widget';

import {MODULE_NAME, MODULE_VERSION} from './version';

const EXTENSION_ID = 'deckgl-widget:plugin';

const DeckGLPlugin = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default DeckGLPlugin;

/**
 * Registers the widget with the Jupyter notebook
 */
function activateWidgetExtension(app, registry) {
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: {
      DeckGLModel,
      DeckGLView
    }
  });
}
