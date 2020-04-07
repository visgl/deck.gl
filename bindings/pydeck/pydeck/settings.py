settings = None


class Settings:
    """Global settings for pydeck

    Parameters
    ----------
    custom_libraries : list
        List of dictionaries of the format {'libraryName': 'LibraryName', 'resouceUri': 'deck.gl class URL'}.
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
    """

    def __init__(self, custom_libraries=None):
        assert not settings, "Cannot instantiate more than one Settings object"
        self.custom_libraries = custom_libraries


if not settings:
    settings = Settings()
