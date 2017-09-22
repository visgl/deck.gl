<div align="center">
  <img src="https://cdn.pbrd.co/images/vAmSmehU.png" />
</div>

## Hello World: Browserify

Uses the [browserify](https://github.com/substack/node-browserify) JavaScript
bundler and applies the [babelify](https://github.com/babel/babelify) "transform",
which runs the babel transpiler on the source code, transpiling JSX and ES6
to ES5 JavaScript.

Commands:
* `yarn` or `npm install` installs the dependencies.
* `npm start` is the development target. This builds and serves the app using
  [budo](https://github.com/mattdesl/budo), which hot reloads when you save
  changes to the source code.
* `npm run build` is the build target. It builds a single `dist-bundle.js`
  JavaScript file containing the transpiled version of your code plus code
  from all dependent modules.

Remarks:
* The generated `dist-bundle.js` can be loaded into a browser using an HTML script
  element.
* You can open the generated `dist-bundle.js` in a text editor and inspect what code
  has been included.
* In a real application you would likely want to add things like unit tests,
  a minification step etc to the production build step etc.
  These steps have been omitted here in order to keep the example as simple as
  possible.
