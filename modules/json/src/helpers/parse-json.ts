// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Accept JSON strings by parsing them
// TODO - use a parser that provides meaninful error messages
export default function parseJSON(json) {
  return typeof json === 'string' ? JSON.parse(json) : json;
}
