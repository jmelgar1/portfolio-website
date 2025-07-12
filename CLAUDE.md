# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server (default port 3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (avoid unless necessary)

**Important**: Do not run `npm start` or attempt to start the development server. Assume the user already has the application running locally.

## Architecture Overview

This is a React-based portfolio website featuring an interactive 3D space scene as the primary interface. The application is built with Create React App and uses React Three Fiber for immersive 3D graphics.

### Current Project Structure

```
src/
├── App.tsx (main component with ThreeJSBackground)
├── background/
│   ├── ThreeJSBackground.tsx (main 3D scene controller)
│   ├── ThreeJSBackground.css
│   ├── stars/
│   │   ├── shooting-star/ (animated shooting stars)
│   │   └── star-field/ (static + twinkling stars)
│   ├── types.ts
│   └── utils.ts
├── astronaut-helmet/
│   └── AstronautHelmet.tsx (3D GLTF helmet model)
├── components/
│   ├── content/ (portfolio sections - currently not integrated)
│   │   ├── intro-section/
│   │   ├── projects-section/
│   │   └── work-history/
│   └── cursor-trail/ (particle trail system)
└── hooks/
    └── useHorizontalScroll.ts (available but not currently used)
```

### Core Components Structure

**Main App (`src/App.tsx`)**:
- Simplified design focusing on the 3D space scene
- Integrates `ThreeJSBackground` as the primary interface
- Currently does not include content sections or horizontal scrolling

**Three.js Background (`src/background/ThreeJSBackground.tsx`)**:
- Interactive 3D space scene with mouse-controlled camera
- Features astronaut helmet, starfield, and shooting stars
- Mouse tracking with smooth camera rotation and auto-return functionality
- Performance-optimized rendering with advanced lighting

**Astronaut Helmet (`src/astronaut-helmet/AstronautHelmet.tsx`)**:
- 3D GLTF model component loading space_helmet.glb
- Positioned and scaled as central focal point
- Uses React Three Fiber GLTF loader with Suspense

**Star System (`src/background/stars/`)**:
- **Starfield**: 1500 static stars + 800 twinkling stars for depth
- **TwinklingStarGroup**: Performance-optimized grouped twinkling animation
- **ShootingStars**: Animated meteors with particle trails
- Frustum-based generation for realistic star distribution

**Cursor Trail (`src/components/cursor-trail/CursorTrail.tsx`)**:
- HTML5 Canvas-based particle system
- Rainbow color cycling particles that connect when in proximity
- Smooth fade-out effects with size reduction over time
- Fixed overlay positioning with pointer-events disabled

**Horizontal Scrolling System (`src/hooks/useHorizontalScroll.ts`)**:
- Available but not currently integrated
- Full implementation with smooth animations using requestAnimationFrame
- Supports mouse wheel and keyboard navigation
- Provides section utilities and progress tracking

### Available Content Sections (Not Currently Active)

- **IntroSection** (`src/components/content/intro-section/`) - Landing/hero section
- **WorkHistory** (`src/components/content/work-history/`) - Professional experience
- **ProjectsSection** (`src/components/content/projects-section/`) - Portfolio showcase

## Development Notes

- Built with React 19.1.0 and React Three Fiber ecosystem
- Uses Create React App configuration with React Scripts 5.0.1
- Dependencies: Three.js 0.177.0, @react-three/fiber 9.1.2, @react-three/drei 10.1.2
- Includes @react-spring/three 10.0.1 for enhanced animations
- Full TypeScript support with strict type checking enabled
- Features dual canvas system: React Three Fiber for 3D and HTML5 for cursor trail
- 3D assets available in public/ directory (space_helmet.glb)
- Mouse-controlled camera with rotation limits and smooth interpolation
- Performance optimizations including frustum culling and grouped animations

## keep everything below and organize as you wish with new claude.md

**Important**: Do not run `npm start` or attempt to start the development server. Assume the user already has the application running locally.

## Change Tracking

When making modifications to this codebase, maintain a record of changes in `logs/CHANGELOG.md`. Include:
- What was changed and why
- Files modified
- Key decisions made
- Any breaking changes or considerations for future development
- For changelogs created during sessions in the @logs/ folder, ensure they are named properly in the following format (mm-dd-yyyy s1,2,3,etc), the "s" stands for session and we will increment as necessary.