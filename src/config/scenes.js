// Scene configuration file for predefined, static scene layouts
// This allows for precise control over scene composition while maintaining scalability

export const SCENE_CONFIGS = {
  forestScene: {
    name: "Forest Scene",
    description: "A carefully crafted forest scene with strategic placement",
    elements: [
      // Front row - Large focal trees
      {
        id: "tree_focal_1",
        type: "tree",
        url: "/nature_assets/fir_001.glb",
        position: [-10, -2.5, 2.5],
        rotation: [0, 0.2, 0],
        scale: 1.2,
        layer: "foreground"
      },
      {
        id: "tree_focal_2", 
        type: "tree",
        url: "/nature_assets/fir_015.glb",
        position: [8, -2.5, 2.8],
        rotation: [0, -0.3, 0],
        scale: 1.1,
        layer: "foreground"
      },
      {
        id: "tree_focal_3",
        type: "tree", 
        url: "/nature_assets/fir_032.glb",
        position: [15, -2.5, 2.2],
        rotation: [0, 0.5, 0],
        scale: 0.9,
        layer: "foreground"
      },

      // Mid-ground trees - filling the scene
      {
        id: "tree_mid_1",
        type: "tree",
        url: "/nature_assets/fir_008.glb",
        position: [-8, -2.5, 1.8],
        rotation: [0, 0.1, 0],
        scale: 0.8,
        layer: "midground"
      },
      {
        id: "tree_mid_2",
        type: "tree",
        url: "/nature_assets/fir_023.glb", 
        position: [-4, -2.5, 1.5],
        rotation: [0, -0.2, 0],
        scale: 0.7,
        layer: "midground"
      },
      {
        id: "tree_mid_3",
        type: "tree",
        url: "/nature_assets/fir_041.glb",
        position: [2, -2.5, 1.9],
        rotation: [0, 0.4, 0],
        scale: 0.85,
        layer: "midground"
      },
      {
        id: "tree_mid_4",
        type: "tree",
        url: "/nature_assets/fir_055.glb",  
        position: [12, -2.5, 1.6],
        rotation: [0, -0.1, 0],
        scale: 0.75,
        layer: "midground"
      },
      {
        id: "tree_mid_5",
        type: "tree",
        url: "/nature_assets/fir_019.glb",
        position: [-15, -2.5, 1.4],
        rotation: [0, 0.3, 0],
        scale: 0.9,
        layer: "midground"
      },

      // Background trees - creating depth
      {
        id: "tree_bg_1",
        type: "tree",
        url: "/nature_assets/fir_005.glb",
        position: [-10, -2.5, 0.8],
        rotation: [0, 0.15, 0],
        scale: 0.6,
        layer: "background"
      },
      {
        id: "tree_bg_2",
        type: "tree", 
        url: "/nature_assets/fir_037.glb",
        position: [5, -2.5, 0.5],
        rotation: [0, -0.25, 0],
        scale: 0.65,
        layer: "background"
      },
      {
        id: "tree_bg_3",
        type: "tree",
        url: "/nature_assets/fir_060.glb",
        position: [18, -2.5, 0.9],
        rotation: [0, 0.2, 0],
        scale: 0.55,
        layer: "background"
      },

      // Strategic rock placement
      {
        id: "rock_large_1",
        type: "rock",
        url: "/kenny_nature-kit/Models/GLTF format/rock_largeA.glb",
        position: [-5, -2.5, 2.1],
        rotation: [0, 0.8, 0],
        scale: 0.4,
        layer: "foreground"
      },
      {
        id: "rock_small_1",
        type: "rock",
        url: "/kenny_nature-kit/Models/GLTF format/rock_smallB.glb", 
        position: [10, -2.5, 2.3],
        rotation: [0, -0.6, 0],
        scale: 0.25,
        layer: "foreground"
      },
      {
        id: "rock_medium_1",
        type: "rock",
        url: "/kenny_nature-kit/Models/GLTF format/rock_largeB.glb",
        position: [-18, -2.5, 1.2],
        rotation: [0, 1.2, 0], 
        scale: 0.3,
        layer: "midground"
      },

      // Strategic plant placement
      {
        id: "bush_1",
        type: "plant",
        url: "/kenny_nature-kit/Models/GLTF format/plant_bushLarge.glb",
        position: [-2, -2.5, 2.4],
        rotation: [0, 0.3, 0],
        scale: 0.5,
        layer: "foreground"
      },
      {
        id: "bush_2", 
        type: "plant",
        url: "/kenny_nature-kit/Models/GLTF format/plant_bush.glb",
        position: [6, -2.5, 2.0],
        rotation: [0, -0.4, 0],
        scale: 0.4,
        layer: "foreground"
      },
      {
        id: "grass_1",
        type: "plant",
        url: "/nature_assets/grass_003.glb",
        position: [-7, -2.5, 2.2],
        rotation: [0, 0.1, 0],
        scale: 0.6,
        layer: "foreground"
      },
      {
        id: "grass_2",
        type: "plant", 
        url: "/nature_assets/grass_007.glb",
        position: [14, -2.5, 1.8],
        rotation: [0, 0.7, 0],
        scale: 0.45,
        layer: "midground"
      },

      // Dense grass pasture - scattered throughout using nature_assets
      {
        id: "pasture_grass_1",
        type: "plant",
        url: "/nature_assets/grass_001.glb",
        position: [-12, -2.5, 2.3],
        rotation: [0, 0.3, 0],
        scale: 0.7,
        layer: "foreground"
      },
      {
        id: "pasture_grass_2",
        type: "plant",
        url: "/nature_assets/grass_004.glb",
        position: [-9, -2.5, 2.1],
        rotation: [0, -0.2, 0],
        scale: 0.5,
        layer: "foreground"
      },
      {
        id: "pasture_grass_3",
        type: "plant",
        url: "/nature_assets/grass_002.glb",
        position: [-1, -2.5, 2.5],
        rotation: [0, 0.8, 0],
        scale: 0.6,
        layer: "foreground"
      },
      {
        id: "pasture_grass_4",
        type: "plant",
        url: "/nature_assets/grass_008.glb",
        position: [3, -2.5, 2.2],
        rotation: [0, -0.5, 0],
        scale: 0.45,
        layer: "foreground"
      },
      {
        id: "pasture_grass_5",
        type: "plant",
        url: "/nature_assets/grass_005.glb",
        position: [7, -2.5, 2.4],
        rotation: [0, 0.1, 0],
        scale: 0.65,
        layer: "foreground"
      },
      {
        id: "pasture_grass_6",
        type: "plant",
        url: "/nature_assets/grass_009.glb",
        position: [13, -2.5, 2.0],
        rotation: [0, 0.6, 0],
        scale: 0.5,
        layer: "foreground"
      },
      
      // Mid-ground grass patches using nature_assets
      {
        id: "mid_grass_1",
        type: "plant",
        url: "/nature_assets/grass_006.glb",
        position: [-6, -2.5, 1.7],
        rotation: [0, -0.3, 0],
        scale: 0.55,
        layer: "midground"
      },
      {
        id: "mid_grass_2",
        type: "plant",
        url: "/nature_assets/grass_010.glb",
        position: [1, -2.5, 1.4],
        rotation: [0, 0.4, 0],
        scale: 0.4,
        layer: "midground"
      },
      {
        id: "mid_grass_3",
        type: "plant",
        url: "/nature_assets/grass_003.glb",
        position: [9, -2.5, 1.3],
        rotation: [0, -0.1, 0],
        scale: 0.5,
        layer: "midground"
      },

      // Flower accents scattered in pasture
      {
        id: "flower_purple_1",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_purpleA.glb",
        position: [-3, -2.5, 2.6],
        rotation: [0, 0.2, 0],
        scale: 0.5,
        layer: "foreground"
      },
      {
        id: "flower_red_1",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_redA.glb", 
        position: [4, -2.5, 2.4],
        rotation: [0, -0.3, 0],
        scale: 0.45,
        layer: "foreground"
      },
      {
        id: "flower_yellow_1",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb",
        position: [11, -2.5, 2.1],
        rotation: [0, 0.5, 0],
        scale: 0.4,
        layer: "foreground"
      },
      {
        id: "flower_purple_2",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_purpleA.glb",
        position: [-8, -2.5, 2.0],
        rotation: [0, -0.4, 0],
        scale: 0.35,
        layer: "foreground"
      },
      {
        id: "flower_yellow_2",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb",
        position: [16, -2.5, 1.9],
        rotation: [0, 0.7, 0],
        scale: 0.4,
        layer: "midground"
      },

      // Additional comprehensive grass coverage for complete ground coverage
      {
        id: "extra_grass_1",
        type: "plant",
        url: "/nature_assets/grass_001.glb",
        position: [-20, -2.5, 2.1],
        rotation: [0, 0.3, 0],
        scale: 0.6,
        layer: "foreground"
      },
      {
        id: "extra_grass_2",
        type: "plant",
        url: "/nature_assets/grass_004.glb",
        position: [-17, -2.5, 2.4],
        rotation: [0, -0.2, 0],
        scale: 0.7,
        layer: "foreground"
      },
      {
        id: "extra_grass_3",
        type: "plant",
        url: "/nature_assets/grass_007.glb",
        position: [-5, -2.5, 2.7],
        rotation: [0, 0.6, 0],
        scale: 0.5,
        layer: "foreground"
      },
      {
        id: "extra_grass_4",
        type: "plant",
        url: "/nature_assets/grass_010.glb",
        position: [0, -2.5, 2.6],
        rotation: [0, -0.4, 0],
        scale: 0.8,
        layer: "foreground"
      },
      {
        id: "extra_grass_5",
        type: "plant",
        url: "/nature_assets/grass_003.glb",
        position: [5, -2.5, 2.5],
        rotation: [0, 0.1, 0],
        scale: 0.6,
        layer: "foreground"
      },
      {
        id: "extra_grass_6",
        type: "plant",
        url: "/nature_assets/grass_006.glb",
        position: [17, -2.5, 2.2],
        rotation: [0, -0.5, 0],
        scale: 0.7,
        layer: "foreground"
      },
      {
        id: "extra_grass_7",
        type: "plant",
        url: "/nature_assets/grass_009.glb",
        position: [20, -2.5, 2.3],
        rotation: [0, 0.8, 0],
        scale: 0.5,
        layer: "foreground"
      },
      // Midground fill grass
      {
        id: "mid_fill_grass_1",
        type: "plant",
        url: "/nature_assets/grass_002.glb",
        position: [-18, -2.5, 1.5],
        rotation: [0, 0.2, 0],
        scale: 0.4,
        layer: "midground"
      },
      {
        id: "mid_fill_grass_2",
        type: "plant",
        url: "/nature_assets/grass_008.glb",
        position: [-12, -2.5, 1.8],
        rotation: [0, -0.3, 0],
        scale: 0.5,
        layer: "midground"
      },
      {
        id: "mid_fill_grass_3",
        type: "plant",
        url: "/nature_assets/grass_005.glb",
        position: [-2, -2.5, 1.6],
        rotation: [0, 0.4, 0],
        scale: 0.45,
        layer: "midground"
      },
      {
        id: "mid_fill_grass_4",
        type: "plant",
        url: "/nature_assets/grass_001.glb",
        position: [6, -2.5, 1.4],
        rotation: [0, -0.1, 0],
        scale: 0.6,
        layer: "midground"
      },
      {
        id: "mid_fill_grass_5",
        type: "plant",
        url: "/nature_assets/grass_007.glb",
        position: [15, -2.5, 1.7],
        rotation: [0, 0.5, 0],
        scale: 0.4,
        layer: "midground"
      },
      // Background grass coverage
      {
        id: "bg_fill_grass_1",
        type: "plant",
        url: "/nature_assets/grass_003.glb",
        position: [-14, -2.5, 0.9],
        rotation: [0, 0.3, 0],
        scale: 0.3,
        layer: "background"
      },
      {
        id: "bg_fill_grass_2",
        type: "plant",
        url: "/nature_assets/grass_006.glb",
        position: [-7, -2.5, 1.1],
        rotation: [0, -0.2, 0],
        scale: 0.35,
        layer: "background"
      },
      {
        id: "bg_fill_grass_3",
        type: "plant",
        url: "/nature_assets/grass_004.glb",
        position: [3, -2.5, 0.8],
        rotation: [0, 0.6, 0],
        scale: 0.4,
        layer: "background"
      },
      {
        id: "bg_fill_grass_4",
        type: "plant",
        url: "/nature_assets/grass_009.glb",
        position: [11, -2.5, 1.0],
        rotation: [0, -0.4, 0],
        scale: 0.25,
        layer: "background"
      },
      {
        id: "bg_fill_grass_5",
        type: "plant",
        url: "/nature_assets/grass_010.glb",
        position: [19, -2.5, 0.7],
        rotation: [0, 0.1, 0],
        scale: 0.3,
        layer: "background"
      }
    ]
  },

  grassPasture: {
    name: "Grass Pasture",
    description: "An open grass pasture with scattered wildflowers",
    elements: [
      // Sparse trees around the edges
      {
        id: "edge_tree_1",
        type: "tree",
        url: "/nature_assets/fir_001.glb",
        position: [-18, -2.5, 1.2],
        rotation: [0, 0.3, 0],
        scale: 0.8,
        layer: "background"
      },
      {
        id: "edge_tree_2",
        type: "tree",
        url: "/nature_assets/fir_025.glb",
        position: [17, -2.5, 1.1],
        rotation: [0, -0.4, 0],
        scale: 0.9,
        layer: "background"
      },

      // Dense grass throughout the pasture using nature_assets
      {
        id: "pasture_main_1",
        type: "plant",
        url: "/nature_assets/grass_001.glb",
        position: [-10, -2.5, 2.3],
        rotation: [0, 0.2, 0],
        scale: 0.8,
        layer: "foreground"
      },
      {
        id: "pasture_main_2",
        type: "plant",
        url: "/nature_assets/grass_004.glb",
        position: [-6, -2.5, 2.1],
        rotation: [0, -0.3, 0],
        scale: 0.6,
        layer: "foreground"
      },
      {
        id: "pasture_main_3",
        type: "plant",
        url: "/nature_assets/grass_007.glb",
        position: [-2, -2.5, 2.4],
        rotation: [0, 0.5, 0],
        scale: 0.7,
        layer: "foreground"
      },
      {
        id: "pasture_main_4",
        type: "plant",
        url: "/nature_assets/grass_002.glb",
        position: [2, -2.5, 2.2],
        rotation: [0, -0.1, 0],
        scale: 0.5,
        layer: "foreground"
      },
      {
        id: "pasture_main_5",
        type: "plant",
        url: "/nature_assets/grass_008.glb",
        position: [6, -2.5, 2.3],
        rotation: [0, 0.7, 0],
        scale: 0.8,
        layer: "foreground"
      },
      {
        id: "pasture_main_6",
        type: "plant",
        url: "/nature_assets/grass_005.glb",
        position: [10, -2.5, 2.1],
        rotation: [0, -0.4, 0],
        scale: 0.6,
        layer: "foreground"
      },

      // Wildflowers scattered throughout
      {
        id: "wildflower_1",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb",
        position: [-8, -2.5, 2.5],
        rotation: [0, 0.3, 0],
        scale: 0.4,
        layer: "foreground"
      },
      {
        id: "wildflower_2",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_purpleA.glb",
        position: [-3, -2.5, 2.2],
        rotation: [0, -0.2, 0],
        scale: 0.35,
        layer: "foreground"
      },
      {
        id: "wildflower_3",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_redA.glb",
        position: [4, -2.5, 2.4],
        rotation: [0, 0.6, 0],
        scale: 0.4,
        layer: "foreground"
      },
      {
        id: "wildflower_4",
        type: "flower",
        url: "/kenny_nature-kit/Models/GLTF format/flower_yellowA.glb",
        position: [8, -2.5, 2.2],
        rotation: [0, -0.5, 0],
        scale: 0.38,
        layer: "foreground"
      }
    ]
  }
};

// Helper function to get scene by name
export const getSceneConfig = (sceneName) => {
  return SCENE_CONFIGS[sceneName] || null;
};

// Helper function to get elements by layer
export const getElementsByLayer = (sceneConfig, layer) => {
  return sceneConfig.elements.filter(element => element.layer === layer);
};

// Helper function to validate scene config
export const validateSceneConfig = (config) => {
  if (!config || !config.elements) return false;
  
  return config.elements.every(element => 
    element.id && 
    element.type && 
    element.url && 
    element.position && 
    element.position.length === 3
  );
}; 