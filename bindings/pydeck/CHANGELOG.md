### pydeck CHANGELOG

0.3.0b2 - March 4 2020
=======
- Support rendering in Google Collab (#4337)

0.3.0b1
=======
- Add support for dynamic deck.gl custom Layer registration (#4233)
- Cut unused colors module (#4257)
- Add support for background colors in standalone HTML renderer (#4242)
- Support binary data transport (#4167)

0.2.1
=====
- Update to 0.2.1 (#4209) by removing deprecated pytest-runner to allow for conda-forge installation
- ArcLayer, BitmapLayer, ColumnLayer examples (#4189)
- Reduce JupyterLab bundle size (#4110)
- Update documentation for 0.2.0 (#4102)
- Simplify setup.py and add JupyterLab installation instructions (#4096)
- Add pydeck release checklist (#4083)

0.2.0
=====
- Add CDN-hosted bundle for standalone HTML rendering (#4003)
- Update for new @deck.gl/json API and add additional tests (#4020)
- Make a single bundle for use in standalone and Jupyter rendering (#4010)
- Set fewer defaults within Python API (#3960)
- Enable JupyterLab (#3638)
- Optionally surface pydeck warnings in widget UI (#3785)

0.1.dev5
========
- Allow user to modify tooltip text
- Remove addition operator overload from pydeck (#3697)
- Hard pydeck iframe height (#3684)
- Update S2 library within pydeck (#3678)
- Set default notebook width to 100% (#3639)
- Update pydeck setup.py to enable a production build (#3637)
- Allow users to hide tooltip (#3626)
- Update pydeck tooltip style and modularize the Jupyter widget tooltip
- Update pydeck setup.py to include standalone require.js template
