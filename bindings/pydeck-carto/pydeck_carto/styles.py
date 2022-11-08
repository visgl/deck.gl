import pydeck as pdk

from typing import Union


def color_bins(
    attr: str,
    domain: list,
    colors: Union[str, list] = "PurpOr",
    null_color: list = [204, 204, 204],
):
    """Helper function for quickly creating a color bins style.

    Data values of each attribute are rounded down to the nearest value
    in the domain and are then styled with the corresponding color.

    Parameters
    ----------
    attr : str
        Attribute or column to symbolize by.
    domain : list
        Assign manual class break values.
    colors : Union[str, list], optional
        Color assigned to each domain value.
        - str: A valid named CARTOColors palette.
        - list: Array of colors in RGBA ``[ [r, g, b, [a]] ]``.
        Default is PurpOr.
    null_color : list, optional
        Color for null values.
        Default is [204, 204, 204].
    """
    return pdk.types.Function(
        "colorBins",
        **{"attr": attr, "domain": domain, "colors": colors, "nullColor": null_color}
    )


def color_categories(
    attr: str,
    domain: list,
    colors: Union[str, list] = "PurpOr",
    null_color: list = [204, 204, 204],
    others_color: list = [119, 119, 119],
):
    """Helper function for quickly creating a color category style.

    Data values of each attribute listed in the domain are mapped one to one
    with corresponding colors in the range.

    Parameters
    ----------
    attr : str
        Attribute or column to symbolize by.
    domain : list
        Category list. Must be a valid list of categories.
    colors : Union[str, list], optional
        Color assigned to each domain value.
        - str: A valid named CARTOColors palette.
        - list: Array of colors in RGBA ``[ [r, g, b, [a]] ]``.
        Default: PurpOr.
    null_color : list, optional
        Color for null values.
        Default is [204, 204, 204].
    others_color : list, optional
        Fallback color for a category not correctly assigned.
        Default is [119, 119, 119].
    """
    return pdk.types.Function(
        "colorCategories",
        **{
            "attr": attr,
            "domain": domain,
            "colors": colors,
            "nullColor": null_color,
            "othersColor": others_color,
        }
    )


def color_continuous(
    attr: str,
    domain: list,
    colors: Union[str, list] = "PurpOr",
    null_color: list = [204, 204, 204],
):
    """Helper function for quickly creating a color continuous style.

    Data values of each field are interpolated linearly across values in the domain
    and are then styled with a blend of the corresponding color in the range.

    Parameters
    ----------
    attr : str
        Attribute or column to symbolize by.
    domain : list
        Attribute domain to define the data range.
    colors : Union[str, list], optional
        Color assigned to each domain value.
        - str: A valid named CARTOColors palette.
        - list: Array of colors in RGBA ``[ [r, g, b, [a]] ]``.
        Default is PurpOr.
    null_color : list, optional
        Color for null values.
        Default is [204, 204, 204].
    """
    return pdk.types.Function(
        "colorContinuous",
        **{"attr": attr, "domain": domain, "colors": colors, "nullColor": null_color}
    )
