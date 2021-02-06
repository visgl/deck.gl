# RFC: Instance Culling

## Summary

This RFC explores approaches to cull the number of instances to be rendered based
on their distance or extents in view space, in order to increase rendering performance
for large data sets. It also explores approaches to LOD (level of detail) to render
simpler geometries for visually smaller objects.

## Motivation

The initial focus is on improving performance when using the `ScenegraphLayer`
with high instance counts and high polygon count scene graphs.

However the instance culling techniques can potentially be used to provide more 
efficient filtering and rendering mechanisms for general layers.

## Use Cases

### SceneGraphLayer vertex explosion

A use case for the scenegraph layer is to show objects on a map. The objects may be cars,
drones, people etc.

The `ScenegraphLayer` makes it possible to use high-quality, high-polygon count geometries.

However the number of vertices (polygons) needed to be rendered quickly increases.

For instance, a scene graph with 10K vertices, and 1000 instances, generates 10M vertices in a draw call.

## Potential Approaches

There are a number of techniques that can be applied to the problem:

- **distance culling** - Determining the distance at which each instance is anchored
- **bounding boxes** - Using bounding boxes to automatically determine distance culling limits
- **vertex filtering** - A simpler, less performant approach of filtering out unnecessary work by filtering vertices
- **instance filtering** - A more powerful, potentially more performant approach of filtering out unnecessary rendering by filtering the instance list 
- **LOD** - using different geometries
- **Decimation** - Automatic generation of smaller, reduced detail geometries by implementing decimation algorithms.

## Distance Culling

The idea is to select which instances to draw based on the distance of their center points from the viewer. Many layers already have distance points.


## Vertex Filtering

A fairly low-cost way of reducing GPU work could be to apply a filter in the vertex shader that
- checks the distance of the instance position from the camera
- generates a degenerate 0 size polygon.
- or sets a flag to discard the pixels in the vertex shader.

This will likely generate some performance boost at a low cost but it is unlikely to provide order-of-magnitude improvement as all vertices for all instances are still processed by the vertex shader.

## Instance filtering

The other approach would be to filter the instance table based on the view, making a poass. 

For non-instanced layers, it should be possible to just generate an index array
that omits vertices belonging to filtered geometry.

Unfortunately, GPUs do not provide indexing support for instance tables like they do for the primitive geometry, so we can't just provide an array with the instance indices we want to render, we need to generate a completely set of instance attributes.

Generation of new instance arrays could be done on the CPU whenever the viewport changes, writing into new typed arrays and uploading those. 

For layers that typically have modest amounts of instances (<10K instances) such as ScenegraphLayer the CPU approach is likely fairly performant as there is no GPU read back involved, and most likely will perform much better on large total vertex counts.

For the general case, where we may deal with millions of instances, we could investigate if some transform feedback type technique could be used to filter the arrays on the GPU. Since the output is random access (not row-to-row) the results would presumably need to be written into a texture and converted to a buffer. Actual performance would have to be carefully measured to ensure that the desired performance characterstics are met.

Note that gor filtering use cases, the performance criteria may be lower than rendering and the GPU technique might be more applicable.


## LOD (Level of Detail)

While instance culling allows us to select which instances are drawn based
on distance from viewer / camera, we end up drawing nothing when instances are
deselected.

Level of detail refers to having multiple copies of the same model, 
with each copy having a lower vertex count. The lower vertex count copies are
intended to rendered when the object is further away. 
The idea is that an object that only occupies a few pixels on the screen 
does not benefit from thousands of polygons, but can be rendered with a minimal
version of geometry with adequate visual results.

### glTF MSFT_LOD extension

The core glTF 2.0 standard does not have support for level of detail, and while there are active discussions, an immediate consensus does not seem to be likely, see e.g:
- [Adding LODs to glTF](https://github.com/KhronosGroup/glTF/issues/1045)

Microsoft has specified a glTF extension: 
- [MSFT_lod](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_lod)

Though support for the `MSFT_lod` extension in authoring tools is limited.

Babylon.js may have added the most comprehensive support for this extension: 
- [Progressively Load .glTF Files](https://doc.babylonjs.com/divingDeeper/importers/progressiveglTFLoad).


he following example shows how the `MSFT_lod` extension can be specified at the node level to create three LOD levels.

```json
"nodes": [
    {
        "name": "High_LOD",
        "mesh": 0,
        "extensions": {
            "MSFT_lod": {
                "ids": [
                    1,
                    2
                ]
            }
        },
        "extras": {
            "MSFT_screencoverage": [
                0.5,
                0.2,
                0.01
            ]
        }
    },
    {
        "name": "Medium_LOD",
        "mesh": 1
    },
    {
        "name": "Low_LOD",
        "mesh": 2
    }
]
```


## Decimation / Auto-LOD

Decimation or Mesh Simplification is the process of generating a new mesh 
with less vertices that approximates the initial mesh.

While 3D Model authoring tools offer excellent decimation operations
(`decimate modifier` in Blender), this section looks at automatically 
performing a decimation in JavaScript on a loaded geometry in order to generate
simpler geometries.

Babylon.js has a function:
- https://doc.babylonjs.com/divingDeeper/mesh/simplifyingMeshes

Some prior THREE.js related work:
- https://discourse.threejs.org/t/three-simplifymodifier-vs-progressive-mesh-streaming/4460
- https://gist.github.com/zz85/a317597912d68cf046558006d7647381
- https://github.com/mrdoob/three.js/issues/5806

Nexus may be worth a look
- http://vcg.isti.cnr.it/nexus/

Side note: A decimation feature could be implemented in luma.gl but it could also be part of the planned geometry manipulation packages in math.gl.
