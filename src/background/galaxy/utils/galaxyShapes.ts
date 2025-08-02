
export function interpolatePositions(
  fromPositions: Float32Array,
  toPositions: Float32Array,
  progress: number,
): Float32Array {
  const result = new Float32Array(fromPositions.length);

  for (let i = 0; i < fromPositions.length; i++) {
    result[i] =
      fromPositions[i] + (toPositions[i] - fromPositions[i]) * progress;
  }

  return result;
}

export function interpolateColors(
  fromColors: Float32Array,
  toColors: Float32Array,
  progress: number,
): Float32Array {
  const result = new Float32Array(fromColors.length);

  for (let i = 0; i < fromColors.length; i++) {
    result[i] = fromColors[i] + (toColors[i] - fromColors[i]) * progress;
  }

  return result;
}
