## VR Capability
This example can be viewed in VR-capable devices. 
It uses deck.gl's multi-viewport, the WebVR API and [WebVR Polyfill](https://github.com/immersive-web/webvr-polyfill) library.
#### Working
`_initVRDisplay()` setups the `vrDisplay` and sets `vrEnabled` to true if a VR display is connected.
In case a VR display is not detected, the default Orbit Controller along with the Orbit Viewport will be used.
However, a stereoscopic view can still be viewed without an actual VR device.

#### Rendering Viewports
For stereoscopic rendering, two default viewports are used for Side-by-Side display.

The WebVR API provides [`VRFrameData`](https://developer.mozilla.org/en-US/docs/Web/API/VRFrameData) constructed by the `VRDisplay.getFrameData` function. This frame data is essential for obtaining the `viewMatrix` and `projectionMatrix` of both the left and right eye.
The base deck.gl viewport can directly accept the view and projection matrices using the `DeckGL.viewports` property.

#### Emulated VR Display
The ```EmulatedVRDisplay``` comes into picture when an actual VR hardware is not present.
It provides a mock `VRFrameData` object which contains necessary matrices used for rendering the viewport.

The `getFrameDataFromPose()` function accepts an emulated [`VRPose`](https://developer.mozilla.org/en-US/docs/Web/API/VRPose) object which contains the orientation and position. Thus, allowing manual control over the pose and finally, interaction in the viewports.

  