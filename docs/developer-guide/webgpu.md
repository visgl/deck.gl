# WebGPU

:::caution
WebGPU support in deck.gl v9 is a work in progress and is not production ready. At this staged it is aimed at early adopter that wants to try out the new technology, contributors interested in supporting development, or general users that want to understand what to expect from future releases.
:::

deck.gl is gradually adding support for running on WebGPU. WebGPU support will materialize over successive releases, layer by layer and feature by feature.

## Enabling WebGPU

deck.gl needs to be set up to use a luma.gl device that uses the luma.gl `webgpuAdapter`.

One way to do this is to supply `deviceProps` to the Deck constructor:

```ts
import {webgpuAdapter} from '@luma.gl/webgpu`;

new Deck({
    deviceProps: {
        type: 'webgpu',
        adapters: [webgpuAdapter]
    }
});
```

## Layers

Layers that support WebGPU can be tested in the deck.gl website, using the WebGPU tab.

- `PointCloudLayer`
- `ScatterplotLayer`

## Features 

| Feature               | Status | Comment                                                             |
| --------------------- | ------ | ------------------------------------------------------------------- |
| Views                 | 🚧      | Should work, not fully tested                                        |
| Base Map overlays     | ❌      | deck.gl needs to adopt pre-multiplied colors to enable transparency |
| Base Map interleaving | ❌      | At the moment no basemaps support WebGPU                            |
