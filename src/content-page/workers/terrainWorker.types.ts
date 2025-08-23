/**
 * TypeScript interfaces for terrain worker communication
 */

export interface TerrainWorkerInput {
  width: number;
  length: number;
  maxHeight: number;
  segments: number;
  seed: number;
}

export interface TerrainWorkerResult {
  positions: Float32Array;
  colors: Float32Array;
  vertexCount: number;
}

export interface TerrainWorkerMessage {
  type: 'GENERATE_TERRAIN';
  payload: TerrainWorkerInput;
  id: string;
}

export interface TerrainWorkerResponse {
  type: 'TERRAIN_GENERATED' | 'TERRAIN_ERROR';
  payload: TerrainWorkerResult | { error: string };
  id: string;
}