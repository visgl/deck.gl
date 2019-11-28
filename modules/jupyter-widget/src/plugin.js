/**
 * Plugin boilerplate required for JupyterLab
 * See:
 * https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/51e9fed8687e3b9cf1ed2fd307b7675e864f89ae/%7B%7Bcookiecutter.github_project_name%7D%7D/src/plugin.ts
 */
import {IJupyterWidgetRegistry} from '@jupyter-widgets/base';
// eslint-disable-next-line import/no-unresolved
import * as widgetExports from '../dist/index';
import {MODULE_NAME, MODULE_VERSION} from './version';

const EXTENSION_ID = '@deck.gl/jupyter-widget:plugin';

const widgetPlugin = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  activate: activateWidgetExtension,
  autoStart: true
};

export default widgetPlugin;
function activateWidgetExtension(app, registry) {
  registry.registerWidget({
    name: MODULE_NAME,
    version: MODULE_VERSION,
    exports: widgetExports
  });
}
