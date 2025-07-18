# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based portfolio website built with Three.js and React Three Fiber. It features an immersive 3D space theme with an astronaut helmet, holographic panels, and various stellar effects. The site uses horizontal scrolling to navigate between content sections.

## Development Commands

### Start Development Server
```bash
npm run dev
# or
npm start
```
Both commands start the Vite development server on port 3000 and automatically open the browser.

### Build and Preview
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

### Testing
```bash
npm test         # Run all tests with Vitest
```

The project uses Vitest for testing with jsdom environment and React Testing Library.

## Architecture

### Main Application Structure
- **Entry Point**: `src/index.tsx` → `src/App.tsx`
- **Core Component**: `SpaceBackground` serves as the main container that renders both the 3D Three.js scene and the content sections
- **3D Scene**: Built with `@react-three/fiber` Canvas containing lighting, camera controls, and 3D objects
- **Content Layout**: Horizontal scrolling sections (Intro, Projects, Work History) overlaid on the 3D scene

### Key Architectural Patterns

**3D Scene Architecture:**
- `SpaceBackground.tsx`: Main container with Canvas and content sections
- `Starfield.tsx`: Background star field with twinkling effects
- `ShootingStars.tsx`: Animated shooting star effects
- `AstronautHelmet.tsx`: Central 3D model with holographic panels
- `MouseCameraController.tsx`: Handles camera movement based on mouse input

**Content Sections:**
- Each section (Intro, Projects, Work History) is a separate component
- Uses horizontal scrolling with `useHorizontalScroll` hook
- Positioned absolutely over the 3D scene

**Component Organization:**
- `background/`: 3D scene components and star effects
- `astronaut-helmet/`: Helmet model and holographic panels
- `components/content/`: Content sections for the portfolio
- `camera-controller/`: Camera interaction logic
- `hooks/`: Custom React hooks

### Key Dependencies
- **Three.js Ecosystem**: `three`, `@react-three/fiber`, `@react-three/drei`
- **Animation**: `@react-spring/three` for smooth animations
- **Testing**: `vitest`, `@testing-library/react`, `@react-three/test-renderer`

### File Structure Notes
- 3D assets (`.glb` files) are supported via Vite configuration
- TypeScript strict mode enabled
- Component-specific CSS files are co-located with components
- Test files follow `.test.tsx` naming convention

### Development Notes
- The project uses Vite for fast development and building
- Hot reload is enabled for both React components and 3D scenes
- Browser opens automatically when starting development server
- Build output goes to `build/` directory