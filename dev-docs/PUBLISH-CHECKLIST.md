# Framework publish checklist



<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image1.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image2.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image3.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image4.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image5.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

## Prepare publish

1. check all the bug tickets under current github milestone, make sure the PRs are all ported to release branch
2. Test your changes by running test-browser, render test, all examples and layer-browser (if deck.gl).

### Patch Release

3. If there were several conflicts in cherry-pick process and you have to make several changes in process of selecting partial changes from a PR, create a PR, get teams review, otherwise just push all changes into release branch directly.


### Publish luma.gl lib

4. Update package.json with correct version number (in modules/core/package.json)
5. Update CHANGELOG.md, making sure all commits and PRs merged after release are recorded properly
6. Commit and push the updated package.json and CHANGLOG.md directly with a simple commit message indicating the version (No PR needed) (make changes on master branch if publishing a major revision or alpha/beta, use release branch (like release-4.0) if publishing a minor/bug fix revision (like v4.0.1), commit and push to corresponding origin branch (like origin/master or origin/release-4.0.0).
7. `git tag` the correct commit with correct tag and push the tag to remote server


[ ] switch to public profile using npmrc
[ ] clean node_modules folder and any dist* folder and rebuild (npm install or yarn)
[ ] `npm run` appropriate publishing script for beta or production release (e. g. in deck.gl, `publish-beta` for beta and `publish-prod` for production)

8. (Patch/Minor release only) Create a new entry and add details (refer existing entries of release) to release section on git-hub. (click on the tag you just created and add details)

	deck.gl : https://github.com/uber/deck.gl/releases
	luma.lg : https://github.com/uber/luma.gl/releases

### Publish Deck.gl lib

To publish a module to the @deck.gl namespace, you must sign in as the npmjs.com user 'deck.gl'. See separate (uber-internal) document for how to do this (and setting up an npm profile for deck.gl)

To publish using the deck.gl profile:

```
npmrc deck.gl
npm run publish-beta # or
npm run publish-prod
```

If you are publishing new alpha/beta/pro series, ie. when changing from 6.0.2 to 6.1.0-alpha, change version tag manually in deck.gl/lerna.json, for 6.1.0-alpha.1, change this version to 6.1.0-alpha.0, and follow above steps to publish.


### Publish Web-site

* Checkout the luma.gl or deck.gl/luma.gl branch (mostly the latest release, like. 4.1-release)
* cd to website folder.
* Remove node-modules and dist* folders.
* `yarn` or `npm install` then `npm run build`
* Copy the `dist` folder to a different place
* Optionally stage the website for verification/testing (see separate, uber-internal doc).
* Now checkout `gh-pages` branch (`git checkout gh-pages`)
* copy the contents of dist folder saved in step#5 to root folder (deck.gl/)
* `git add -u` (to make sure no untracked files are added) and commit (if commit fails, stash your changes, switch to master, yarn, switch back to gh-pages, apply stash and try commit again)
* `git push` to update remote `gh-pages` branch.

Congratulations, you have updated the deck.gl website.

When possible, first test the website on the (uber-internal) staging environment.
