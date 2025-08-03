export const generateStarInFrustum = (depth: number, maxParallaxOffset: number = 30) => {
  const cameraFov = 40; // Match actual camera FOV
  const cameraAspect = window.innerWidth / window.innerHeight;
  const fovRad = (cameraFov * Math.PI) / 180;
  const halfHeight = Math.tan(fovRad / 2) * depth;
  const halfWidth = halfHeight * cameraAspect;

  // Expand the generation area to account for mouse parallax movement
  // Stars can move up to ±maxParallaxOffset in any direction
  const expandedHalfWidth = halfWidth + maxParallaxOffset;
  const expandedHalfHeight = halfHeight + maxParallaxOffset;

  return {
    x: (Math.random() - 0.5) * 2 * expandedHalfWidth,
    y: (Math.random() - 0.5) * 2 * expandedHalfHeight,
    z: -depth,
  };
};
