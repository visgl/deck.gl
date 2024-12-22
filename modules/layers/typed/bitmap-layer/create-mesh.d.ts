export default function createMesh(
  bounds: any,
  resolution: any
):
  | {
      vertexCount: number;
      positions: Float64Array;
      indices: Uint16Array;
      texCoords: Float32Array;
    }
  | {
      vertexCount: number;
      positions: Float64Array;
      indices: Uint32Array;
      texCoords: Float32Array;
    };
// # sourceMappingURL=create-mesh.d.ts.map
