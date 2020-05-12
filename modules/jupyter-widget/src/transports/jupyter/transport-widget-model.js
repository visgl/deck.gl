import {DOMWidgetModel} from '@jupyter-widgets/base';
import {MODULE_NAME, MODULE_VERSION} from '../../version';
import {deserializeMatrix} from '../../lib/utils/deserialize-matrix';
/**
 *
 * Note: Variables shared explictly between Python and JavaScript use snake_case
 */
export class TransportWidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: TransportWidgetModel.model_name,
      _model_module: TransportWidgetModel.model_module,
      _model_module_version: TransportWidgetModel.model_module_version,
      _view_name: TransportWidgetModel.view_name,
      _view_module: TransportWidgetModel.view_module,
      _view_module_version: TransportWidgetModel.view_module_version,
      custom_libraries: [],
      json_input: null,
      mapbox_key: null,
      selected_data: [],
      data_buffer: null,
      tooltip: null,
      width: '100%',
      height: 500,
      js_warning: false
    };
  }

  static get serializers() {
    return {
      ...DOMWidgetModel.serializers,
      // Add any extra serializers here
      data_buffer: {deserialize: deserializeMatrix}
    };
  }

  static get model_name() {
    return 'TransportWidgetModel';
  }
  static get model_module() {
    return MODULE_NAME;
  }
  static get model_module_version() {
    return MODULE_VERSION;
  }
  static get view_name() {
    return 'TransportWidgetView';
  }
  static get view_module() {
    return MODULE_NAME;
  }
  static get view_module_version() {
    return MODULE_VERSION;
  }
}
