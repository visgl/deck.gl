def is_geopandas_df(obj):
    """Check if an object is a GeoPandas DataFrame

    Returns
    -------
    bool
        Returns True if object is a GeoPandas DataFrame and False otherwise
    """
    return obj.__class__.__module__ == "geopandas.geodataframe"


def is_pandas_df(obj):
    """Check if an object is a Pandas DataFrame

    Returns
    -------
    bool
        Returns True if object is a Pandas DataFrame and False otherwise
    """
    return obj.__class__.__module__ == "pandas.core.frame" and obj.to_records and obj.to_dict
