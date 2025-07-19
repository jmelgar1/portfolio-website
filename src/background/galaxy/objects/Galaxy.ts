import * as THREE from 'three';
import { Star } from './Star';
import { Haze } from './Haze';
import { 
  NUM_STARS, 
  ARMS, 
  GALAXY_THICKNESS, 
  CORE_X_DIST, 
  CORE_Y_DIST, 
  OUTER_CORE_X_DIST, 
  OUTER_CORE_Y_DIST,
  ARM_X_DIST,
  ARM_Y_DIST,
  ARM_X_MEAN,
  ARM_Y_MEAN,
  ARMS_CONSTANT,
  HAZE_RATIO
} from '../config/galaxyConfig';
import { starTypes } from '../config/starDistributions';
import { gaussianRandom, spiral } from '../utils/mathUtils';

export class Galaxy {
  public stars: Star[] = [];
  public haze: Haze[] = [];
  private materials: THREE.SpriteMaterial[] = [];
  private hazeSprite!: THREE.SpriteMaterial;

  constructor(scene: THREE.Scene) {
    this.createMaterials();
    this.stars = this.generateObject(NUM_STARS, (pos) => new Star(pos));
    this.haze = this.generateObject(NUM_STARS * HAZE_RATIO, (pos) => new Haze(pos));
    
    this.stars.forEach((star) => star.toThreeObject(scene, this.materials));
    this.haze.forEach((haze) => haze.toThreeObject(scene, this.hazeSprite));
  }

  private createMaterials(): void {
    // Create star materials
    this.materials = starTypes.colors.map(color => {
      const texture = this.createStarTexture(color);
      return new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1
      });
    });

    // Create haze material
    const hazeTexture = this.createHazeTexture();
    this.hazeSprite = new THREE.SpriteMaterial({
      map: hazeTexture,
      transparent: true,
      opacity: 0.2
    });
  }

  private createStarTexture(color: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    const colorObj = new THREE.Color(color);
    gradient.addColorStop(0, `rgba(${colorObj.r * 255}, ${colorObj.g * 255}, ${colorObj.b * 255}, 1)`);
    gradient.addColorStop(0.5, `rgba(${colorObj.r * 255}, ${colorObj.g * 255}, ${colorObj.b * 255}, 0.5)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private createHazeTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private generateObject<T>(numStars: number, generator: (pos: THREE.Vector3) => T): T[] {
    const objects: T[] = [];
    
    // Generate stars in core region (25% of stars)
    for (let i = 0; i < numStars / 4; i++) {
      const pos = new THREE.Vector3(
        gaussianRandom(0, CORE_X_DIST), 
        gaussianRandom(0, CORE_Y_DIST), 
        gaussianRandom(0, GALAXY_THICKNESS)
      );
      objects.push(generator(pos));
    }
    
    // Generate stars in outer core (25% of stars)
    for (let i = 0; i < numStars / 4; i++) {
      const pos = new THREE.Vector3(
        gaussianRandom(0, OUTER_CORE_X_DIST), 
        gaussianRandom(0, OUTER_CORE_Y_DIST), 
        gaussianRandom(0, GALAXY_THICKNESS)
      );
      objects.push(generator(pos));
    }
    
    // Generate stars in spiral arms (remaining 50%)
    for (let j = 0; j < ARMS; j++) {
      for (let i = 0; i < numStars / 4; i++) {
        const armOffset = (j * 2.0 * Math.PI) / ARMS;
        
        // Generate position along spiral arm
        const x = gaussianRandom(ARM_X_MEAN, ARM_X_DIST);
        const y = gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST);
        const z = gaussianRandom(0, GALAXY_THICKNESS);
        
        const pos = spiral(x, y, z, armOffset);
        objects.push(generator(pos));
      }
    }
    
    return objects;
  }

  public updateScale(camera: THREE.Camera): void {
    this.stars.forEach((star) => star.updateScale(camera));
    this.haze.forEach((haze) => haze.updateScale(camera));
  }
}