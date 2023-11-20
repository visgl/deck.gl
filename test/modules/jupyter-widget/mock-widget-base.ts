/* global window*/
import * as widgets from '@jupyter-widgets/base';

// Adapted from https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/f8c4f1d2c61374811423eb724b9eb11c6e2f10b1/%7B%7Bcookiecutter.github_project_name%7D%7D/src/__tests__/utils.ts#L106
export class DummyManager extends widgets.ManagerBase {
  constructor() {
    super();
    this.el = window.document.createElement('div');
    this.testClasses = {};
  }

  display_view(msg, view, options) {
    return Promise.resolve(view).then(v => {
      this.el.appendChild(v.el);
      v.on('remove', () => {});
      return v.el;
    });
  }

  loadClass(className, moduleName, moduleVersion) {
    if (moduleName === '@jupyter-widgets/base') {
      if (widgets[className]) {
        return Promise.resolve(widgets[className]);
      }
      return Promise.reject(`Cannot find class ${className}`);
    } else if (moduleName === 'jupyter-datawidgets') {
      if (this.testClasses[className]) {
        return Promise.resolve(this.testClasses[className]);
      }
      return Promise.reject(`Cannot find class ${className}`);
    }
    return Promise.reject(`Cannot find module ${moduleName}`);
  }

  _get_comm_info() {
    return Promise.resolve({});
  }

  _create_comm() {
    return Promise.resolve({});
  }
}

export function createTestModel(constructor, attributes) {
  const id = widgets.uuid();
  const widget_manager = new DummyManager();
  const modelOptions = {
    widget_manager,
    model_id: id
  };

  return new constructor(attributes, modelOptions);
}
