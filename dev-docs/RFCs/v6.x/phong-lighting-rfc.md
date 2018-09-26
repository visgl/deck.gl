# RFC: Phong Lighting

* **Authors**: Jian Huang
* **Date**: Sep. 2018
* **Status**: For Review

## Motivation

Lighting is an important rendering effects in deck.gl, the current lighting module has some issues.
* Light source is duplicated in each layer
* Only support point light source
* Light source and material parameters are bundled together
* Specular highlight is tinted by object color

## Goals
* Light sources are owned by scene and shared by layers
* Support ambient, point and directional light sources
* Separate light source and material parameters
* Specular highlight is not tinted by object color

## Proposal

### Light Source
Three light source classes specify light source details for the scene
* Ambient light  
color (vec3): color of ambient light source  
intensity (float): strenght of ambient light source
* Point light  
color (vec3): color of point light source  
intensity(float): strenght of point light source  
position(vec3): position of point light source in world space coordinate
* Directional light  
color(vec3): color of directional light source  
intensity(float): strenght of direcitonal light source  
direction(vec3): direction vector of directional light source

### Lighting Material
LightPhongMaterial class specify phong model based lighting material details for each layer
* ambient(float): Ambient light reflection ratio
* diffuse(float): Diffuse light reflection ratio
* shininess(float): Parameter to control specular highlight radius
* specularColor(vec3): Color applied to specular lighting

### Lighting Effect
LightingEffect class holds and manages all the light sources
* lightSources(object): all the light sources in the scene

### New Deck Prop
* effects(array): input of all the rendering effects in the scene

### New Layer Prop
* material(object): input of lighting material attached to the layer

### Outdated Layer Prop
* lightSettings(object)

### Lighting Model
Blinn phong model will be implemented in the shader module to calculate the actual light weight

## Code Example

Create light sources
```js
const directionalLight = new DirectionalLight( 0xffffff, 0.5, [1, 0, 0]);
const pointLight = new PointLight( 0xffffff, 0.5, [0, 0, 0]);
```

Create lighting effect
```js
const lightingEffect = new LightingEffect({pointLight, directionalLight}])
```

Create material
```js
const phongMeterial = new LightPhongMeterial(0.3, 0.5, 32, [255, 255, 255, 255])
```

Create deck and layer
```js
const deck = new Deck({
 effects: [lightingEffect],
 layers: [
   new GeoJsonLayer({
     data: US_MAP_GEOJSON,
     stroked: true,
     filled: true,
     getLineColor: [255, 100, 100],
     getFillColor: [200, 160, 0, 180],
     material:phongMeterial
     }
   })
 ]});
```
## Next Step

### PBR Lighting
Lighting implemented with PBR models
