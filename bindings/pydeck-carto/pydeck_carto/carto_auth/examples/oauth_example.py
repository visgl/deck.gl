from pydeck_carto import CartoAuth


carto_auth = CartoAuth.from_oauth(using_cache=False)
creds = carto_auth.get_layer_credentials()

print(f"The credentials created from auth are: {creds}")
