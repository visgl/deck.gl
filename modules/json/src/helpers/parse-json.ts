// Accept JSON strings by parsing them
// TODO - use a parser that provides meaninful error messages
export default function parseJSON(json) {
  return typeof json === 'string' ? JSON.parse(json) : json;
}
