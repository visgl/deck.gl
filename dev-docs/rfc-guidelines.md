# RFC Guidelines

Implementation of non-trivial new features should typically be started off with the creation of an RFC (Request for Comments) to make sure we have a complete story before making big modifications to the code base. It also allow the bigger team (as well as the community) to stay engaged, comment and contribute insights.


## RFC structure

It is recommended that an RFC follows roughly the following structure:

* Header with author(s), date, status
* References to related RFCs and docs
* Summary: 1-2 line summary of what is being proposed
* Motivation: Short explanation of why the proposed functionality/change is valuable
* Marketing Pitch: A section that can be copied into the website "What's New" page that shows how this feature will be pitched to users. (The intention is of course to make the pitch easy to understand, and as compelling and applicable to as a wide audience as possible).
* Technical Overview
* Proposals. Hint: It is ideal if proposals can be written in the form of clean documentation additions, as this saves a lot of work and typing later when updating the docs to cover the new feature.
* Open Issues: The author should try to solve as many of these off-line as possible to reduce the burden on reviewers, but any remaining ones can be listed here.
* Future Extensions: It is always encouraging to see that a proposed feature is not a dead end and that more can be built on it. Any bullets here can later be a seed for a second, successor RFC.
* Alternatives (Options): Especially if alternative ideas have already been floated during discussions etc, it is nice to mention them and briefly explain why they were not chosen.

Encouraged:
* API examples. diagrams if it makes sense


## Reviews

Reviews are a crucial part of the RFC process. The core developers will review RFCs (and of course, comments from the community are always welcome). Recommended review criteria:

* Is the marketing pitch resonate? Can anything be tweaked to make it more "relevant"?
* Is it a clear proposal? If mainly a list of options, it should be marked as "early draft, not ready for review". The reviewers should be able to critique actual proposals, not have to make their own choices?
* Use cases - is the proposal generic enough
* Is the scope reasonable? If too big, any way to break into parallel or sequential RFCs?
* Does it consider all angles (e.g. rendering/picking/event handling/...).
* Complexity - Does it add much complexity? Is it justified, considering "tax" on maintenance and future features?
* Backwards compatibility?

The above criteria are in addition to the primary critical technical/subject-matter scrutiny.


## Status

RFCs should be listed in the frameworks RFC overview page. Since RFCs can be in very different stages, ideally each RFC should be listed together with a "status" chosen from the following set:

| RFC Status       | Description |
| ---              | --- |
| **Proposed**     | Call for an RFC to be written, not yet available. |
| **Draft**        | Work-in-progress, not ready for formal review |
| **Pre-Approved** | No major initial objections, draft pre-approved for prototyping |
| **Review**       | Ready for formal review |
| **Approved**     | Approved, ready for implementation |
| **Experimental** | Approved and implemented as experimental API |
| **Implemented**  | Approved and implemented (as officially supported API) |
| **Deferred**     | Review uncovered reasons not to proceed at this time |
| **Rejected**     | Review uncovered reasons not to proceed |
