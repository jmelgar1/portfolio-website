import * as THREE from "three";

export interface ShootingStar {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    trailPositions: THREE.Vector3[];
    maxTrailLength: number;
}