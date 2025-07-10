# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server (default port 3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (avoid unless necessary)

**Important**: Do not run `npm start` or attempt to start the development server. Assume the user already has the application running locally.

## Architecture Overview

This is a React-based portfolio website featuring a unique horizontal scrolling design with a Three.js background canvas. The application is built with Create React App and uses React Three Fiber for 3D graphics integration.

### Core Components Structure

**Main App (`src/App.tsx`)**:
- Orchestrates horizontal scrolling through three main sections: intro, work, projects
- Uses `useHorizontalScroll` custom hook for smooth scrolling with wheel and keyboard controls
- Integrates `ThreeJSBackground` component for 3D canvas background
- Includes `CursorTrail` component for interactive particle effects
- Includes section indicators and scroll progress bar
- Configured with 350 maxScroll and 0.6 sensitivity for scroll interactions

**Horizontal Scrolling System (`src/hooks/useHorizontalScroll.ts`)**:
- Custom hook managing scroll position with smooth animations using requestAnimationFrame
- Supports both mouse wheel and arrow key navigation with configurable sensitivity
- Provides utilities: getCurrentSection(), getSectionProgress(), scrollToSection()
- Uses 0.1 easing factor for smooth scroll animations
- Handles continuous key press for smooth keyboard scrolling

**Three.js Integration (`src/components/threejs/ThreeJSBackground.tsx`)**:
- Three.js canvas setup using React Three Fiber with Starfield component
- Contains ambient and directional lighting for enhanced 3D scene illumination
- Features animated starfield with 2000 stars that respond to scroll position
- Uses high-performance rendering with antialias and alpha support

**Cursor Trail (`src/components/CursorTrail.tsx`)**:
- Interactive particle system that follows mouse movement
- Canvas-based rendering with dynamic hue cycling for rainbow effects
- Particle connection system with distance-based opacity
- Fixed positioning overlay with pointer-events disabled
- Particles fade out over time with size reduction for smooth trail effect

### Content Sections

- **IntroSection** (`src/components/IntroSection.tsx`) - Landing/hero section
- **WorkHistory** (`src/components/WorkHistory.tsx`) - Professional experience display  
- **ProjectsSection** (`src/components/ProjectsSection.tsx`) - Portfolio project showcase

Each section is 100vw wide and slides horizontally based on scroll position controlled by `translateX`.

## Development Notes

- Built with React 19.1.0 and React Three Fiber
- Uses Create React App configuration with React Scripts 5.0.1
- Three.js version 0.177.0 with @react-three/fiber 9.1.2 and @react-three/drei 10.1.2
- Includes @react-spring/three 10.0.1 for enhanced animations
- Full TypeScript support with strict type checking enabled
- Custom horizontal scrolling replaces traditional vertical scrolling
- Scroll position controls both content translation and Three.js scene updates
- Section navigation includes visual indicators and progress tracking
- Features dual canvas system: Three.js for 3D graphics and HTML5 canvas for cursor trail
- Extensive 3D asset collections available in public/ directory

## Change Tracking

When making modifications to this codebase, maintain a record of changes in `logs/CHANGELOG.md`. Include:
- What was changed and why
- Files modified
- Key decisions made
- Any breaking changes or considerations for future development
- For changelogs created during sessions in the @logs/ folder, ensure they are named properly in the following format (mm-dd-yyyy s1,2,3,etc), the "s" stands for session and we will increment as necessary.