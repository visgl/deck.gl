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

  preRender() {} // eslint-disable-line @typescript-eslint/no-empty-function

  getModuleParameters(layer: Layer): any {} // eslint-disable-line @typescript-eslint/no-empty-function

  cleanup() {} // eslint-disable-line @typescript-eslint/no-empty-function
}
