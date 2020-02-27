import pydeck


DATA_URL = None

Layer(
    'PointCloudLayer',
    data=DATA_URL,
    use_binary_transport=True
)

Layer(
    'LineLayer',
)

print('lorem ipsum')
