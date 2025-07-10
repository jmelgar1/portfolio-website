# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server (default port 3000)
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (avoid unless necessary)

## Architecture Overview

This is a React-based portfolio website featuring a unique horizontal scrolling design with a Three.js background canvas. The application is built with Create React App and uses React Three Fiber for 3D graphics integration.

### Core Components Structure

**Main App (`src/App.js`)**:
- Orchestrates horizontal scrolling through three main sections: intro, work, projects
- Uses `useHorizontalScroll` custom hook for smooth scrolling with wheel and keyboard controls
- Integrates `ThreeJSBackground` component for 3D canvas background
- Includes section indicators and scroll progress bar

**Horizontal Scrolling System (`src/hooks/useHorizontalScroll.js`)**:
- Custom hook managing scroll position with smooth animations using requestAnimationFrame
- Supports both mouse wheel and arrow key navigation with configurable sensitivity
- Provides utilities: getCurrentSection(), getSectionProgress(), scrollToSection()
- Uses 0.1 easing factor for smooth scroll animations
- Handles continuous key press for smooth keyboard scrolling

**Three.js Integration (`src/components/threejs/ThreeJSBackground.js`)**:
- Three.js canvas setup using React Three Fiber with NodeNetwork component
- Contains ambient and directional lighting for 3D scene illumination
- Features animated 3-node network that becomes visible when scrolling past the main sections
- Uses high-performance rendering with antialias and alpha support

**Node Network (`src/components/threejs/NodeNetwork.js`)**:
- 3D animated node network with triangular formation of connected spheres
- Nodes feature rotating animations and emissive materials in different colors
- Connecting edges with pulsing opacity animations
- Visibility controlled by scroll position - appears when scrolling beyond 300vw
- Network scales and positions dynamically based on scroll progress

### Content Sections

- **IntroSection** (`src/components/IntroSection.js`) - Landing/hero section
- **WorkHistory** (`src/components/WorkHistory.js`) - Professional experience display  
- **ProjectsSection** (`src/components/ProjectsSection.js`) - Portfolio project showcase

Each section is 100vw wide and slides horizontally based on scroll position controlled by `translateX`.

## Development Notes

- Built with React 19 and React Three Fiber
- Uses Create React App configuration with React Scripts 5.0.1
- Three.js version 0.177.0 with @react-three/fiber 9.1.2 and @react-three/drei 10.1.2
- Custom horizontal scrolling replaces traditional vertical scrolling
- Scroll position controls both content translation and can be used for Three.js scene updates
- Section navigation includes visual indicators and progress tracking

## Change Tracking

When making modifications to this codebase, maintain a record of changes in `logs/CHANGELOG.md`. Include:
- What was changed and why
- Files modified
- Key decisions made
- Any breaking changes or considerations for future development
- For changelogs created during sessions in the @logs/ folder, ensure they are named properly in the following format (mm-dd-yyyy s1,2,3,etc), the "s" stands for session and we will increment as necessary.