// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, Layer, UpdateParameters, DefaultProps} from '@deck.gl/core';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import TextLayer from '../text-layer/text-layer';
// @ts-ignore
import Supercluster from 'supercluster';

import type {
  PickingInfo,
  Accessor,
  Position,
  Color,
  LayerProps,
  AccessorContext
} from '@deck.gl/core';
import type {PointFeature, ClusterFeature, ClusterProperties} from 'supercluster';

type ClusterData = Record<string, unknown>;

type ClusteredPoint = (PointFeature<ClusterData> | ClusterFeature<ClusterData>) & {
  opacity: number;
  id: string;
};

interface ExtendedClusterProperties extends ClusterProperties {
  cluster_id: number;
}

const defaultProps: DefaultProps<IconClusterLayerProps> = {
  sizeScale: {type: 'number', min: 0, value: 1},
  getPosition: {type: 'accessor', value: (x: ClusterData) => (x.position as Position) || [0, 0]},

  // Cluster styling
  clusterRadius: {type: 'number', min: 0, value: 80},
  clusterMaxZoom: {type: 'number', min: 0, max: 24, value: 16},
  clusterFillColor: {type: 'color', value: [51, 102, 204, 200]},
  clusterTextColor: {type: 'color', value: [255, 255, 255, 255]},
  clusterRadiusScale: {type: 'number', min: 0, value: 1},
  clusterRadiusMinPixels: {type: 'number', min: 0, value: 20},
  clusterRadiusMaxPixels: {type: 'number', min: 0, value: 100},

  // Individual point styling
  pointFillColor: {type: 'color', value: [255, 140, 0, 200]},
  pointRadiusMinPixels: {type: 'number', min: 0, value: 8},
  pointRadiusMaxPixels: {type: 'number', min: 0, value: 20},

  // Text styling
  fontFamily: 'Monaco, monospace',
  fontWeight: 'bold',

  // Performance
  pickable: true,
  dynamicClustering: false,
  sizeByCount: false
};

export type IconClusterLayerProps = _IconClusterLayerProps & LayerProps;

type _IconClusterLayerProps = {
  data: ClusterData[];

  /** Accessor for position */
  getPosition?: Accessor<ClusterData, Position>;

  /** Cluster radius in pixels */
  clusterRadius?: number;

  /** Maximum zoom level for clustering */
  clusterMaxZoom?: number;

  /** Fill color for cluster circles */
  clusterFillColor?: Color;

  /** Text color for cluster count */
  clusterTextColor?: Color;

  /** Scale for cluster circle radius */
  clusterRadiusScale?: number;

  /** Minimum pixel radius for cluster circles */
  clusterRadiusMinPixels?: number;

  /** Maximum pixel radius for cluster circles */
  clusterRadiusMaxPixels?: number;

  /** Fill color for individual points */
  pointFillColor?: Color;

  /** Minimum pixel radius for individual points */
  pointRadiusMinPixels?: number;

  /** Maximum pixel radius for individual points */
  pointRadiusMaxPixels?: number;

  /** Font family for cluster text */
  fontFamily?: string;

  /** Font weight for cluster text */
  fontWeight?: string;

  /** Size scale */
  sizeScale?: number;

  /**
   * Dynamic clustering: Re-cluster based on visible points only
   * When enabled, cluster counts decrement as individual points leave viewport
   * More accurate but potentially less performant on viewport changes
   * @default false
   */
  dynamicClustering?: boolean;

  /**
   * Scale cluster circle size based on point count
   * When enabled, larger clusters have bigger circles
   * @default false
   */
  sizeByCount?: boolean;
};

export default class IconClusterLayer extends CompositeLayer<IconClusterLayerProps> {
  static layerName = 'IconClusterLayer';
  static defaultProps = defaultProps;

  state!: {
    data: ClusteredPoint[];
    index: Supercluster;
    z: number;
  };

  initializeState(): void {
    const index = new Supercluster({
      maxZoom: this.props.clusterMaxZoom,
      radius: this.props.clusterRadius
    });

    this.setState({
      index,
      data: [],
      z: -1
    });
  }

  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    const rebuildIndex =
      changeFlags.dataChanged ||
      props.clusterRadius !== oldProps.clusterRadius ||
      props.clusterMaxZoom !== oldProps.clusterMaxZoom ||
      props.dynamicClustering !== oldProps.dynamicClustering;

    if (rebuildIndex) {
      const index = new Supercluster({
        maxZoom: props.clusterMaxZoom,
        radius: props.clusterRadius
      });

      const features = props.data.map((d, i) => {
        const context: AccessorContext<ClusterData> = {
          index: i,
          data: props.data,
          target: []
        };

        let position: Position;
        const posAccessor = props.getPosition;

        if (typeof posAccessor === 'function') {
          position = posAccessor(d, context);
        } else if (Array.isArray(posAccessor)) {
          position = posAccessor;
        } else {
          position = [0, 0];
        }

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [position[0], position[1]]
          },
          properties: d
        };
      });

      index.load(features);
      this.setState({index});
    }

    const z = Math.floor(this.context.viewport.zoom);
    const shouldUpdate = rebuildIndex || z !== this.state.z || changeFlags.viewportChanged;

    if (shouldUpdate) {
      if (props.dynamicClustering) {
        // DYNAMIC MODE: Filter points first, then re-cluster
        // This causes cluster counts to decrement as points leave viewport
        this._updateDynamicClusters(z);
      } else {
        // STATIC MODE: Cluster all points, then apply opacity
        // More performant but less granular
        this._updateStaticClusters(z);
      }
    }
  }

  /**
   * Dynamic clustering: Re-cluster based on visible points only
   * Cluster counts decrement as individual points leave viewport
   */
  _updateDynamicClusters(z: number): void {
    const allClusters = this.state.index.getClusters([-180, -85, 180, 85], z);

    // Expand all clusters to get individual points
    const allPoints: Array<{coordinates: number[]; properties: ClusterData}> = [];

    allClusters.forEach(cluster => {
      if (cluster.properties.cluster) {
        // Get all points in this cluster
        const clusterPoints = this.state.index.getLeaves(cluster.properties.cluster_id, Infinity);
        clusterPoints.forEach(point => {
          allPoints.push({
            coordinates: point.geometry.coordinates,
            properties: point.properties
          });
        });
      } else {
        // Individual point
        allPoints.push({
          coordinates: cluster.geometry.coordinates,
          properties: cluster.properties
        });
      }
    });

    // Filter points by visibility and calculate opacity
    const visiblePoints = allPoints
      .map(point => ({
        ...point,
        opacity: this._calculateOpacity(point.coordinates)
      }))
      .filter(point => point.opacity > 0);

    // Re-cluster the visible points
    const dynamicIndex = new Supercluster({
      maxZoom: this.props.clusterMaxZoom,
      radius: this.props.clusterRadius
    });

    const visibleFeatures = visiblePoints.map(point => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: point.coordinates
      },
      properties: point.properties
    }));

    dynamicIndex.load(visibleFeatures);

    // Get clusters from the dynamically filtered points
    const dynamicClusters = dynamicIndex.getClusters([-180, -85, 180, 85], z);

    // Apply opacity and stable IDs to the new clusters
    const clustersWithOpacity = dynamicClusters.map(cluster => {
      const opacity = this._calculateOpacity(cluster.geometry.coordinates);
      const id = this._getStableId(cluster);
      return {
        ...cluster,
        opacity,
        id
      };
    });

    this.setState({
      data: clustersWithOpacity,
      z
    });
  }

  /**
   * Static clustering: Cluster all points, then apply opacity
   * More performant, clusters fade as a whole
   */
  _updateStaticClusters(z: number): void {
    const allClusters = this.state.index.getClusters([-180, -85, 180, 85], z);

    // Calculate opacity and assign stable IDs
    // This creates smooth fade-out at the edges
    const clustersWithOpacity = allClusters.map(cluster => {
      const opacity = this._calculateOpacity(cluster.geometry.coordinates);
      const id = this._getStableId(cluster);
      return {
        ...cluster,
        opacity,
        id
      };
    });

    // Filter out completely invisible clusters
    const visibleClusters = clustersWithOpacity.filter(cluster => cluster.opacity > 0);

    this.setState({
      data: visibleClusters,
      z
    });
  }

  /**
   * Calculate opacity for a point based on its position relative to camera
   * Returns 0-1 with smooth fade-out at edges
   */
  _calculateOpacity(coordinates: number[]): number {
    const viewport = this.context.viewport;
    if (!viewport || viewport.constructor.name !== 'GlobeViewport') {
      return 1;
    }

    const [featureLon, featureLat] = coordinates;
    const cameraLat = (viewport as any).latitude || 0;
    const cameraLon = (viewport as any).longitude || 0;
    const zoom = viewport.zoom || 0;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const camVec = this._toUnitVector(toRad(cameraLat), toRad(cameraLon));
    const featVec = this._toUnitVector(toRad(featureLat), toRad(featureLon));

    // Dot product between camera and feature vectors
    const dot = camVec[0] * featVec[0] + camVec[1] * featVec[1] + camVec[2] * featVec[2];

    const fovDegrees = this._zoomToFOV(zoom);
    const fadeStartAngle = fovDegrees / 2 + 10;
    const fadeEndAngle = fovDegrees / 2 + 25;
    const fadeStartCos = Math.cos(toRad(fadeStartAngle));
    const fadeEndCos = Math.cos(toRad(fadeEndAngle));

    return this._getFadeOpacity(dot, fadeStartCos, fadeEndCos);
  }

  /**
   * Convert zoom level to field of view in degrees
   * Tunes the visibility cone based on zoom level
   */
  _zoomToFOV(zoom: number): number {
    const clamped = Math.max(Math.min(zoom, 20), 0);
    // Range: 130° (wide) → 0° (narrow)
    return 130 * (1 - clamped / 20);
  }

  /**
   * Generate stable ID based on cluster_id from Supercluster or position hash
   * Supercluster's cluster_id is stable as clusters split/merge
   */
  _getStableId(cluster: PointFeature<ClusterData> | ClusterFeature<ClusterData>): string {
    const isCluster =
      cluster.properties &&
      typeof cluster.properties === 'object' &&
      'cluster' in cluster.properties;

    if (isCluster) {
      // Use Supercluster's cluster_id - this is stable across splits/merges
      const clusterId = (cluster.properties as ExtendedClusterProperties).cluster_id;
      return `cluster-${clusterId}`;
    }
    // For individual points, use position-based hash
    const [lon, lat] = cluster.geometry.coordinates;
    const roundedLon = Math.round(lon * 10000);
    const roundedLat = Math.round(lat * 10000);
    return `point-${roundedLat}-${roundedLon}`;
  }

  /**
   * Convert spherical coordinates to 3D unit vector
   */
  _toUnitVector(lat: number, lon: number): [number, number, number] {
    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  }

  /**
   * Calculate fade opacity based on angle from camera
   */
  _getFadeOpacity(dot: number, fadeStartCos: number, fadeEndCos: number): number {
    if (dot >= fadeStartCos) return 1;
    if (dot <= fadeEndCos) return 0;
    const fadeRange = fadeStartCos - fadeEndCos;
    return (dot - fadeEndCos) / fadeRange;
  }

  getPickingInfo({
    info,
    mode
  }: {
    info: PickingInfo;
    mode: string;
  }): PickingInfo<ClusterData, {objects?: ClusterData[]}> {
    const pickedObject = info.object as ClusteredPoint | undefined;

    if (pickedObject && 'properties' in pickedObject) {
      const properties = pickedObject.properties;
      let objects: ClusterData[] | undefined;

      if (
        properties &&
        typeof properties === 'object' &&
        'cluster' in properties &&
        properties.cluster &&
        mode !== 'hover'
      ) {
        const extProps = properties as ExtendedClusterProperties;
        objects = this.state.index
          .getLeaves(extProps.cluster_id, 25)
          .map((f: PointFeature<ClusterData>) => f.properties);
      }

      return {...info, object: properties, objects};
    }

    return {...info, object: undefined};
  }

  renderLayers(): Layer[] {
    const {data} = this.state;
    const {
      clusterFillColor,
      clusterTextColor,
      clusterRadiusMinPixels,
      clusterRadiusMaxPixels,
      pointFillColor,
      pointRadiusMinPixels,
      pointRadiusMaxPixels,
      fontFamily,
      fontWeight
    } = this.props;

    // Separate clusters and individual points
    const clusters = data.filter(
      (d): d is ClusterFeature<ClusterData> & {opacity: number} =>
        d.properties &&
        typeof d.properties === 'object' &&
        'cluster' in d.properties &&
        Boolean(d.properties.cluster)
    );

    const points = data.filter(
      (d): d is PointFeature<ClusterData> & {opacity: number} =>
        !d.properties ||
        typeof d.properties !== 'object' ||
        !('cluster' in d.properties) ||
        !d.properties.cluster
    );

    return [
      // Cluster background circles
      new ScatterplotLayer(
        this.getSubLayerProps({
          id: 'cluster-circles',
          data: clusters,
          pickable: this.props.pickable,
          stroked: false,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: clusterRadiusMinPixels,
          radiusMaxPixels: clusterRadiusMaxPixels,
          lineWidthMinPixels: 0,
          getPosition: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) =>
            d.geometry.coordinates,
          getId: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) => d.id,
          getRadius: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) => {
            if (this.props.sizeByCount) {
              const pointCount = d.properties.point_count || 1;
              // Scale radius based on cluster size with more dramatic scaling
              // 1 point: 20px, 10 points: 50px, 100 points: 100px, 1000 points: 150px
              const baseRadius = clusterRadiusMinPixels || 20;
              const maxRadius = clusterRadiusMaxPixels || 100;
              // Use log scale for better visual differentiation
              const scale = Math.log10(pointCount + 1) / 3; // 0-1 range for 1-1000 points
              return baseRadius + (maxRadius - baseRadius) * scale;
            }
            // Fixed size mode
            return clusterRadiusMinPixels || 20;
          },
          getFillColor: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) => {
            // Apply opacity to fill color
            const baseColor = Array.isArray(clusterFillColor)
              ? clusterFillColor
              : [51, 102, 204, 220];
            return [baseColor[0], baseColor[1], baseColor[2], (baseColor[3] || 255) * d.opacity];
          },
          transitions: {
            getRadius: {
              duration: 300,
              easing: (t: number) => t * (2 - t) // ease-out quad
            }
          }
        })
      ),

      // Cluster text labels
      new TextLayer(
        this.getSubLayerProps({
          id: 'cluster-text',
          data: clusters,
          pickable: false,
          getPosition: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) =>
            d.geometry.coordinates,
          getId: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) => d.id,
          getText: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) =>
            String(d.properties.point_count || 0),
          getColor: (d: ClusterFeature<ClusterData> & {opacity: number; id: string}) => {
            // Apply opacity to text color
            const baseColor = Array.isArray(clusterTextColor)
              ? clusterTextColor
              : [255, 255, 255, 255];
            return [baseColor[0], baseColor[1], baseColor[2], (baseColor[3] || 255) * d.opacity];
          },
          getSize: 16,
          getAngle: 0,
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'center',
          fontFamily,
          fontWeight,
          // Billboard mode for globe support - text always faces camera
          billboard: true,
          // Disable depth test for text to prevent artifacts
          parameters: {
            depthTest: false
          }
        })
      ),

      // Individual points
      new ScatterplotLayer(
        this.getSubLayerProps({
          id: 'individual-points',
          data: points,
          pickable: this.props.pickable,
          stroked: false,
          filled: true,
          radiusMinPixels: pointRadiusMinPixels,
          radiusMaxPixels: pointRadiusMaxPixels,
          lineWidthMinPixels: 0,
          getPosition: (d: PointFeature<ClusterData> & {opacity: number; id: string}) =>
            d.geometry.coordinates,
          getId: (d: PointFeature<ClusterData> & {opacity: number; id: string}) => d.id,
          getRadius: 1,
          getFillColor: (d: PointFeature<ClusterData> & {opacity: number; id: string}) => {
            // Apply opacity to point color
            const baseColor = Array.isArray(pointFillColor) ? pointFillColor : [255, 140, 0, 220];
            return [baseColor[0], baseColor[1], baseColor[2], (baseColor[3] || 255) * d.opacity];
          }
        })
      )
    ];
  }
}
