// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// deck.gl, MIT license
// Attributions:
// Copyright 2022 Foursquare Labs, Inc.
/* eslint-disable camelcase */ // Some WMS parameters are not in camel case
/* global setTimeout, clearTimeout */
import { CompositeLayer, COORDINATE_SYSTEM, _deepEqual as deepEqual } from '@deck.gl/core';
import { BitmapLayer } from '@deck.gl/layers';
import { createDataSource } from '@loaders.gl/core';
import { ImageSource, WMSSource } from '@loaders.gl/wms';
import { WGS84ToPseudoMercator } from "./utils.js";
const defaultProps = {
    id: 'imagery-layer',
    data: '',
    serviceType: 'auto',
    srs: 'auto',
    layers: { type: 'array', compare: true, value: [] },
    onMetadataLoad: { type: 'function', value: () => { } },
    // eslint-disable-next-line
    onMetadataLoadError: { type: 'function', value: console.error },
    onImageLoadStart: { type: 'function', value: () => { } },
    onImageLoad: { type: 'function', value: () => { } },
    onImageLoadError: {
        type: 'function',
        compare: false,
        // eslint-disable-next-line
        value: (requestId, error) => console.error(error, requestId)
    }
};
/**
 * The layer is used in Hex Tile layer in order to properly discard invisible elements during animation
 */
export class WMSLayer extends CompositeLayer {
    /** Returns true if all async resources are loaded */
    get isLoaded() {
        // Track the explicit loading done by this layer
        return this.state?.loadCounter === 0 && super.isLoaded;
    }
    /** Lets deck.gl know that we want viewport change events */
    shouldUpdateState() {
        return true;
    }
    initializeState() {
        // intentionally empty, initialization is done in updateState
        this.state._nextRequestId = 0;
        this.state.lastRequestId = -1;
        this.state.loadCounter = 0;
    }
    updateState({ changeFlags, props, oldProps }) {
        const { viewport } = this.context;
        // Check if data source has changed
        if (changeFlags.dataChanged || props.serviceType !== oldProps.serviceType) {
            this.state.imageSource = this._createImageSource(props);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._loadMetadata();
            this.debounce(() => this.loadImage(viewport, 'image source changed'), 0);
        }
        else if (!deepEqual(props.layers, oldProps.layers, 1)) {
            this.debounce(() => this.loadImage(viewport, 'layers changed'), 0);
        }
        else if (changeFlags.viewportChanged) {
            this.debounce(() => this.loadImage(viewport, 'viewport changed'));
        }
    }
    finalizeState() {
        // TODO - we could cancel outstanding requests
    }
    renderLayers() {
        // TODO - which bitmap layer is rendered should depend on the current viewport
        // Currently Studio only uses one viewport
        const { bounds, image, lastRequestParameters } = this.state;
        return (image &&
            new BitmapLayer({
                ...this.getSubLayerProps({ id: 'bitmap' }),
                _imageCoordinateSystem: lastRequestParameters.srs === 'EPSG:4326'
                    ? COORDINATE_SYSTEM.LNGLAT
                    : COORDINATE_SYSTEM.CARTESIAN,
                bounds,
                image
            }));
    }
    async getFeatureInfoText(x, y) {
        const { lastRequestParameters } = this.state;
        if (lastRequestParameters) {
            // @ts-expect-error Undocumented method
            const featureInfo = await this.state.imageSource.getFeatureInfoText?.({
                ...lastRequestParameters,
                query_layers: lastRequestParameters.layers,
                x,
                y,
                info_format: 'application/vnd.ogc.gml'
            });
            return featureInfo;
        }
        return '';
    }
    _createImageSource(props) {
        if (props.data instanceof ImageSource) {
            return props.data;
        }
        if (typeof props.data === 'string') {
            return createDataSource(props.data, [WMSSource], {
                core: {
                    type: props.serviceType,
                    loadOptions: props.loadOptions
                }
            });
        }
        throw new Error('invalid image source in props.data');
    }
    /** Run a getMetadata on the image service */
    async _loadMetadata() {
        const { imageSource } = this.state;
        try {
            this.state.loadCounter++;
            const metadata = await imageSource.getMetadata();
            // If a request takes a long time, it may no longer be expected
            if (this.state.imageSource === imageSource) {
                this.getCurrentLayer()?.props.onMetadataLoad(metadata);
            }
        }
        catch (error) {
            this.getCurrentLayer()?.props.onMetadataLoadError(error);
        }
        finally {
            this.state.loadCounter--;
        }
    }
    /** Load an image */
    async loadImage(viewport, reason) {
        const { layers, serviceType } = this.props;
        // TODO - move to ImageSource?
        if (serviceType === 'wms' && layers.length === 0) {
            return;
        }
        const bounds = viewport.getBounds();
        const { width, height } = viewport;
        const requestId = this.getRequestId();
        let { srs } = this.props;
        if (srs === 'auto') {
            // BitmapLayer only supports LNGLAT or CARTESIAN (Web-Mercator)
            srs = viewport.resolution ? 'EPSG:4326' : 'EPSG:3857';
        }
        const requestParams = {
            width,
            height,
            boundingBox: [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]]
            ],
            layers,
            crs: srs
        };
        if (srs === 'EPSG:3857') {
            const min = WGS84ToPseudoMercator([bounds[0], bounds[1]]);
            const max = WGS84ToPseudoMercator([bounds[2], bounds[3]]);
            requestParams.boundingBox = [min, max];
        }
        try {
            this.state.loadCounter++;
            this.props.onImageLoadStart(requestId);
            const image = await this.state.imageSource.getImage(requestParams);
            // If a request takes a long time, later requests may have already loaded.
            if (this.state.lastRequestId < requestId) {
                this.getCurrentLayer()?.props.onImageLoad(requestId);
                // Not type safe...
                this.setState({
                    image,
                    bounds,
                    lastRequestParameters: requestParams,
                    lastRequestId: requestId
                });
            }
        }
        catch (error) {
            this.raiseError(error, 'Load image');
            this.getCurrentLayer()?.props.onImageLoadError(requestId, error);
        }
        finally {
            this.state.loadCounter--;
        }
    }
    // HELPERS
    /** Global counter for issuing unique request ids */
    getRequestId() {
        return this.state._nextRequestId++;
    }
    /** Runs an action in the future, cancels it if the new action is issued before it executes */
    debounce(fn, ms = 500) {
        clearTimeout(this.state._timeoutId);
        this.state._timeoutId = setTimeout(() => fn(), ms);
    }
}
WMSLayer.layerName = 'WMSLayer';
WMSLayer.defaultProps = defaultProps;
//# sourceMappingURL=wms-layer.js.map