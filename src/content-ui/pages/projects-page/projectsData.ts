import { Project } from './ProjectCard';

export const projectsData: Project[] = [
  {
    title: "Dark Matter Mapper",
    description: "AI-powered application using PyTorch and FastAPI to predict and visualize 3D dark matter distributions based on SDSS/DES data with interactive Three.js volumetric rendering.",
    technologies: ["Python", "PyTorch", "FastAPI", "React", "Three.js"],
    githubUrl: "https://github.com/jmelgar1/dark-matter-mapper",
    imageUrl: "/project-images/dark-matter-mapper-thumbnail.webp",
    imageAlt: "Dark Matter Mapper visualization interface"
  },
  {
    title: "Meal Planner",
    description: "Full-stack meal planning application using Python (FastAPI) and React, integrating Nutritionix and Spoonacular APIs to provide real-time nutritional analysis and recipe recommendations.",
    technologies: ["Python", "FastAPI", "React", "JavaScript", "Docker"],
    githubUrl: "https://github.com/jmelgar1/meal-planner",
    imageUrl: "/project-images/meal-planner-thumbnail.webp",
    imageAlt: "Meal Planner application dashboard"
  },
  {
    title: "Portfolio Website",
    description: "This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, and modern React architecture built almost entirely with AI assistance.",
    technologies: ["React", "Three.js", "TypeScript"],
    imageUrl: "/project-images/website-thumbnail.webp",
    imageAlt: "Portfolio website with Three.js galaxy background"
  }
];