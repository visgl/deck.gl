import parseExpressionString from './helpers/parse-expression-string';
export default class JSONConfiguration {
  typeKey: string;
  functionKey: string;
  log: Console;
  classes: {};
  reactComponents: {};
  enumerations: {};
  constants: {};
  functions: {};
  convertFunction: typeof parseExpressionString;
  preProcessClassProps: (Class: any, props: any) => any;
  postProcessConvertedJson: (json: any) => any;
  constructor(...configurations: any[]);
  merge(configuration: any): void;
  validate(configuration: any): boolean;
}
// # sourceMappingURL=json-configuration.d.ts.map
