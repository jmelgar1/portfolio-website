import * as THREE from 'three';
import { ARM_X_DIST, SPIRAL } from '../config/galaxyConfig';

export function gaussianRandom(mean = 0, stdev = 1): number {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export function spiral(x: number, y: number, z: number, offset: number): THREE.Vector3 {
  let r = Math.sqrt(x**2 + y**2);
  let theta = offset;
  theta += x > 0 ? Math.atan(y/x) : Math.atan(y/x) + Math.PI;
  theta += (r/ARM_X_DIST) * SPIRAL;
  return new THREE.Vector3(r*Math.cos(theta), r*Math.sin(theta), z);
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}