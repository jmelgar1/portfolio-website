// Scene builder utility for creating and managing scene configurations
// This provides a fluent API for building scenes programmatically

export class SceneBuilder {
  constructor(name, description = '') {
    this.scene = {
      name,
      description,
      elements: []
    };
  }

  // Add a tree to the scene (automatically positions on ground level)
  addTree(id, modelPath, x, y = -2.5, z, rotationY = 0, scale = 1, layer = 'foreground') {
    this.scene.elements.push({
      id,
      type: 'tree',
      url: modelPath,
      position: [x, y, z],
      rotation: [0, rotationY, 0],
      scale,
      layer
    });
    return this;
  }

  // Add a rock to the scene (automatically positions on ground level)
  addRock(id, modelPath, x, y = -2.5, z, rotationY = 0, scale = 1, layer = 'foreground') {
    this.scene.elements.push({
      id,
      type: 'rock',
      url: modelPath,
      position: [x, y, z],
      rotation: [0, rotationY, 0],
      scale,
      layer
    });
    return this;
  }

  // Add a plant to the scene (automatically positions on ground level)
  addPlant(id, modelPath, x, y = -2.5, z, rotationY = 0, scale = 1, layer = 'foreground') {
    this.scene.elements.push({
      id,
      type: 'plant',
      url: modelPath,
      position: [x, y, z],
      rotation: [0, rotationY, 0],
      scale,
      layer
    });
    return this;
  }

  // Add a flower to the scene (automatically positions on ground level)
  addFlower(id, modelPath, x, y = -2.5, z, rotationY = 0, scale = 1, layer = 'foreground') {
    this.scene.elements.push({
      id,
      type: 'flower',
      url: modelPath,
      position: [x, y, z],
      rotation: [0, rotationY, 0],
      scale,
      layer
    });
    return this;
  }

  // Add a custom element to the scene
  addElement(element) {
    // Validate required fields
    if (!element.id || !element.type || !element.url || !element.position) {
      throw new Error('Element must have id, type, url, and position');
    }
    
    // Set defaults
    const elementWithDefaults = {
      rotation: [0, 0, 0],
      scale: 1,
      layer: 'foreground',
      ...element
    };
    
    this.scene.elements.push(elementWithDefaults);
    return this;
  }

  // Group elements by layer for organized rendering
  getElementsByLayer(layer) {
    return this.scene.elements.filter(element => element.layer === layer);
  }

  // Get all unique layers in the scene
  getLayers() {
    return [...new Set(this.scene.elements.map(element => element.layer))];
  }

  // Remove an element by id
  removeElement(id) {
    this.scene.elements = this.scene.elements.filter(element => element.id !== id);
    return this;
  }

  // Update an element by id
  updateElement(id, updates) {
    const elementIndex = this.scene.elements.findIndex(element => element.id === id);
    if (elementIndex !== -1) {
      this.scene.elements[elementIndex] = { ...this.scene.elements[elementIndex], ...updates };
    }
    return this;
  }

  // Clone the scene for variations
  clone(newName, newDescription) {
    const clonedBuilder = new SceneBuilder(newName || this.scene.name, newDescription || this.scene.description);
    clonedBuilder.scene.elements = JSON.parse(JSON.stringify(this.scene.elements));
    return clonedBuilder;
  }

  // Build and return the final scene configuration
  build() {
    return { ...this.scene };
  }

  // Export scene as JSON string
  exportJSON() {
    return JSON.stringify(this.scene, null, 2);
  }

  // Import scene from JSON
  static fromJSON(jsonString) {
    const sceneData = JSON.parse(jsonString);
    const builder = new SceneBuilder(sceneData.name, sceneData.description);
    builder.scene.elements = sceneData.elements || [];
    return builder;
  }
}

// Helper function to create a scene builder
export const createScene = (name, description) => new SceneBuilder(name, description);

// Specialized builder for grass pasture scenes
export const createGrassPasture = (name, description = "A lush grass pasture scene") => {
  return new SceneBuilder(name, description);
};

// Helper function to add scattered grass across a pasture area using nature_assets
export const addGrassField = (sceneBuilder, options = {}) => {
  const {
    density = 25,
    xRange = [-20, 20],
    zRange = [1.0, 2.8],
    scaleRange = [0.3, 0.8],
    layer = 'foreground'
  } = options;

  for (let i = 0; i < density; i++) {
    const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
    const z = zRange[0] + Math.random() * (zRange[1] - zRange[0]);
    const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
    const rotation = Math.random() * Math.PI * 2;
    
    sceneBuilder.addPlant(
      `grass_field_${layer}_${i}`,
      MODEL_PATHS.grass.random(),
      x, -2.5, z,
      rotation,
      scale,
      layer
    );
  }
  
  return sceneBuilder;
};

// Helper function to create comprehensive grass coverage across all layers
export const addComprehensiveGrassCoverage = (sceneBuilder) => {
  // Foreground grass (closest, largest)
  addGrassField(sceneBuilder, {
    density: 35,
    xRange: [-25, 25],
    zRange: [2.0, 2.8],
    scaleRange: [0.5, 1.0],
    layer: 'foreground'
  });

  // Midground grass (medium distance)
  addGrassField(sceneBuilder, {
    density: 45,
    xRange: [-30, 30],
    zRange: [1.2, 2.2],
    scaleRange: [0.4, 0.8],
    layer: 'midground'
  });

  // Background grass (distant, smaller)
  addGrassField(sceneBuilder, {
    density: 55,
    xRange: [-35, 35],
    zRange: [0.5, 1.5],
    scaleRange: [0.2, 0.6],
    layer: 'background'
  });

  return sceneBuilder;
};

// Helper function to create cosine-shaped tree arrangement around valley edges
export const addCosineTreeArrangement = (sceneBuilder, options) => {
  const {
    valleyWidth,           // Total width of the valley (side to side)
    centerDepth,           // How far back the center trees are (z position)
    edgeDepth,             // How close the edge trees come (z position)
    treesPerSide,          // Number of trees on each side of the valley
    centerTrees,           // Number of trees at the center (deepest point)
    thickness,             // How many layers deep the trees are (1 = single line, 2+ = clusters)
    minTreeDistance,       // Minimum distance between any two trees (prevents clipping)
    scaleRange,            // [min, max] scale for trees
    layer,                 // Which layer to place trees on
    treeVariety            // Array of tree model variations
  } = options;

  // Validate required parameters
  if (!valleyWidth || !centerDepth || !edgeDepth || !treesPerSide || !centerTrees || !thickness || !minTreeDistance || !scaleRange || !layer || !treeVariety) {
    throw new Error('addCosineTreeArrangement requires all parameters: valleyWidth, centerDepth, edgeDepth, treesPerSide, centerTrees, thickness, minTreeDistance, scaleRange, layer, treeVariety');
  }

  const trees = [];
  const placedPositions = []; // Track all placed tree positions for collision detection
  
  // Calculate the amplitude of the cosine wave (how much it curves)
  const amplitude = (centerDepth - edgeDepth) / 2;
  const offset = (centerDepth + edgeDepth) / 2;

  // Helper function to check if a position is too close to existing trees
  const isPositionValid = (x, z) => {
    return placedPositions.every(pos => {
      const distance = Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2);
      return distance >= minTreeDistance;
    });
  };

  // Helper function to find a valid position near the desired location
  const findValidPosition = (targetX, targetZ, maxAttempts = 10) => {
    // First try the exact target position
    if (isPositionValid(targetX, targetZ)) {
      return { x: targetX, z: targetZ };
    }

    // Try positions in expanding circles around the target
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const radius = (minTreeDistance * 0.5) * attempt; // Gradually expand search radius
      const angleStep = (Math.PI * 2) / (4 + attempt); // More positions per circle as we expand
      
      for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
        const x = targetX + Math.cos(angle) * radius;
        const z = targetZ + Math.sin(angle) * radius;
        
        if (isPositionValid(x, z)) {
          return { x, z };
        }
      }
    }
    
    // If no valid position found, return null (skip this tree)
    return null;
  };

  // Helper function to create a cluster of trees at a given base position
  const createTreeCluster = (baseX, baseZ, clusterPrefix, clusterIndex) => {
    for (let depth = 0; depth < thickness; depth++) {
      // Calculate depth variation - spread trees forward and backward from base position
      const depthOffset = thickness === 1 ? 0 : (depth - (thickness - 1) / 2) * (9.5 / (thickness - 1 || 1));
      const targetZ = baseZ + depthOffset + (Math.random() - 0.5) * 0.4; // Small random variation
      
      // Add slight x variation for natural clustering
      const xOffset = thickness === 1 ? 0 : (Math.random() - 0.5) * 6.5;
      const targetX = baseX + xOffset;
      
      // Find a valid position that maintains minimum distance
      const validPosition = findValidPosition(targetX, targetZ);
      
      if (validPosition) {
        // Record the position to prevent future collisions
        placedPositions.push({ x: validPosition.x, z: validPosition.z });
        
        const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
        const rotation = (Math.random() - 0.5) * 0.8; // Random rotation
        const treeType = treeVariety[Math.floor(Math.random() * treeVariety.length)];
        
        trees.push({
          id: `${clusterPrefix}_${clusterIndex}_depth_${depth}`,
          type: 'tree',
          url: `/nature_assets/${treeType}.glb`,
          position: [validPosition.x, -2.5, validPosition.z],
          rotation: [0, rotation, 0],
          scale,
          layer
        });
      }
      // If no valid position found, skip this tree (prevents infinite loops)
    }
  };

  // Generate center trees (deepest point) with thickness
  for (let i = 0; i < centerTrees; i++) {
    const xSpread = centerTrees > 1 ? 4 : 0; // Spread center trees across 4 units
    const baseX = centerTrees === 1 ? 0 : (i - (centerTrees - 1) / 2) * (xSpread / (centerTrees - 1));
    const baseZ = centerDepth;
    
    createTreeCluster(baseX, baseZ, 'cosine_tree_center', i + 1);
  }

  // Generate left side trees (cosine curve) with thickness
  for (let i = 0; i < treesPerSide; i++) {
    const progress = (i + 1) / (treesPerSide + 1); // 0 to 1, excluding endpoints
    const baseX = -valleyWidth * progress / 2; // Negative x for left side
    
    // Cosine calculation: starts near center depth, curves to edge depth
    const cosineValue = Math.cos(progress * Math.PI / 2); // 0 to π/2 for smooth curve
    const baseZ = offset + amplitude * cosineValue;
    
    createTreeCluster(baseX, baseZ, 'cosine_tree_left', i + 1);
  }

  // Generate right side trees (mirror of left side) with thickness
  for (let i = 0; i < treesPerSide; i++) {
    const progress = (i + 1) / (treesPerSide + 1);
    const baseX = valleyWidth * progress / 2; // Positive x for right side
    
    const cosineValue = Math.cos(progress * Math.PI / 2);
    const baseZ = offset + amplitude * cosineValue;
    
    createTreeCluster(baseX, baseZ, 'cosine_tree_right', i + 1);
  }

  // Add edge tree clusters for completion
  const edgeDistance = valleyWidth * 0.6;
  
  // Far left edge cluster
  createTreeCluster(-edgeDistance, edgeDepth + Math.random() * 0.6, 'cosine_tree_far_left', 1);
  
  // Far right edge cluster  
  createTreeCluster(edgeDistance, edgeDepth + Math.random() * 0.6, 'cosine_tree_far_right', 1);

  // Add all generated trees to the scene builder
  trees.forEach(tree => sceneBuilder.addElement(tree));
  
  return sceneBuilder;
};

// Helper function to add wildflowers to a pasture
export const addWildflowers = (sceneBuilder, options = {}) => {
  const {
    count = 8,
    xRange = [-12, 12],
    zRange = [1.8, 2.4],
    scaleRange = [0.3, 0.5],
    layer = 'foreground'
  } = options;

  const flowerTypes = ['purple', 'red', 'yellow'];
  
  for (let i = 0; i < count; i++) {
    const x = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
    const z = zRange[0] + Math.random() * (zRange[1] - zRange[0]);
    const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
    const rotation = Math.random() * Math.PI * 2;
    const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
    
    sceneBuilder.addFlower(
      `wildflower_${i}`,
      MODEL_PATHS.flowers[flowerType],
      x, 0, z,
      rotation,
      scale,
      layer
    );
  }
  
  return sceneBuilder;
};

// Predefined model path constants for easy reference
export const MODEL_PATHS = {
  trees: {
    fir: (num) => `/nature_assets/fir_${num.toString().padStart(3, '0')}.glb`
  },
  grass: {
    // Nature assets grass collection
    grass001: '/nature_assets/grass_001.glb',
    grass002: '/nature_assets/grass_002.glb',
    grass003: '/nature_assets/grass_003.glb',
    grass004: '/nature_assets/grass_004.glb',
    grass005: '/nature_assets/grass_005.glb',
    grass006: '/nature_assets/grass_006.glb',
    grass007: '/nature_assets/grass_007.glb',
    grass008: '/nature_assets/grass_008.glb',
    grass009: '/nature_assets/grass_009.glb',
    grass010: '/nature_assets/grass_010.glb',
    // Helper function to get random grass
    random: () => {
      const grassCount = 10;
      const randomNum = Math.floor(Math.random() * grassCount) + 1;
      return `/nature_assets/grass_${randomNum.toString().padStart(3, '0')}.glb`;
    }
  },
  rocks: {
    largeA: '/kenny_nature-kit/Models/GLTF format/rock_largeA.glb',
    largeB: '/kenny_nature-kit/Models/GLTF format/rock_largeB.glb',
    smallA: '/kenny_nature-kit/Models/GLTF format/rock_smallA.glb',
    smallB: '/kenny_nature-kit/Models/GLTF format/rock_smallB.glb'
  },
  plants: {
    bush: '/kenny_nature-kit/Models/GLTF format/plant_bush.glb',
    bushLarge: '/kenny_nature-kit/Models/GLTF format/plant_bushLarge.glb',
    // Legacy grass for compatibility
    grass: '/kenny_nature-kit/Models/GLTF format/grass.glb',
    grassLarge: '/kenny_nature-kit/Models/GLTF format/grass_large.glb'
  },
  flowers: {
    purple: '/kenny_nature-kit/Models/GLTF format/flower_purpleA.glb',
    red: '/kenny_nature-kit/Models/GLTF format/flower_redA.glb',
    yellow: '/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb'
  }
}; 