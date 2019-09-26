# Framework publish checklist


## Create NPM account

1. Get an account at [npm](https://npmjs.com). Ask framework owners to be added to the proper organizations.
2. Install [npmrc](https://www.npmjs.com/package/npmrc) and follow its instructions to create a public profile.


## Patch release

1. Switch to the latest release branch.
  ```
  git checkout <X.x>-release
  git pull
  git log
  ```
2. Check all the bug/feature tickets under the current github milestone. Make sure the PRs are all cherry-picked to the release branch.

3. If there were several conflicts in cherry-pick process and you have to make several changes in process of selecting partial changes from a PR, create a PR, get teams review, otherwise just push all changes into release branch directly.

4. Test the branch by running `npm run test`, website examples and layer-browser (if deck.gl).

5. Update CHANGELOG.md, making sure all commits and PRs merged after release are recorded properly:
<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/dev-docs/publish-guideline/image4.png" />
    <p><i>Image Text</i></p>
  </div>
</div>

6. Make sure you are using the correct NPM profile, then run the publish script:
  ```
  npmrc public
  git add .
  npm run publish prod
  ```
  Double check the version numbers before confirming to publish.


## Beta release

1. Switch to the master branch.
  ```
  git checkout master
  git pull
  ```

2. Test the branch by running `npm run test`, website examples and layer-browser (if deck.gl).

3. Update CHANGELOG.md.

4. Only if this is the first pre-release of a new version: open `lerna.json`, change the `version` field to `<version>-alpha.0` or `<version>-beta.0`.

5. Make sure you are using the correct NPM profile, then run the publish script:
  ```
  npmrc public
  git add .
  npm run publish beta
  ```
  Double check the version numbers before confirming to publish.


## Major/Minor release


### Cut the release branch

1. The latest release branch should be created by duplicating the master branch:
  ```
  git checkout master
  git pull
  git checkout -b <X.x>-release
  ```
2. Update the links in documentation and website to point to the current branch:
  ```
  npm run update-release-branch <X.x>
  ```
3. Push to upstream:
  ```
  git push
  ```

### Build the website

4. Under the release branch:
 ```
 cd website
 rm -rf node_modules
 yarn
 yarn build
 ```

### Pre-release checks

5. The files inside `website/dist` are the production build of the website. Stage the website on a static server to test in all supported OS and browsers.

6. Test the branch by running `npm run test`, website examples and layer-browser (if deck.gl).

7. Check all the bug/feature tickets under the current github milestone. Make sure they are properly listed in [What's New](/docs/whats-new.md) and [Upgrade Guide](/docs/upgrade-guide.md). Open a PR to update these pages.

8. Update CHANGELOG.md.

9. Make sure you are using the correct NPM profile, then run the publish script:
  ```
  npmrc public
  git add .
  npm run publish prod
  ```
  Double check the version numbers before confirming to publish.


### Publish the website

* Copy the content of `website/dist` folder to a different place
* Now checkout `gh-pages` branch (`git checkout gh-pages`)
* copy the contents of dist folder saved in step#5 to root folder (deck.gl/)
* `git add -u` (to make sure no untracked files are added) and commit (if commit fails, stash your changes, switch to master, yarn, switch back to gh-pages, apply stash and try commit again)
* `git push` to update remote `gh-pages` branch.

Congratulations, you have updated the deck.gl website.

When possible, first test the website on the (uber-internal) staging environment.

Also check "special instructions" below.


### Special Instructions

#### JSON Browser

To build the json-browser (available on http://deck.gl/json):

```
cd deck.gl
yarn
cd examples/json-browser/pure-js
yarn
yarn build
```

To copy it into the gh-pages branch

```
cp build/json-browser.min.js /tmp
cp index.html /tmp
cd -
git checkout gh-pages
mkdir -p json
cd json
cp /tmp/index.html build/json-browser.min.js json
```

Also, add mapbox token to the index.html file.
