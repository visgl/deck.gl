export default class Effect {
  constructor(props = {}) {
    const {id = 'effect'} = props;
    this.id = id;
    this.props = {...props};
  }

  preRender() {}

  getModuleParameters() {}

  cleanup() {}
}
