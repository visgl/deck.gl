import type {Store} from './store';
import type {
  GetPickingInfoParams,
  MapView,
  OrthographicView,
  OrbitView,
  FirstPersonView,
  _GlobeView as GlobeView,
  View,
  LayerData
} from '@deck.gl/core';
import type {DataFilterExtensionProps} from '@deck.gl/extensions';
import type {
  S2LayerProps,
  QuadkeyLayerProps,
  TileLayerProps,
  H3ClusterLayerProps,
  H3HexagonLayerProps,
  Tile3DLayerProps,
  TerrainLayerProps,
  MVTLayerProps,
  _Tile2DHeader
} from '@deck.gl/geo-layers';
import type {
  ArcLayerProps,
  BitmapLayerProps,
  IconLayerProps,
  LineLayerProps,
  PointCloudLayerProps,
  ScatterplotLayerProps,
  ColumnLayerProps,
  GridCellLayerProps,
  PathLayerProps,
  PolygonLayerProps,
  GeoJsonLayerProps,
  TextLayerProps,
  SolidPolygonLayerProps
} from '@deck.gl/layers';

export type BaseInstance = {
  __deckglfiber: {
    root: Store;
    view?: string;
  };
};

export type Instance = BaseInstance & {[key: string]: any};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ExtractViewProps<T> = T extends View<any, infer P> ? P : never;

export type DeckglElements = {
  // @deck.gl/core
  mapView: ExtractViewProps<MapView>;
  orthographicView: ExtractViewProps<OrthographicView>;
  orbitView: ExtractViewProps<OrbitView>;
  firstPersonView: ExtractViewProps<FirstPersonView>;
  globeView: ExtractViewProps<GlobeView>;

  // @deck.gl/layers
  arcLayer: ArcLayerProps;
  bitmapLayer: BitmapLayerProps;
  iconLayer: IconLayerProps;
  lineLayer: LineLayerProps;
  pointCloudLayer: PointCloudLayerProps;
  scatterplotLayer: ScatterplotLayerProps;
  columnLayer: ColumnLayerProps;
  gridCellLayer: GridCellLayerProps;
  pathLayer: PathLayerProps;
  polygonLayer: PolygonLayerProps;
  geoJsonLayer: GeoJsonLayerProps;
  textLayer: TextLayerProps;
  solidPolygonLayer: SolidPolygonLayerProps;

  // @deck.gl/geo-layers
  s2Layer: S2LayerProps;
  quadkeyLayer: QuadkeyLayerProps;
  tileLayer: TileLayerProps;
  h3ClusterLayer: H3ClusterLayerProps;
  h3HexagonLayer: H3HexagonLayerProps;
  tile3DLayer: Tile3DLayerProps;
  terrainLayer: TerrainLayerProps;
  mVTLayer: MVTLayerProps & DataFilterExtensionProps;
};

export type DataComparator =
  | (<LayerDataT = LayerData<unknown>>(newData: LayerDataT, oldData?: LayerDataT) => boolean)
  | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropertyAccessor<T> = (props: any) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RenderSubLayersProps<TileData = any> = TileLayerProps<TileData> & {
  tile: _Tile2DHeader<TileData>;
};

export type PickingInfoParams<SublayerPickingInfo extends object> = GetPickingInfoParams & {
  info: SublayerPickingInfo;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface IntrinsicElements extends DeckglElements {}
  }
}
