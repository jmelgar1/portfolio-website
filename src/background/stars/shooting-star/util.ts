import * as THREE from "three";
import {CameraConfig, CanvasBounds} from "./types";

export const getCanvasBounds = (depth: number): CanvasBounds => {
    const camera: CameraConfig = {
        fov: 75,
        position: 5,
        aspect: window.innerWidth / window.innerHeight
    };

    const distance = camera.position + Math.abs(depth);
    const fovRad = (camera.fov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * distance;
    const halfWidth = halfHeight * camera.aspect;

    return {
        left: -halfWidth,
        right: halfWidth,
        top: halfHeight,
        bottom: -halfHeight,
        width: halfWidth * 2,
        height: halfHeight * 2
    };
};

export const generateEdgePositions = (edge: number, bounds: CanvasBounds, spawnMargin: number, depth: number): { startPos: THREE.Vector3; endPos: THREE.Vector3 } => {
    let startPos: THREE.Vector3;
    let endPos: THREE.Vector3;

    switch (edge) {
        case 0: // Left edge
            startPos = new THREE.Vector3(
                bounds.left - spawnMargin,
                Math.random() * bounds.height + bounds.bottom,
                depth
            );
            endPos = new THREE.Vector3(
                bounds.right + spawnMargin,
                Math.random() * bounds.height + bounds.bottom,
                depth
            );
            break;
        case 1: // Right edge
            startPos = new THREE.Vector3(
                bounds.right + spawnMargin,
                Math.random() * bounds.height + bounds.bottom,
                depth
            );
            endPos = new THREE.Vector3(
                bounds.left - spawnMargin,
                Math.random() * bounds.height + bounds.bottom,
                depth
            );
            break;
        case 2: // Top edge
            startPos = new THREE.Vector3(
                Math.random() * bounds.width + bounds.left,
                bounds.top + spawnMargin,
                depth
            );
            endPos = new THREE.Vector3(
                Math.random() * bounds.width + bounds.left,
                bounds.bottom - spawnMargin,
                depth
            );
            break;
        case 3: // Bottom edge
            startPos = new THREE.Vector3(
                Math.random() * bounds.width + bounds.left,
                bounds.bottom - spawnMargin,
                depth
            );
            endPos = new THREE.Vector3(
                Math.random() * bounds.width + bounds.left,
                bounds.top + spawnMargin,
                depth
            );
            break;
        default:
            startPos = new THREE.Vector3(bounds.left - spawnMargin, 0, depth);
            endPos = new THREE.Vector3(bounds.right + spawnMargin, 0, depth);
    }

    return { startPos, endPos };
};

export const isOutOfBounds = (position: THREE.Vector3, bounds: CanvasBounds): boolean => {
    const buffer = 2;
    return position.x < bounds.left - buffer ||
        position.x > bounds.right + buffer ||
        position.y < bounds.bottom - buffer ||
        position.y > bounds.top + buffer;
};