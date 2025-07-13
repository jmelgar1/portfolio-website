export const generateStarInFrustum = (depth: number) => {
    const cameraFov = 75;
    const cameraAspect = window.innerWidth / window.innerHeight;
    const fovRad = (cameraFov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * depth;
    const halfWidth = halfHeight * cameraAspect;

    return {
        x: (Math.random() - 0.5) * 2 * halfWidth,
        y: (Math.random() - 0.5) * 2 * halfHeight,
        z: -depth
    };
};