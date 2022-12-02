import type {Device} from '@luma.gl/api';

export default class Pass {
  id: string;
  device: Device;
  props: any;

  constructor(device: Device, props: {id: string} = {id: 'pass'}) {
    const {id} = props;
    this.id = id; // id of this pass
    this.device = device;
    this.props = {...props};
  }

  setProps(props): void {
    Object.assign(this.props, props);
  }

  render(params): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  cleanup() {} // eslint-disable-line @typescript-eslint/no-empty-function
}
