// import {Application, IPlugin} from '@phosphor/application';

// import {Widget} from '@phosphor/widgets';

import {IJupyterWidgetRegistry} from '@jupyter-widgets/base';

import * as widgetExports from './widget';

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
 * Activate the widget extension.
 */
function activateWidgetExtension(app, registry) {
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: widgetExports
  });
}
