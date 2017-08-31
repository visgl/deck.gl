# RFC: Break out "math.gl"

* **Author**: Ib Green
* **Date**: Aug, 2017
* **Status**: Draft


## Motivation

* The math module in luma.gl is central to using luma.gl and to advanced use of deck.gl.
* Due to the intimidation factor of updating luma.gl we have seen the module being copied into apps and forked, which is not desirable.
* The documentation and test cases for the math library really deserve first-class citizen status.
* LICENSE wise we want to copy code from other libraries such as gl-matrix and THREE.js - by keeping the math code in a separate repo we don't have to complicate the LICENSE files in our main repos.
* To manage the large size of gl-matrix dependency, we are doing special per-function imports. These imports are an ugly implementation detail that has started to spread out through our code. If we have a separate repo that module can manage the ugly imports.


## Prototype

Since the math code was already open sourced in luma.gl I could set up a [new repo](https://github.com/ibgreen/math.gl) on my private account (temporarily for prototyping only) without going through a full approval process.

We have also secured `math.gl` on npm.

## Proposal: Move the prototype to our org domain.


## Proposal: SphericalCoordinates class

While projection matrix creation functions typically take a `lookAt` (Vector3) parameter, directions are often specified as spherical coordinates (pitch and bearing).
* To make is easy to use both spherical coordinates and direction vectors for the camera, we can extend our math library with a SphericalCoordinates class to make transformations between direction vectors and spherical coordinates easy. We already have an initial implementation.


