import type {Device} from '@luma.gl/api';
export default class Pass {
  id: string;
  device: Device;
  props: any;
  constructor(
    device: Device,
    props?: {
      id: string;
    }
  );
  setProps(props: any): void;
  render(params: any): void;
  cleanup(): void;
}
// # sourceMappingURL=pass.d.ts.map
