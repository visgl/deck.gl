This folder supports the interactive notebook examples on mybinder.org.

These commands can serve to update those examples

```bash
git checkout binder
git merge master
# Note that this clobbers the node Dockerfile at the root
ln -s Dockerfile ../../../../Dockerfile
git push
```
