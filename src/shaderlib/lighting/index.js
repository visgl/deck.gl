import fs from 'fs';
import path from 'path';
export const lighting = {
  interface: 'lighting',
  source: fs.readFileSync(path.join(__dirname, 'apply-lighting.glsl'), 'utf8')
};

const DEFAULT_AMBIENT_COLOR = [255, 255, 255];
const DEFAULT_POINTLIGHT_AMBIENT_COEFFICIENT = 0.1;
const DEFAULT_POINTLIGHT_LOCATION = [40.4406, -79.9959, 100];
const DEFAULT_POINTLIGHT_COLOR = [255, 255, 255];
const DEFAULT_POINTLIGHT_ATTENUATION = 1.0;
const DEFAULT_MATERIAL_SPECULAR_COLOR = [255, 255, 255];
const DEFAULT_MATERIAL_SHININESS = 1;

export function lightingSetUniforms(modelOrLayer, props) {
  const {
    ambientColor, pointLightColor,
    pointLightLocation, pointLightAmbientCoefficient,
    pointLightAttenuation, materialSpecularColor, materialShininess
  } = props;

  modelOrLayer.setUniforms({
    uAmbientColor: ambientColor || DEFAULT_AMBIENT_COLOR,
    uPointLightAmbientCoefficient:
      pointLightAmbientCoefficient || DEFAULT_POINTLIGHT_AMBIENT_COEFFICIENT,
    uPointLightLocation: pointLightLocation || DEFAULT_POINTLIGHT_LOCATION,
    uPointLightColor: pointLightColor || DEFAULT_POINTLIGHT_COLOR,
    uPointLightAttenuation: pointLightAttenuation || DEFAULT_POINTLIGHT_ATTENUATION,
    uMaterialSpecularColor: materialSpecularColor || DEFAULT_MATERIAL_SPECULAR_COLOR,
    uMaterialShininess: materialShininess || DEFAULT_MATERIAL_SHININESS
  });
}
