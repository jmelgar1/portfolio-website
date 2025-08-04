export const generateStarInFrustum = (
  depth: number, 
  maxParallaxOffset: number = 30, 
  fov: number = 40,
  cameraPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
  cameraOrientation: 'z-axis' | 'y-axis' = 'z-axis'
) => {
  const cameraFov = fov;
  const cameraAspect = window.innerWidth / window.innerHeight;
  const fovRad = (cameraFov * Math.PI) / 180;
  
  const relativeDepth = depth;
  const halfHeight = Math.tan(fovRad / 2) * relativeDepth;
  const halfWidth = halfHeight * cameraAspect;

  // Expand the generation area to account for mouse parallax movement
  // Stars can move up to ±maxParallaxOffset in any direction
  const expandedHalfWidth = halfWidth + maxParallaxOffset;
  const expandedHalfHeight = halfHeight + maxParallaxOffset;
  
  // Additional buffer to prevent visible edges
  const edgeBuffer = 40;
  const totalHeight = expandedHalfHeight * 2 + edgeBuffer;

  let starX, starY, starZ;

  if (cameraOrientation === 'y-axis') {
    // Camera looks down positive Y-axis (SpaceBackground case)
    // X = left/right, Z = up/down on screen, Y = depth
    starX = (Math.random() - 0.5) * 2 * expandedHalfWidth + cameraPosition.x;
    starZ = (Math.random() * totalHeight) - expandedHalfHeight + cameraPosition.z;
    starY = depth + cameraPosition.y; // Stars positioned along positive Y-axis (in front of camera)
  } else {
    // Camera looks down negative Z-axis (AboutSection case - Three.js default)
    // X = left/right, Y = up/down on screen, Z = depth
    starX = (Math.random() - 0.5) * 2 * expandedHalfWidth + cameraPosition.x;
    starY = (Math.random() * totalHeight) - expandedHalfHeight + cameraPosition.y;
    starZ = -depth + cameraPosition.z; // Stars positioned along negative Z-axis (in front of camera)
  }

  return {
    x: starX,
    y: starY,
    z: starZ,
  };
};