# luma.gl IO module

This luma submodule contains basic IO functions for browser and node. that can be implemented without dependencies.

## Remarks

* The node.js implementation uses stackgl modules for DOM-less reading and writing of images (`get-pixels`, `save-pixels`, `ndarray` etc).
* These Node.js dependencies are quite large so great care is taken not to add these to the application bundle. They are loaded dynamically using `module.require` (typically from `node_modules`), to avoid bundling them in browser bundles. If the application doesn't find the required modules at run-time, it will throw an exception.

TBD:
* These are not dependencies of luma.gl. They need to be installed by the app.
