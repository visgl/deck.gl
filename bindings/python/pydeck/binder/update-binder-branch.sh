#!/bin/bash
branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
masterBranch=master
releaseBranch=binder
git checkout -b $releaseBranch $masterBranch
git push
