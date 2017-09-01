# RFC: Controller Architecture

* **Authors**: Ib Green, ...
* **Date**: Aug 2017
* **Status**: Placeholder


## Motivation

* In deckgl v4.0 we introduced non-geospatial (orbit) controllers and viewports
* For deck.gl v5.0 we started working on first person controllers and viewports,
* For deck.gl v5.0 plus we are introducing a multiviewport architecture.

The combination of various viewports in a single render, feeding them off the same "map" state data

## Details

A critical step in this development was the decision to geospatially enable all viewports. This unifies the viewports to a significant extent


# Proposal

* Unify the "map state" requirements so that all viewports can take all map states as parameters (some viewports may not be able to interpret all data in a specific State subclass, but it will still be able to show something "reasonable").

* Make all viewports work with a basic map state specification.



## Additional Work: Event Handling

While the initial use of FirstPersonViewports will be to have them attached to other objects in the geometry, we will soon need "controllers" for these Viewports.

What is the best way to pan (effectively, move around) when viewing at 90 degrees pitch.
* Do we want a command-mouse drag [THREE.js pointer-lock controls](https://threejs.org/examples/misc_controls_pointerlock.html)
* Should we provide a classic keyboard interface (arrow keys)?


### Switching between modes.

One could imagine asking the application to switch both event controllers and viewport classes when switching between modes. This would keep the Viewports cleaner but make integration harder for the app.

The separation between Viewports / State / Controls / React Controllers is powerful but could perhaps be streamlined. A couple of preparatory PRs have reduced the amount of duplicated code, to simplify work in this area.

## Open Issues and Discussion Points

* `modelMatrix`: Allows the application to apply a modelMatrix that transforms both the position and the direction of the camera. Should this be part of the camera
* meterOffset? - it might convenient to allow the camera to be moved around using meter offsets compared to a lngLat anchor rather than having to recalculate lngLats on every mode.
- project/unproject - Pixel project/unproject to flat mercator coordinates may not work when pitch exceeds > 85 degrees.
* VR view matrices - can support for left and right eye matrices be integrated somehow?

