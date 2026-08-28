// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// View and Projection Matrix calculations for mapbox-js style
// map view properties
import Viewport from "./viewport.js";
import { pixelsToWorld, getViewMatrix, addMetersToLngLat, unitsPerMeter, getProjectionParameters, altitudeToFovy, fovyToAltitude, fitBounds, getBounds } from '@math.gl/web-mercator';
import { Matrix4, clamp, vec2 } from '@math.gl/core';
/**
 * Manages transformations to/from WGS84 coordinates using the Web Mercator Projection.
 */
class WebMercatorViewport extends Viewport {
    /* eslint-disable complexity, max-statements */
    constructor(opts = {}) {
        const { latitude = 0, longitude = 0, zoom = 0, pitch = 0, bearing = 0, nearZMultiplier = 0.1, farZMultiplier = 1.01, nearZ, farZ, orthographic = false, projectionMatrix, repeat = false, worldOffset = 0, position, padding, 
        // backward compatibility
        // TODO: remove in v9
        legacyMeterSizes = false } = opts;
        let { width, height, altitude = 1.5 } = opts;
        const scale = Math.pow(2, zoom);
        // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
        width = width || 1;
        height = height || 1;
        let fovy;
        let projectionParameters = null;
        if (projectionMatrix) {
            altitude = projectionMatrix[5] / 2;
            fovy = altitudeToFovy(altitude);
        }
        else {
            if (opts.fovy) {
                fovy = opts.fovy;
                altitude = fovyToAltitude(fovy);
            }
            else {
                fovy = altitudeToFovy(altitude);
            }
            let offset;
            if (padding) {
                const { top = 0, bottom = 0 } = padding;
                offset = [0, clamp((top + height - bottom) / 2, 0, height) - height / 2];
            }
            projectionParameters = getProjectionParameters({
                width,
                height,
                scale,
                center: position && [0, 0, position[2] * unitsPerMeter(latitude)],
                offset,
                pitch,
                fovy,
                nearZMultiplier,
                farZMultiplier
            });
            if (Number.isFinite(nearZ)) {
                projectionParameters.near = nearZ;
            }
            if (Number.isFinite(farZ)) {
                projectionParameters.far = farZ;
            }
        }
        // The uncentered matrix allows us two move the center addition to the
        // shader (cheap) which gives a coordinate system that has its center in
        // the layer's center position. This makes rotations and other modelMatrx
        // transforms much more useful.
        let viewMatrixUncentered = getViewMatrix({
            height,
            pitch,
            bearing,
            scale,
            altitude
        });
        if (worldOffset) {
            const viewOffset = new Matrix4().translate([512 * worldOffset, 0, 0]);
            viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
        }
        super({
            ...opts,
            // x, y,
            width,
            height,
            // view matrix
            viewMatrix: viewMatrixUncentered,
            longitude,
            latitude,
            zoom,
            // projection matrix parameters
            ...projectionParameters,
            fovy,
            focalDistance: altitude
        });
        // Save parameters
        this.latitude = latitude;
        this.longitude = longitude;
        this.zoom = zoom;
        this.pitch = pitch;
        this.bearing = bearing;
        this.altitude = altitude;
        this.fovy = fovy;
        this.orthographic = orthographic;
        this._subViewports = repeat ? [] : null;
        this._pseudoMeters = legacyMeterSizes;
        Object.freeze(this);
    }
    /* eslint-enable complexity, max-statements */
    get subViewports() {
        if (this._subViewports && !this._subViewports.length) {
            // Cache sub viewports so that we only calculate them once
            const bounds = this.getBounds();
            const minOffset = Math.floor((bounds[0] + 180) / 360);
            const maxOffset = Math.ceil((bounds[2] - 180) / 360);
            for (let x = minOffset; x <= maxOffset; x++) {
                const offsetViewport = x
                    ? new WebMercatorViewport({
                        ...this,
                        worldOffset: x
                    })
                    : this;
                this._subViewports.push(offsetViewport);
            }
        }
        return this._subViewports;
    }
    projectPosition(xyz) {
        if (this._pseudoMeters) {
            // Backward compatibility
            return super.projectPosition(xyz);
        }
        const [X, Y] = this.projectFlat(xyz);
        const Z = (xyz[2] || 0) * unitsPerMeter(xyz[1]);
        return [X, Y, Z];
    }
    unprojectPosition(xyz) {
        if (this._pseudoMeters) {
            // Backward compatibility
            return super.unprojectPosition(xyz);
        }
        const [X, Y] = this.unprojectFlat(xyz);
        const Z = (xyz[2] || 0) / unitsPerMeter(Y);
        return [X, Y, Z];
    }
    /**
     * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
     *
     * Note: Uses simple linear approximation around the viewport center
     * Error increases with size of offset (roughly 1% per 100km)
     *
     * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
     * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
     * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
     */
    addMetersToLngLat(lngLatZ, xyz) {
        return addMetersToLngLat(lngLatZ, xyz);
    }
    panByPosition(coords, pixel, startPixel) {
        const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
        const toLocation = this.projectFlat(coords);
        const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
        const newCenter = vec2.add([], this.center, translate);
        const [longitude, latitude] = this.unprojectFlat(newCenter);
        return { longitude, latitude };
    }
    /**
     * Returns a new longitude and latitude that keeps a 3D world coordinate at a given screen pixel
     * This version handles the z-component (altitude) properly for cameras positioned above ground
     */
    panByPosition3D(coords, pixel) {
        const targetZ = coords[2] || 0;
        const deltaLngLat = vec2.sub([], coords, this.unproject(pixel, { targetZ }));
        return { longitude: this.longitude + deltaLngLat[0], latitude: this.latitude + deltaLngLat[1] };
    }
    getBounds(options = {}) {
        // @ts-ignore
        const corners = getBounds(this, options.z || 0);
        return [
            Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
            Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
            Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
            Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
        ];
    }
    /**
     * Returns a new viewport that fit around the given rectangle.
     * Only supports non-perspective mode.
     */
    fitBounds(
    /** [[lon, lat], [lon, lat]] */
    bounds, options = {}) {
        const { width, height } = this;
        const { longitude, latitude, zoom } = fitBounds({ width, height, bounds, ...options });
        return new WebMercatorViewport({ width, height, longitude, latitude, zoom });
    }
}
WebMercatorViewport.displayName = 'WebMercatorViewport';
export default WebMercatorViewport;
//# sourceMappingURL=web-mercator-viewport.js.map