import * as THREE from 'three';
import { starTypes } from '../config/starDistributions';
import { STAR_MIN, STAR_MAX, BLOOM_LAYER } from '../config/renderConfig';
import { clamp } from '../utils/mathUtils';

export class Star {
  public position: THREE.Vector3;
  public starType: number;
  public obj: THREE.Sprite | null = null;

  constructor(position: THREE.Vector3) {
    this.position = position;
    this.starType = this.generateStarType();
  }

  private generateStarType(): number {
    let num = Math.random() * 100.0;
    const pct = starTypes.percentage;
    for (let i = 0; i < pct.length; i++) {
      num -= pct[i];
      if (num < 0) return i;
    }
    return 0;
  }

  public updateScale(camera: THREE.Camera): void {
    if (!this.obj) return;
    
    let dist = this.position.distanceTo(camera.position) / 250;
    let starSize = dist * starTypes.size[this.starType];
    starSize = clamp(starSize, STAR_MIN, STAR_MAX);
    this.obj.scale.copy(new THREE.Vector3(starSize, starSize, starSize));
  }

  public toThreeObject(scene: THREE.Scene, materials: THREE.SpriteMaterial[]): void {
    const sprite = new THREE.Sprite(materials[this.starType]);
    sprite.layers.set(BLOOM_LAYER);
    sprite.scale.multiplyScalar(starTypes.size[this.starType]);
    sprite.position.copy(this.position);
    this.obj = sprite;
    scene.add(sprite);
  }
}