from pydeck_carto.styles import (
    color_bins,
    color_categories,
    color_continuous,
)


def test_color_bins():
    assert color_bins(
        attr="pct_higher_ed", domain=[0, 20, 30, 40, 50, 60, 70], colors="PinkYl"
    ).serialize() == {
        "@@function": "colorBins",
        "attr": "pct_higher_ed",
        "domain": [0, 20, 30, 40, 50, 60, 70],
        "colors": "PinkYl",
        "nullColor": [204, 204, 204],
    }


def test_color_categories():
    domain_values = [
        "Multi-Family Walk-Up Buildings",
        "Multi-Family Elevator Buildings",
        "Mixed Residential And Commercial Buildings",
        "Parking Facilities",
        "1 and 2 Family Buildings",
        "Commercial and Office Buildings",
        "Vacant Land",
        "Public Facilities and Institutions",
        "Transportation and Utility",
        "Open Space and Outdoor Recreation",
        "Industrial and Manufacturing",
    ]

    assert color_categories(
        attr="landuse_type", domain=domain_values, colors="Bold"
    ).serialize() == {
        "@@function": "colorCategories",
        "attr": "landuse_type",
        "domain": domain_values,
        "colors": "Bold",
        "nullColor": [204, 204, 204],
        "othersColor": [119, 119, 119],
    }


def test_color_continuous():
    domain_values = [70, 75, 80, 85, 90, 95, 100]

    assert color_continuous(
        attr="value", domain=domain_values, colors="Peach"
    ).serialize() == {
        "@@function": "colorContinuous",
        "attr": "value",
        "domain": domain_values,
        "colors": "Peach",
        "nullColor": [204, 204, 204],
    }
