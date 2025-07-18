import * as THREE from "three";

export interface HyperDriveStar {
    position: THREE.Vector3;
    prevPosition: THREE.Vector3;
    velocity: THREE.Vector3;
    angle: number;
    speed: number;
    alpha: number;
}