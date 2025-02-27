# Field Conditions

An experimental vector-based drawing application that uses particle simulations to create dynamic artwork. Inspired by Stan Allen's architectural theory of field conditions.

## Technical Overview

Built with:
- TypeScript/React for the UI
- Paper.js for vector graphics handling
- Particle simulation system written in TypeScript

## Core Features

### Particle System
- Real-time particle simulation with various behaviors:
  - Flocking (separation, cohesion, alignment)
  - Magnetism 
  - Aggregation
  - DLA (Diffusion Limited Aggregation)
  - Wandering
  - Background color forces
  - External forces
  - Obstacle avoidance

### Boundary Behaviors
- Reflection
- Wrap-around
- Stop at edges
- Travel off canvas

### Drawing Tools
- Interactive particle drawing
- Seed particle placement
- Obstacle creation
- Eraser tool
- Freehand path drawing

### Export Options
- SVG export
- Background image support 
- Canvas color controls

## Interface

The application features a control panel with:
- Particle Settings: Customize appearance and behavior of particles
- Behavior Controls: Toggle and adjust different simulation forces
- Canvas Settings: Background and boundary controls

## Architecture

The core simulation is built around several key classes:

### VectorParticleSystem
Central controller class that manages:
- Canvas setup and management
- Particle creation and updates
- Obstacle handling
- SVG import/export
- Background management

### ParticleUpdater
Handles particle physics and behavior calculations including:
- Force application
- Boundary behaviors
- Collision detection
- Trail rendering

### ParticleCreator
Manages particle instantiation with:
- Position initialization
- Visual properties
- State management
- Trail creation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Requirements

- Node.js 16+
- Modern web browser with WebGL support

## License

MIT License

## Contributing

Contributions welcome! 