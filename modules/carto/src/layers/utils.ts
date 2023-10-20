/**
 * Adds access token to Authorization header in loadOptions
 */
export function injectAccessToken(loadOptions: any, accessToken: string): void {
  if (!loadOptions?.fetch?.headers?.Authorization) {
    loadOptions.fetch = {
      ...loadOptions.fetch,
      headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
    };
  }
}
