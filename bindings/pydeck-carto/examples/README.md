# pydeck-carto examples

## CARTO credentials

To generate CARTO Auth tokens in pydeck-carto you need to create a `carto_credentials.json` file with the following content:

```json
{
    "api_base_url": "https://gcp-us-east1.api.carto.com",
    "client_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "client_secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

To obtain the file's content, go to the Developers section in the CARTO Dashboard. More information in https://docs.carto.com/carto-user-manual/developers/carto-for-developers/#carto-for-developers.

**API Base URL**

You can directly copy the *API Base URL*. It will be different depending on the region where your account is located.

**Built applications**

Create a new "Machine to Machine" application to generate the *Client ID* and *Client Secret*.

- Click on "+ Create new".
- Fill in the name and description. The URL is irrelevant in this case, so feel free to use something like https://example.domain.com.
- Open the "Advanced Settings" menu.
- In "Application Type" select "Machine to Machine".
- Click "Save" and check that your application is listed.

From the list, copy the new *Client ID* and *Client Secret* and add them into your credentials file.
