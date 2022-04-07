function isJSON(text: string): boolean {
  const firstChar = text[0];
  const lastChar = text[text.length - 1];
  return (firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']');
}

// TODO - replace with the version in loaders.gl
export default {
  name: 'JSON',
  // TODO - can we stream process geojson?
  extensions: ['json', 'geojson'],
  mimeTypes: ['application/json', 'application/geo+json'],
  testText: isJSON,
  parseTextSync: JSON.parse
};
