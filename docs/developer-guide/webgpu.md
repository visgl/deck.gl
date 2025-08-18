# WebGPU

:::caution
WebGPU support in deck.gl v9 is a work in progress and is not production ready. At this stage, it is aimed at early adopters who wants to try out the new technology, contributors interested in supporting development, or general users that are curious to understand what to expect from future releases.
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

Layers will gradually be WebGPU enabled. Layers that support WebGPU can be tested in the deck.gl website, using the WebGPU tab.

- [`PointCloudLayer`](https://deck.gl/examples/point-cloud-layer)
- [`ScatterplotLayer`](https://deck.gl/examples/scatterplot-layer)

## Features

Apart from listing which layers have been ported, another aspect is what deck.gl features support WebGPU. 

| Feature               | Status | Comment                                                                                 |
| --------------------- | ------ | --------------------------------------------------------------------------------------- |
| Views                 | 🚧      | Various view systems should work via the WGSL port of the `project module`.ß             |
| Picking               | ❌      | WebGPU pixel readout is asynchronous, requiring an overhaul of deck.gl's picking engine |
| Base Map overlays     | ❌      | deck.gl needs to adopt pre-multiplied colors to enable transparency                     |
| Base Map interleaving | ❌      | At the moment no basemaps support WebGPU                                                |

This is currently an incomplete list. Expect more detail in upcoming releases.

## Background

While the WebGPU support in deck.gl may look limited, under the hood, WebGPU enablement has been in progress for several years and a lot of work has been completed. In particular [luma.gl](https://luma.gl), the GPU framework powering deck.gl, has been rewritten and adopted a "WebGPU-first" design.

## Participating

If you want to contribute to deck.gl WebGPU development, or just follow along, we have a dedicated channel in our OpenJS / Open Visualization slack channel.

You can also check various release tracker tasks on GitHub.
