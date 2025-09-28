// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './app';

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<App />);
