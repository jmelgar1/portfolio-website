import * as THREE from 'three';
import { HAZE_MAX, HAZE_MIN, HAZE_OPACITY, BASE_LAYER } from '../config/renderConfig';
import { clamp } from '../utils/mathUtils';

export class Haze {
  public position: THREE.Vector3;
  public obj: THREE.Sprite | null = null;

  constructor(position: THREE.Vector3) {
    this.position = position;
  }

  public updateScale(camera: THREE.Camera): void {
    if (!this.obj) return;
    
    let dist = this.position.distanceTo(camera.position) / 250;
    const material = this.obj.material as THREE.SpriteMaterial;
    material.opacity = clamp(
      HAZE_OPACITY * Math.pow(dist / 2.5, 2), 
      0, 
      HAZE_OPACITY
    );
    material.needsUpdate = true;
  }

  public toThreeObject(scene: THREE.Scene, hazeSprite: THREE.SpriteMaterial): void {
    const sprite = new THREE.Sprite(hazeSprite);
    sprite.layers.set(BASE_LAYER);
    sprite.position.copy(this.position);
    sprite.scale.multiplyScalar(
      clamp(HAZE_MAX * Math.random(), HAZE_MIN, HAZE_MAX)
    );
    this.obj = sprite;
    scene.add(sprite);
  }
}