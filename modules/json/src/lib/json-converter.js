// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
// TODO - Currently converts in place, might be clearer to convert to separate structure

import parseJSON from './helpers/parse-json';
import convertJSON from './convert-json';

export default class JSONConverter {
  constructor(props) {
    this.configuration = {};
    this.onJSONChange = () => {};
    this.json = null;
    this.convertedJson = null;
    this.setProps(props);
  }

  finalize() {}

  setProps(props) {
    // HANDLE CONFIGURATION PROPS
    if ('configuration' in props) {
      this.configuration = props.configuration;
    }

    if ('onJSONChange' in props) {
      this.onJSONChange = props.onJSONChange;
    }
  }

  convertJson(json) {
    // Use shallow equality to ensure we only convert same json once
    if (!json || json === this.json) {
      return this.convertedJson;
    }
    // Save json for shallow diffing
    this.json = json;

    // Accept JSON strings by parsing them
    const parsedJSON = parseJSON(json);

    // Convert the JSON
    let convertedJson = convertJSON(parsedJSON, this.configuration);

    convertedJson = this.postProcessConvertedJson(convertedJson);

    this.convertedJson = convertedJson;
    return convertedJson;
  }

  preProcessClassProps(props) {
    return props;
  }

  // Let subclass post process
  postProcessConvertedJson(convertedJson) {
    return convertedJson;
  }
}
