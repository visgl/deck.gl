export default class Pass {
  id: string;
  gl: WebGLRenderingContext;
  props: any;

  constructor(gl: WebGLRenderingContext, props: {id: string} = {id: 'pass'}) {
    const {id} = props;
    this.id = id; // id of this pass
    this.gl = gl;
    this.props = {...props};
  }

  setProps(props): void {
    Object.assign(this.props, props);
  }

  render(params): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  cleanup() {} // eslint-disable-line @typescript-eslint/no-empty-function
}
