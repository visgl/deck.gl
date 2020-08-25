CHANGELOG
================

Releases and associated GitHub PRs for pydeck are documented here.

0.5 Releases
------------

0.5.0b1 - Aug 23 2020
^^^^^^^^^^^^^^^^^^^^
- Add generic event handling (#4848)

0.4 Releases
------------

0.4.1 - Aug 3 2020
^^^^^^^^^^^^^^^^^^
- Correct data buffer issue (#4832)

0.4.0 - Jul 23 2020
^^^^^^^^^^^^^^^^^^
- Lock to @deck.gl/jupyter-widget@~8.2.*
- Suppress warning for IFrame usage (#4775)
- Fix iframe rendering width's default value (#4764)
- Simplify API for Deck.to_html() (#4743)
- Improve integration for GeoPandas (#4744)

0.4.0b2 - Jun 8 2020
^^^^^^^^^^^^^^^^^^^^
- Fix JupyterLab 2 bug (#4652)

0.4.0b1 - Jun 4 2020
^^^^^^^^^^^^^^^^^^^^
- Add Google Maps base maps (#4632)
- Support JupyterLab v2 (#4573)
- Write offline JS bundle with UTF-8 encoding (#4577)

0.3 Releases
-----------------

0.3.1 - Apr 20 2020
^^^^^^^^^^^^^^^^^^^
- Lock pydeck to deck.gl ~8.1.*

0.3.0 - Apr 9 2020
^^^^^^^^^^^^^^^^^^
- Add Black formatter to pydeck (#4453)

0.3.0b4 - Apr 1 2020
^^^^^^^^^^^^^^^^^^^^
- Lock to deck.gl v8.2.0-alpha.1

0.3.0b3 - Mar 28 2020
^^^^^^^^^^^^^^^^^^^^^
- Fix binary data bug (#4416)

0.3.0b2 - Mar 4 2020
^^^^^^^^^^^^^^^^^^^^
- Support rendering in Google Collab (#4337)

0.3.0b1 - Feb 26 2020
^^^^^^^^^^^^^^^^^^^^^
- Add support for dynamic deck.gl custom Layer registration (#4233)
- Cut unused colors module (#4257)
- Add support for background colors in standalone HTML renderer (#4242)
- Support binary data transport (#4167)

0.2 Releases
---------------

0.2.1 - Jan 28 2020
^^^^^^^^^^^^^^^^^^^
- Update to 0.2.1 (#4209) by removing deprecated pytest-runner to allow for conda-forge installation
- ArcLayer, BitmapLayer, ColumnLayer examples (#4189)
- Reduce JupyterLab bundle size (#4110)
- Update documentation for 0.2.0 (#4102)
- Simplify setup.py and add JupyterLab installation instructions (#4096)
- Add pydeck release checklist (#4083)

0.2.0 - Jan 4 2020
^^^^^^^^^^^^^^^^^^
- Add CDN-hosted bundle for standalone HTML rendering (#4003)
- Update for new @deck.gl/json API and add additional tests (#4020)
- Make a single bundle for use in standalone and Jupyter rendering (#4010)
- Set fewer defaults within Python API (#3960)
- Enable JupyterLab (#3638)
- Optionally surface pydeck warnings in widget UI (#3785)

0.1 Releases
---------------

0.1.dev5 - Sep 26 2019
^^^^^^^^^^^^^^^^^^^^^^
- Allow user to modify tooltip text
- Remove addition operator overload from pydeck (#3697)
- Hard pydeck iframe height (#3684)
- Update S2 library within pydeck (#3678)
- Set default notebook width to 100% (#3639)
- Update pydeck setup.py to enable a production build (#3637)
- Allow users to hide tooltip (#3626)
- Update pydeck tooltip style and modularize the Jupyter widget tooltip
- Update pydeck setup.py to include standalone require.js template
