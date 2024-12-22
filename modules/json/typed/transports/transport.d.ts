export default class Transport {
  static setCallbacks({
    onInitialize,
    onFinalize,
    onMessage
  }: {
    onInitialize: any;
    onFinalize: any;
    onMessage: any;
  }): void;
  name: string;
  _messageQueue: any[];
  userData: {};
  _destroyed: boolean;
  constructor(name?: string);
  /**
   * Return a root DOM element for this transport connection
   * @return {HTMLElement} default implementation returns document.body
   * Jupyter Notebook transports will return an element associated with the notebook cell
   */
  getRootDOMElement(): HTMLElement;
  /**
   * Back-channel messaging
   */
  sendJSONMessage(): void;
  /**
   * Back-channel messaging
   */
  sendBinaryMessage(): void;
  _initialize(options?: {}): void;
  _finalize(options?: {}): void;
  _messageReceived(message?: {}): void;
  static _stringifyJSONSafe(v: any): string;
}
// # sourceMappingURL=transport.d.ts.map
