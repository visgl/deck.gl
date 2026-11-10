# Merge queue

The `test` workflow runs for pull requests and `merge_group: checks_requested` events
against `master`. GitHub checks the queued changes together with the latest target branch
before merging them. Checkout uses the event's merge-group commit, and the job names stay
the same as the pull-request checks.

## Activate after the workflow change lands

A repository administrator must enable the queue in GitHub; merging the workflow change
alone does not change branch protection.

1. Open **Settings → Branches**, edit the `master` protection rule, and enable **Require
   merge queue**. A ruleset targeting `master` can require the queue instead.
2. Select **Squash** as the queue's merge method to preserve linear history.
3. Keep the existing required checks, `test-coverage` and `test-python`, and the approval
   requirement. The queue validates the combined commit instead of requiring contributors
   to update approved PR branches manually.
4. Set the status-check timeout above the normal CI duration, including runner queue time.
5. Enqueue an approved PR with **Merge when ready** and confirm the `test` workflow runs
   on its merge-group commit before the queue merges it.

If concurrency cancellation is added to CI later, key it by the event/ref so separate
merge groups do not cancel each other's required checks. Deployment workflows continue
to run only on their existing push or manual triggers.

See GitHub's [merge queue administration guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
and [`merge_group` event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#merge_group).
