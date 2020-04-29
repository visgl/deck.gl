# RFC: Text Layer API Change

* **Authors**: Xintong Xia 
* **Date**: January 2019
* **Status**: Draft 

## Motivation 

When `TextLayer` generates shared `fontAtlas` for required `characterSet`, it applied default settings, like 
`fontSize`, `buffer`(Whitespace surround each character), etc.. However one setting can not be suitable for 
all the different fonts. For example, [Cinzel](https://fonts.google.com/specimen/Cinzel) has a special shape 
of `Q` character, which requires a big buffer [See detail](https://github.com/visgl/deck.gl/pull/2609). Big buffer around each character can be very expensive 
if the target `characterSet` is considerably large, which is not necessary for other fonts.

`TextLayer` needs expose the settings related to `fontAtlas` generation for users to manipulate when needed.

## Proposal: Expose font settings as layer props

`TextLayer` supports [`sdf`](https://github.com/mapbox/tiny-sdf), check [Text Layer](/docs/layers/text-layer.md) for details.

`fontSettings` together with the other three layer props `characterSet`, `fontFamily` and `fontWeight` will be used in generating `fontAtlas`.

```js

import {TextLayer} from '@deck.gl/layers'

const textLayer = new TextLayer({
  ...,
  characterSet: 'abcdefg',
  fontFamily: 'Monaco, monospace',
  fontWeight: 'normal',

  fontSettings: {
    // shared options between non-sdf and sdf
    // this fontSize if only applied for generating fontAtlas
    // it does not impact the size of the text labels 
    fontSize: 64, 
    // Whitespace buffer around each side of the character
    buffer: 2,
    
    // `sdf` only options
    // https://github.com/mapbox/tiny-sdf
    sdf: true,
    // if `sdf` is false, the following parameters are not appliable
    radius: 3,
    cutoff: 0.25
  },
  ...
```
});

## Open Question 

**Should `fontSettings` nested or flat to layer props?**

If nested as the above proposal, it is more clear and more organized, but `TextLayer` needs compare the all the
properties nested in `fontSettings` to decide whether update `fontAtlas`. 

If flat, exposed all the options under `fontSettings` as layer props, it can be confusing to the users since
some settings like `fontSize`, `fontWeight` is not apply to the text labels rendering in the layer,
but only impact `fontAtlas` generating.

## Cost and Impact
With the new proposal, the users using `sdf` needs to migrate to new API. Others should not be impacted.
