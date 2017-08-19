# RFC: Reduce repo size

* **Author**: Ib Green
* **Date**: Aug, 2017
* **Status**: Draft


## Motivation

The deck.gl repo has been ground zero for intense development by a number of people for almost two years. It has grown quite big. There are a number of things we could remove from the repo, but it would require rewriting history. Rewriting history this is a big operation that can cause data loss and also affects forked repos, so it must be done carefully and timed well.


## Proposal: filter out data files from all commits

We now have separate repos that store our big data files. And we have removed them on master. But these files are still stored in our repo.

Run git rev-branch to remove data files and rewrite history


## Proposal: Remove pre-3.0 history

No one is interested in deck.gl commits pre 3.0 release.

But there are a lot of commits and in the early days we saved generated files (~0.5MB) in the repo for every commit.

ACTION:
* Squash/collapse pre-3.0 history into single commit on master and all release branches
* Remove or collapse/cleanup mentions of 2.0, in CHANGELOG, Whats new, Upgrade Guide etc
* Run git gc


## Proposal: Move our blog to a common "suite" repository

Makes no sense to maintain 4 separate blogs. Better we blog about the suite. So let's move the blog branch to a suite repository, since the blog branch contains images this would reduce it considerabley.

ACTION:
* Move blog branch to new repo and delete it from deck.gl


## Proposal: Rewrite history when making a major release

In consideration of the impact of history rewrites on forked repositories, it could make sense to decide to rewrite history when making a major release, as a major release is a "breaking change" in some sense and users are mentally prepared that some upgrade effort will be involved.


## Questions

* Impact on forks

