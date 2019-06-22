function isJSON(text) {
  const firstChar = text[0];
  const lastChar = text[text.length - 1];
  return (firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']');
}

export default {
  name: 'JSON',
  extensions: ['json', 'geojson'],
  testText: isJSON,
  parseTextSync: JSON.parse
};
