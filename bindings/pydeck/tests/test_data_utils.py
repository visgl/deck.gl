import pandas as pd

from pydeck.data_utils.viewport_helpers import (
    compute_view,
    bbox_to_zoom_level,
    euclidean,
    is_pandas_df,
    geometric_mean,
    get_bbox,
    get_n_pct,
    k_nearest_neighbors,
)

from pydeck import ViewState

POINTS = [[-1, 1], [-1, -1], [1, -1], [1, 1], [100, 100]]


def test_euclidean():
    EPSILON = 0.001
    assert euclidean((3, 6, 5), (7, -5, 1)) - 12.369 < EPSILON


def test_bbox_to_zoom_level():
    assert bbox_to_zoom_level(((-222.1875, -31.503629305773018), (-0.3515625, 70.90226826757711))) == 1
    assert bbox_to_zoom_level(((-122.12, 37.71), (-122.56, 37.83))) == 9
    assert bbox_to_zoom_level(((-122.44091, 37.781), (-122.44092, 37.782))) == 18


def test_geometric_mean():
    assert geometric_mean([[0, 0], [10, 10]]) == (5, 5)


def test_k_nearest_neighbors():
    assert k_nearest_neighbors(POINTS, [99, 99], 1) == [[100, 100]]


def test_get_n_pct():
    assert sum([1 for x in get_n_pct(POINTS, 0.8) if x in POINTS]) == 4
    assert sum([1 for x in get_n_pct(POINTS) if x in POINTS]) == 5


def test_get_bbox():
    assert get_bbox([[0, 1], [10, 100], [1, 1]]) == ((0, 100), (10, 1))


def test_is_pandas_df():
    assert is_pandas_df(pd.DataFrame())


def test_compute_view():
    actual = compute_view(POINTS, 0.95, ViewState)
    actual_pandas = compute_view(pd.DataFrame(POINTS), 0.95, ViewState)
    EXPECTED = '{"latitude": 20.0, "longitude": 20.0, "zoom": 7}'
    assert str(actual) == str(actual_pandas)
    assert str(actual) == str(EXPECTED)
