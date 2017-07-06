# The Birth of a Visualization Framework Suite

## A Simple Idea

The basic idea behind the suite is Over the last two years, the Uber Visualization Team has developed and open sourced a number of Visualization frameworks. visuawas that by taking some of Uber's most popular Visualization frameworks, and aligning their websites, documentation and examples, we could make the various frameworks significantly easier to discover and use.


## The Frameworks

The visualization frameworks that are part of our initial suite are:

* [deck.gl](https://uber.github.io/deck.gl/) - High performance WebGL powered layers for geospatial and infovis use cases.
* [react-map-gl](https://uber.github.io/react-map-gl/) - React components for Mapbox GL (integrates seamlessly with deck.gl)
* [react-vis](https://uber.github.io/react-vis) - An extensive set of React charting components.
* [luma.gl](https://uber.github.io/luma.gl) - WebGL2 components powering deck.gl


## Why Develop a Framework Suite?

While each framework in the suite has a different focus, they are quite complementary to each other (in fact, at Uber we have developed a number applications that use all of these frameworks) so there is a clear value in making it easy to discover and learn these frameworks.


## The Making of the Suite?

To create the suite, we had to bring all frameworks up to the same level of completion and polish, and we have spent significant efforts into improving the websites, documentation and examples of these frameworks.


## A push on Documentation and Examples

Great software should have great documentation. We made a big push on documentation in the release of deck.gl about 3 months ago and the response has been overwhelmingly good. So we decided to apply the same standards to all the frameworks in the suite.

The launch of the frameworks suite means that all the frameworks have consistent websites, with documentation, example gallery etc all organized in the same way and maintained at similar standards of polish and completeness.


## Interlinking the Documentation Sites

Users often use several of the frameworks. Using deck.gl, luma.gl and react-map-gl is perhaps the most common combination. Previously, users had to deal with documentation of very different structure and quality spread out over multiple sites.

Each framework in the suite now has a drop down in its header bar to allow easy navigation to the other frameworks.

In addition, each framework has been assigned a color scheme, giving the user a visual cue to where he or she is in the suite (i.e. which framework's docs are currently being shown). This should be helpful now that the different frameworks follow the same documentation style.



## New Releases

In concert with the unification of the framework documentation websites, we are also releasing new versions of some of the frameworks in the suite.


### react-map-gl v3

A major under-the-hood upgrade, this release also makes more Mapbox GL features available to React users, significantly strengthens the React encapsulation of Mapbox GL, simplifies installation, and adds support for some advanced use cases.

Release highlights:
* The documentation and website are completely rewritten (and made part of the suite, of course)
* Multi-touch (pinch to zoom and rotate etc) is now supported (e.g. for mobile devices)
* New React components are available (Markers, Popups etc), matching the native API.
* A new architecture supports some advanced use cases, like automatically hiding the map when tilting beyond the mapbox 60 degree limit, something we use in "hybrid" applications that layer 3D visualizations on top of mapbox (using deck.gl, of course).


### luma.gl v4

v4 brings complete support for WebGL2 (which represents a major upgrade of the WebGL API). But there are a number of other significant improvements that round off this major release.

Release highlights:
* Full WebGL2 Support
* WebGL Capability Management
* WebGL State Management
* GLSL Module System
* Debug and Profiling Support
* Library Size Optimizations

That said, many users will probably appreciate the dramatically improved luma.gl documentation more than any single feature.


### deck.gl v4.1

deck.gl v4.1 is now based on luma.gl v4. The blog post [introducing deck.gl v4](http://uber.github.io/deck.gl/blog/2017/introducing-deckgl-v4) mentioned our plans to introduce more GPU based computing into future versions deck.gl (e.g. GPU based data processing and aggregation), and the inclusion of luma.gl v4 is a major enabler for that effort.

The new release also  adds a couple of previously "teased" WebGL2 example layers, the [Wind Map](http://uber.github.io/deck.gl/blog/2017/wind-map) layers. These layers are now offered as part of a reusable, stand-alone example.


### react-vis

react-vis has already quietly been aligning with the documentation style introduced by deck.gl v3 and v4 and is also one of Uber's most popular repositories, so including it in the suite was an obvious choice. No new specific release was made, we've just added the link menu to the react-vis website.


## What's Next for the Suite?

We expect to gradually bring out new frameworks, and when it makes sense, add them to the suite. That said, we'd like to keep a high bar for membership in this suite. The frameworks in the suite should be of general interest to the visualization community.

As an example, we have also open sourced other supporting, more special-purpose frameworks (e.g. viewport-mercator-project, or the seer Chrome debug extension), but these are not as frequently accessed directly by users and we do not plan make them part of the interlinked documentation suite.


## Feedback Welcome

One of the biggest goals of the new suite is to make these frameworks easier to use, and simpler to discover, for **you**.

We'd love to hear from you if you have ideas about the suite and how we could improve it to help you. Just ping us in the issues section of any of the framework repositories on github, and let us know what you think.

Enjoy!

Ib Green, on behalf of
The Visualization Team at Uber


