def is_pandas_df(obj):
    """Check if an object is a Pandas DataFrame

    Returns
    -------
    bool
        Returns True if object is a Pandas DataFrame and False otherwise
    """
    # Use duck-typing approach that works with both pandas 2.x and 3.x
    # Check for DataFrame-specific methods and the class name
    try:
        return (
            obj.__class__.__name__ == "DataFrame"
            and hasattr(obj, "to_records")
            and hasattr(obj, "to_dict")
            and hasattr(obj, "columns")
            and callable(getattr(obj, "to_records", None))
            and callable(getattr(obj, "to_dict", None))
        )
    except (AttributeError, TypeError):
        return False


def has_geo_interface(obj):
    return hasattr(obj, "__geo_interface__")


def records_from_geo_interface(data):
    """Un-nest data from object implementing __geo_interface__ standard"""
    flattened_records = []
    for d in data.__geo_interface__.get("features"):
        record = d.get("properties", {})
        geom = d.get("geometry", {})
        record["geometry"] = geom
        flattened_records.append(record)
    return flattened_records
