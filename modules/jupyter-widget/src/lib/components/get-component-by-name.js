import DescriptionCard from './description-card';

const componentLookup = {};

for (const c of [DescriptionCard]) {
  componentLookup[c.stringName] = c;
}

function getComponentByName(name) {
  return componentLookup[name];
}

export default getComponentByName;
