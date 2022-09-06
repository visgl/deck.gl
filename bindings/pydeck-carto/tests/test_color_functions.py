from pydeck_carto.layer import CartoColorBins, CartoColorCategories, CartoColorContinuous


def test_color_bins():
    assert CartoColorBins(attr="pct_higher_ed", domain=[0, 20, 30, 40, 50, 60, 70],
                          colors="PinkYl").to_deck() == {
               "@@function": "colorBins",
               "attr": "pct_higher_ed",
               "domain": [0, 20, 30, 40, 50, 60, 70],
               "colors": "PinkYl"
           }


def test_color_categories():
    domain_values = [
        'Multi-Family Walk-Up Buildings',
        'Multi-Family Elevator Buildings',
        'Mixed Residential And Commercial Buildings',
        'Parking Facilities',
        '1 and 2 Family Buildings',
        'Commercial and Office Buildings',
        'Vacant Land',
        'Public Facilities and Institutions',
        'Transportation and Utility',
        'Open Space and Outdoor Recreation',
        'Industrial and Manufacturing'
    ]

    assert CartoColorCategories(attr="landuse_type",
                                domain=domain_values,
                                colors="Bold").to_deck() == {
               "@@function": "colorCategories",
               "attr": "landuse_type",
               "domain": domain_values,
               "colors": "Bold"
           }


def test_color_continuous():
    domain_values = [70, 75, 80, 85, 90, 95, 100]

    assert CartoColorContinuous(attr="value", domain=domain_values,
                                colors="BluYl").to_deck() == {
               "@@function": "colorContinuous",
               "attr": "value",
               "domain": domain_values,
               "colors": "BluYl"
           }
