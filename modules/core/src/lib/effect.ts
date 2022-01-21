import type Layer from './layer';

export default class Effect {
  id: string;
  props: any;

  constructor(props: {id?: string} = {}) {
    const {id = 'effect'} = props;
    this.id = id;
    this.props = {...props};
  }

  preRender() {}

  getModuleParameters(layer: Layer): any {}

  cleanup() {}
}
