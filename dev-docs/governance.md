# deck.gl Community Governance Guidelines

- Author: Xiaoji Chen
- Initial draft: December 2019
- Proposed: March 2020
- Approved: N/A


## Overview

There are three types of roles in the community that maintains this project:

- *Steering committee member*: A core maintainer of the project, provides leadership and oversees feature and technical directions.
- *Maintainer*: A core developer of the project, oversees one or more feature areas, and shares the responsibility of release. Also referred to as a "feature owner."
- *Contributor*: A casual participant on GitHub, including reporting bugs; answering questions; developing a third-party module that extends the capabilities of ours; creating public examples; submitting a PR for documentation enhancement or minor bug fix. Always welcome.

The list of current steering committee members and maintainers should be documented in the project’s [developer guide](/dev-docs/README.md).


## The Steering Committee

### 1a. A steering committee member’s privileges

All of a maintainer's privileges (2a), and the following:

- Voting right on the admittance/removal of steering committee members and maintainers
- Administrator to the project's repo, and owner to the NPM organization
- Approving external communications
- Final veto power in roadmap planning

### 1b. A steering committee member’s responsibilities

- Manage project members and privileges according to the governance guidelines;
- Ensure that the dev tools of the repo work consistently and as expected;
- Organize and moderate community discussions, enforce the code of conduct;
- Ensure that the dev process is followed by all contributors;
- Ensure the consistency and quality of the documentation;
- Manage blog posts, material for conference and meetup talks, and other brand presence.

### 1c. Becoming a steering committee member

A steering committee member should be

- A long time maintainer to the project;
- Recognized by the community for their depth of knowledge and community engagement;
- Agrees to dedicate time to perform their committee duties.

An existing maintainer can be nominated to join the steering committee by other steering committee members. The nomination is formally submitted as a PR to update the [developer guide](/dev-docs/README.md#governance). Nominations are approved by the steering committee.

###  1d. Leaving the steering committee

If a steering committee member can/will no longer perform their duties, they can be removed from the steering committee by the consensus of the rest of the steering committee members.


## Maintainers

### 2a. A maintainer's privileges

- Roadmap planning
  + Submit, approve and comment on RFCs.
  + Participate in the planning meeting at the beginning of each release cycle (3a).
  + Join the developer channel for the ongoing technical discussions, development activities and release updates.
- Write permission to the repo, and membership to the NPM organization
  + Merge commits, label/assign/close issues, cut release branches and publish new versions.
  + Push to a branch in the main repo.
  + Be added as a code reviewer by other contributors.
- Represent deck.gl publicly
  + Publish articles in the [vis-gl blog](https://medium.com/vis-gl).
  + Promote deck.gl at conferences and meetups.


### 2b. A maintainer's responsibilities

- Participate in the planning meetings and RFC reviews concerning the self-declared feature area(s);
- Be responsive to bug reports, user questions, and code review requests in the self-declared feature area(s);
- Comply with the projects’ [development process](/dev-docs/README.md).


### 2c. Becoming a maintainer

Any contributor to the project can self-nominate to become a maintainer if they:

- Demonstrate familiarity with the project and expertise in the relevant domain (e.g. WebGL, 3D tiles, Google Maps, React, etc.):
  + Obtain the endorsement by an existing maintainer, or
  + Have submitted at least one substantial PR (a complete feature or major bug fix) and remained active for more than 3 months in online discussions and relevant projects
- Agree to the continuous maintenance of the self-declared feature area(s).

The nomination is formally submitted as a PR to update the [developer guide](/dev-docs/README.md#governance), with self-declared ownership of one or more feature areas. Nominations are approved by the steering committee.


### 2d. Removal of the maintainer status

A maintainer can be removed of their privileges if they:

- Resigns; or
- Repeatedly fails to perform their responsibilities (2b); or
- Violates the project's [code of conduct](/CODE_OF_CONDUCT.md).

The removal will be approved by the consensus of the steering committee.


## Governance Practice

The following process is followed by the steering committee and maintainers in addition to the existing [developer process](/dev-docs/README.md).

### 3a. Roadmap planning

Release roadmaps track high-level project directions that span multiple releases to implement and/or affect multiple feature areas. The steering committee meets once per release cycle to coordinate feature development and discuss the technical approaches. All maintainers are invited to this meeting to pitch ideas or comment on proposals.

The project generally does not move forward with a proposal unless the meeting reaches consensus. Should there be unresolvable disagreement despite the best efforts, members of the steering committee have the final deciding power.

Roadmaps are committed to the repo after the meeting and are the governing documents for development till the next planning meeting.

### 3b. RFC

Following the roadmap, an RFC must be submitted either as a PR or a GitHub issue before each feature/breaking change is implemented. It is expected to detail all proposed changes to the public API, outline the planned implementation, and evaluate the impact on existing use cases. Even with approval, an RFC should remain open for at least 5 business days to allow comments from all maintainers.


### 3c. Code review

A PR must request the code review from all feature owners whose codebase is directly and indirectly affected. The PR may merge if approved by all reviewers, or at least one approval along with “lazy consensus” (automatically obtained if 5 business days have passed since submission, unless someone objects).


### 3d. Coordination

Dedicated Slack channels will be established for the project's maintainers. Slack communication is encouraged for casual coordination and the sharing of business-sensitive information.
