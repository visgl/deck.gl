import fs from 'fs';
import path from 'path';

// Light settings are used in 3d mode
const defaultLightSettings = {
  enabled: true,
  ambientColor: [255, 255, 255],
  pointLightAmbientCoefficient: 0.1,
  pointLightLocation: [40.4406, -79.9959, 1000000],
  pointLightColor: [255, 255, 255],
  pointLightAttenuation: 1.0,
  materialSpecularColor: [255, 255, 255],
  materialShininess: 1
};

export function updateSettings({layer, props, oldProps}) {
  if (props.lightSettings !== oldProps.lightSettings) {
    const lightSettings = Object.assign({}, defaultLightSettings, props.lightSettings);
    layer.setUniforms({
      uLightingEnabled: lightSettings.enabled,
      uAmbientColor: lightSettings.ambientColor,
      uPointLightAmbientCoefficient: lightSettings.pointLightAmbientCoefficient,
      uPointLightLocation: lightSettings.pointLightLocation,
      uPointLightColor: lightSettings.pointLightColor,
      uPointLightAttenuation: lightSettings.pointLightAttenuation,
      uMaterialSpecularColor: lightSettings.materialSpecularColor,
      uMaterialShininess: lightSettings.materialShininess
    });
  }
}

export const lighting = {
  interface: 'lighting',
  source: fs.readFileSync(path.join(__dirname, 'lighting.glsl'), 'utf8'),
  updateSettings
};
