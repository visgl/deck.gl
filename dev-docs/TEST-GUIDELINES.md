# Test Setup Explained

## Test Suite

Using `tape`.


## Node tests


Idea behind `test/node.js` and `test/node-dist.js`

These are supposed to work identically. The only difference being that one runs the test directly on the ES6 source and one runs the tests on the transpiled ES5 version of the library, just to make doubly sure the transpilation doesn't cause any issues. We should absolutely not import jsdom in just one of these two tests, they should both have the same setup, either neither or both should import it. Second, about jsdom usage in node tests:

The big problem is that the introduction of jsdom hides an important class of problems - i.e. we will no longer catch issues that happen under node in apps that don't include jsdom - which are very common (stray references to window and document etc). Thus, importing jsdom defeats an important part of the purpose of the node tests.
I suspect the jsdom import into the node test script was introduced during the push to increase coverage, which also saw the addition of the sinon dependency.
I'm not sure if the reason jsdom was included was because sinon requires it, or if it was due to another issue.
Regardless, my strong preference would be that we find a way to avoid including jsdom in node tests. If it is indeed sinon that requires it, we might be able to replace sinon with our own spy function. I don't think we are using much of that library.
If we absolutely need to include jsdom we might need to create a third node test script for node (test/node-no-jsdom.js?) that runs at least some tests without jsdom included.
Finally, in regards to the question about what tests do we want to run on test, pre-commit, travis CI, publish etc:

For pre-commit, CI, publish, we want to run everything we got: the linter, run an error-free build, run multiple tests on node etc. Basically, we want to cast the widest possible net to prevent bugs from making their way into master and into the published packages.
That said, for quick iteration of tests during development, it will be frustrating if too many tests are run each time. Since making sure that e.g. CI etc use all tests typically requires adding all the tests to the main package.json "test" script, in many modules we add a separate test-fast script that just runs one copy of the tests:

```
   "scripts": {
      "test"; "npm run lint && node test/node.js && node test/node-dist.js && .... "
      "test-fast" "node test/node.js",
      ...
   }

   ```
PS - We could possibly relax the pre-commit testing just a little if found too time consuming, but there is no reason to reduce the CI or prepublish testing.


## npm run test-browser

It's the same test suite, but run in the browser.

While it would be awesome to have CI do both node and browser testing, I haven't found a reliable way to run it on Travis, so it doesn't get executed by the main test script.

But since I find debugging in the browser much easier than debugging in node, I try to keep the script in good working order.

But since it is not automatically run, it doesn't get tested before every check-in, so it does occasionally degrade on master.

We did have a partially working integration with electron (headless browser environment) and testron, but it was flaky. If we could get something like that solid (perhaps Chrome headless mode), it would be good to add it to the main set of tests.