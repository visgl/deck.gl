# Updating the binder examples

If you don't plan to develop or maintain pydeck, feel free to ignore this document and directory.

This folder supports the interactive notebook examples on mybinder.org.

These commands can serve to update those examples from the root of this repository

```bash
# Delete binder branch locally
git push origin --delete binder
# Delete binder remote binder branch
git branch -d binder
git checkout binder
# Note that this next command clobbers the node Dockerfile at the root
ln -s Dockerfile bindings/python/pydeck/binder/Dockerfile
# Provide a root level link to the notebook examples
ln -s notebook_examples bindings/python/pydeck/examples
ln -s .dockerignore bindings/python/pydeck/binder/dockerignore
git push
```

Alternately, you can rebase to `master` on the current `binder` branch and push those changes to `binder`.

Finally, navigate to https://mybinder.org/v2/gh/uber/deck.gl/binder and verify that the examples function correctly.
