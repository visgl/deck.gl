name: Bug Report
description: Something does not work as expected
title: ''
labels: bug
assignees: ''
body:
- type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Filling out this form will help us triage and investigate issues. If you are unsure whether it is a bug in your own implementation, or the library itself, consider starting a conversation in Discussions instead.
- type: textarea
  attributes:
    label: Description
    description: What you're experiencing.
    render: markdown
  validations:
    required: true
- type: checkboxes
  id: flavor
  attributes:
    label: Flavors
    description: Are you using one of the following platform-specific APIs?
    options:
      - label: React
      - label: Python/Jupyter notebook
      - label: MapboxLayer
      - label: GoogleMapsOverlay
      - label: CartoLayer
      - label: DeckLayer/DeckRenderer for ArcGIS
- type: textarea
  attributes:
    label: Expected Behavior
    description: What do you expect to see?
  validations:
    required: false
- type: textarea
  attributes:
    label: Steps to Reproduce
    description: |
      Providing the following could help us resolve this issue faster:
        - A Codepen that reproduces the behavior. A good starting point is the "edit in CodePen" links in the layer documentations. 
        - A sample of your dataset
    render: markdown
  validations:
    required: true
- type: textarea
  attributes:
    label: Environment
    description: |
      Example:
        - **Framework version**: deck.gl@8.3.0
        - **Browser**: Chrome 78.0
        - **OS**: iOS 15.1
    value: |
        - Framework version:
        - Browser:
        - OS:
    render: markdown
  validations:
    required: true
- type: textarea
  attributes:
    label: Logs
    description: Check the browser console for any relevant errors or warnings.
  validations:
    required: false
