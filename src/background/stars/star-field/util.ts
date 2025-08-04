export const generateStarInFrustum = (
  depth: number, 
  maxParallaxOffset: number = 30, 
  fov: number = 40,
  cameraPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
) => {
  const cameraFov = fov;
  const cameraAspect = window.innerWidth / window.innerHeight;
  const fovRad = (cameraFov * Math.PI) / 180;
  
  // CRITICAL FIX: Camera is looking down Y-axis, so depth is along Y-axis
  const relativeDepth = depth - cameraPosition.y;
  const halfHeight = Math.tan(fovRad / 2) * relativeDepth;
  const halfWidth = halfHeight * cameraAspect;

  // Expand the generation area to account for mouse parallax movement
  // Stars can move up to ±maxParallaxOffset in any direction
  const expandedHalfWidth = halfWidth + maxParallaxOffset;
  const expandedHalfDepth = halfHeight + maxParallaxOffset; // Z becomes the "height" dimension
  
  // Additional buffer to prevent visible edges
  const depthExtension = 40;
  const totalDepth = expandedHalfDepth * 2 + depthExtension;

  // Generate stars relative to camera position - camera looks down Y-axis
  const starX = (Math.random() - 0.5) * 2 * expandedHalfWidth + cameraPosition.x;
  const starY = depth + cameraPosition.y; // Stars positioned along positive Y-axis
  const starZ = (Math.random() * totalDepth) - expandedHalfDepth + cameraPosition.z;

  return {
    x: starX,
    y: starY,
    z: starZ,
  };
};
