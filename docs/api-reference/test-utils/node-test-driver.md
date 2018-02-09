<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="Node" />
</p>

# NodeTestDriver (Test Automation Class, Node.js only, Experimental)

A basic Browser automation test driver built on puppeteer

Helper class primarily intended for automating browser tests from Node.js or shell scripts. A `RenderTestDriver` controls a Chrome browser instance using `puppeter`, renders a set of tests (described below), compares the output against golden images, and returns a pass/fail value to the invoking shell.

> Requires Chrome version 64 or higher


### constructor

### setShellStatus

`driver.setShellStatus(success)`

Set the return value that will be visible to the shell, truthy values will generate 0 which represents success.


### startBrowser

`driver.startBrowser(options)`


### newPage

Opens a new tab in the browser

`driver.newPage({url, width, height})`

* `url` = `http://localhost:8080`
* `width` = `1550`
* `height` = `850`


### stopBrowser

`driver.stopBrowser()`


### startServer

Runs a server in a new child process, that the browser can connect to.

`driver.startServer(config = {})`

* `process` './node_modules/.bin/webpack-dev-server',
* `parameters` ['--config', 'test/render/webpack.config.js', '--progress'],
* `options` {maxBuffer: 5000 * 1024}


### stopServer

* Stops the server (child process)


### exit

* Stops the browser via `this.stopBrowser()`.
* Stops the server (child process), via `this.stopServer()`.
* Exits the current script with a status code.

This generates a return value that is visible to the shell, 0 is success.
