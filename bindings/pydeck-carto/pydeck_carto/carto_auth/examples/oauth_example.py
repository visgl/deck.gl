from pydeck_carto import CartoAuth


carto_auth = CartoAuth.from_oauth()
creds = carto_auth.credentials()

print(f"The credentials created from auth are: {creds}")
