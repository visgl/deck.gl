import type Layer from './layer';

export default class Effect {
  id: string;
  props: any;
  useInPicking: boolean;

  constructor(props: {id?: string} = {}) {
    const {id = 'effect'} = props;
    this.id = id;
    this.props = {...props};
    this.useInPicking = false;
  }

  preRender() {}

  getModuleParameters(layer: Layer): any {}

  cleanup() {}
}
