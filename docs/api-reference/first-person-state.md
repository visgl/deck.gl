# FirstPersonState Class


## Constructor

Viewport arguments
* `width` - Width of viewport
* `height` - Height of viewport

Position and orientation
* `position` - typically in meters from anchor point
* `direction`,

* `bearing` - Rotation around y axis
* `pitch` - Rotation around x axis

Geospatial "anchor"
* `longitude`
* `latitude`
* `zoom`

* `syncBearing` = true, // Whether to lock bearing to direction

Constraints - simple movement limit
* `bounds` - Bounding box of the world, in the shape of {minX, maxX, minY, maxY, minZ, maxZ}

Internal Interaction states, required to calculate change during transform

* `startPanEventPosition` - Model state when the pan operation first started
* `startPanPosition` - Model state when the pan operation first started

* `startRotateCenter` - Model state when the rotate operation first started
* `startRotateViewport` - Model state when the rotate operation first started

* `startZoomPos` - Model state when the zoom operation first started
* `startZoom` - Model state when the zoom operation first started


Implements a viewState:

##### getViewportProps()

##### getInteractiveState()

##### panStart({pos})

Start panning

`pos` (`[Number, Number]`) - position on screen where the pointer grabs

##### pan({pos, startPos})

Pan

`pos` (`[Number, Number]`) - position on screen where the pointer is

`startPos` (`[Number, Number], optional`) - where the pointer grabbed at

  the start of the operation. Must be supplied of `panStart()` was not called

##### panEnd()

End panning

Must call if `panStart()` was called

##### rotateStart({pos})

Start rotating

`pos` (`[Number, Number]`) - position on screen where the center is

##### rotate({deltaScaleX, deltaScaleY})

Rotate

`deltaScaleX` (`Number`) - a number between [-1, 1] specifying the

  change to bearing.

`deltaScaleY` (`Number`) - a number between [-1, 1] specifying the

  change to pitch. -1 sets to minPitch and 1 sets to maxPitch.


##### rotateEnd()

End rotating

Must call if `rotateStart()` was called

##### zoomStart({pos})

Start zooming

@param {[Number, Number]} pos - position on screen where the center is

##### zoom({pos, startPos, scale})

Zoom

`pos` (`[Number, Number]`) - position on screen where the current center is

`startPos` (`[Number, Number]`) - the center position at

  the start of the operation. Must be supplied of `zoomStart()` was not called

`scale` (`Number`) - a number between [0, 1] specifying the accumulated

  relative scale.
    assert(scale > 0, '`scale` must be a positive number')

##### zoomEnd()

End zooming

Must call if `zoomStart()` was called

##### moveLeft()

##### moveRight()

##### moveForward()

##### moveBackward()

##### zoomIn()

##### zoomOut()
