import JSONConfiguration from './json-configuration';
export declare type JSONConverterProps = {
  configuration: JSONConfiguration | Record<string, any>;
  onJSONChange: any;
};
export default class JSONConverter {
  log: Console;
  configuration: JSONConfiguration;
  onJSONChange: () => void;
  json: any;
  convertedJson: any;
  constructor(props: any);
  finalize(): void;
  setProps(props: JSONConverterProps): void;
  mergeConfiguration(config: any): void;
  convert(json: any): any;
  convertJson(json: any): any;
}
// # sourceMappingURL=json-converter.d.ts.map
