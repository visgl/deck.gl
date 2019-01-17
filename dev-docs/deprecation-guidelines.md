# Deprecation Guidelines

Every feature removal should be given careful thought. Gently deprecating things (keep supporting them for 1+ release with a console warning) has a big value and is the preference.

* But sometimes the price in e.g. complexity or code overhead can be too big (thinking about deck.gl v4 which has three big deprecated ChoroplethLayers that take up a lot of space in the app bundle but are used by very few apps. One could question whether keeping them was the right choice). The situation is similar for the less frequently used Overlays in react-map-gl v3.

* In cases where we can't or won't do gentle deprecation, we should document the breaking changes in an upgrade guide.

* I'm in favor of following what Facebook does with React in general - console.warn for API deprecations and clearly stating in the CHANGELOG and then deprecate 2-3 versions later.

* The question also is when to eventually do the deprecation. Do we do it in a minor patch, or wait for a major version bump?

 * iven we already have a few majors, everything that is potentially breaking should be done in a major
 @ibgreen

* Isn't the key consideration that we should provide some reasonable time for users to update? If a feature has been deprecated for 6+ months, and we are cutting a new major release, it would seem acceptable to remove it.

* If it was just deprecated a week earlier in a minor release, and we are cutting a new major release, then we should probably keep it around as deprecated for another major release.

* Even if it has only been deprecated for a week and we are about to draft a new major, we should take the opportunity to remove it completely as soon as possible. If users want to update to the latest major and stay 
* gently deprecate with console.warn when possible (and not too burdensome)


* note API deprecation and removal in CHANGELOG
* keep deprecated APIs for one major release
* remove deprecated APIs only on major versions, but don't be shy about it

* Sounds good. But yeah timeline should be sensible. If we're cutting major releases every 2 weeks then we should also re-evaluate life a bit :p.

* It'll help to keep a clear log, going forward, of planned API deprecation and when the warnings were introduced to the user so as we work on new major versions, we can have a clear sense of how much time the user has had to make the necessary changes.