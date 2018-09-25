# RFC: Lighting

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

### Light Material
LightMaterial class specify light material details for each layer
* ambient(float): Ambient light reflection ratio
* diffuse(float): Diffuse light reflection ratio
* shininess(float): Parameter to control specular highlight radius
* specularColor(vec3): Color applied to specular lighting

### New Deck Prop
* lightSources(array): input of all the light sources in the scene

### New Layer Prop
* lightMaterial(object): input of light material attached to the layer

### Lighting Model
Blinn phong model will be implemented in the shader module to calculate the actual light weight
