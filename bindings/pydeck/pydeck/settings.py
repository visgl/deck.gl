settings = None


class Settings:
    """Global settings for pydeck

    Parameters
    ----------
    custom_libraries : list
        List of dictionaries of the format ``{'libraryName': 'LibraryName', 'resourceUri': 'deck.gl class URL'}``.
        For example, if there was a custom deck.gl Layer classed `TagmapLayer`
        bundled for distribution at the path `https://demourl.libpath/bundle.js`,
        one could load it into pydeck by doing the following:

        ```
        pydeck.settings.custom_libraries = [
            {
                'libraryName': 'tagmapLibrary',
                'resourceUri': 'https://demourl.libpath/bundle.js'
            }
        ]
        layer = pydeck.Layer(
            'TagmapLayer',  # Assumes that tagmapLibrary exports TagmapLayer
            # <... kwargs here ...>
        )
        ```

        A classic script bundle must assign ``window[libraryName]`` itself. To load an ES module instead,
        add ``'module': True`` to the entry: pydeck imports the module and exposes its namespace as
        ``window[libraryName]``. Either way, the library's uppercase-named exports become available as
        ``@@type`` values. See `Custom layers <custom_layers.html>`__.
    configuration : str
    default_layer_attributes : dict
    """

    def __init__(self, custom_libraries: list = None, configuration: str = None, default_layer_attributes: dict = None):
        assert not settings, "Cannot instantiate more than one Settings object"
        self.custom_libraries = custom_libraries or []
        self.configuration = configuration
        self.default_layer_attributes = default_layer_attributes

    def register_library(self, name, uri, module=False):
        """Register a custom deck.gl library to load alongside the deck.gl bundle

        Parameters
        ----------
        name : str
            Global name under which the library is exposed (``window[name]``).
        uri : str
            URL of the script bundle or ES module.
        module : bool, default False
            If ``True``, ``uri`` is loaded as an ES module and its exports are exposed as ``window[name]``.
            Otherwise ``uri`` must be a classic script that assigns ``window[name]`` itself.
        """
        entry = {"libraryName": name, "resourceUri": uri}
        if module:
            entry["module"] = True
        self.custom_libraries.append(entry)


if not settings:
    settings = Settings()
