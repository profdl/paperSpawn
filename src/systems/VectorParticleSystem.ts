import paper from 'paper';
import { ParticleType, SimulationSettings } from '../types/particle';

export class VectorParticleSystem {
  private project: paper.Project;
  private particles: paper.Group;
  private trails: paper.Group;
  private particleRadius: number = 2;
  private trailWidth: number = 1;
  private eraserCircle: paper.Path.Circle | null = null;
  private rectangles: paper.Path.Rectangle[] = [];
  private selectedItem: paper.Item | null = null;
  private transformHandles: paper.Group | null = null;
  private wanderAngles: Map<number, number> = new Map();
  private clipboard: paper.Item | null = null;

  private createTransformHandles(bounds: paper.Rectangle): paper.Group {
    const handles = new paper.Group();
    const handleSize = 6;
    const rotateHandleOffset = 20;

    // Create resize handles
    const positions = [
      { x: bounds.left, y: bounds.top }, // Top-left
      { x: bounds.center.x, y: bounds.top }, // Top-center
      { x: bounds.right, y: bounds.top }, // Top-right
      { x: bounds.right, y: bounds.center.y }, // Middle-right
      { x: bounds.right, y: bounds.bottom }, // Bottom-right
      { x: bounds.center.x, y: bounds.bottom }, // Bottom-center
      { x: bounds.left, y: bounds.bottom }, // Bottom-left
      { x: bounds.left, y: bounds.center.y }, // Middle-left
    ];

    positions.forEach((pos, i) => {
      const handle = new paper.Path.Rectangle({
        center: [pos.x, pos.y],
        size: [handleSize, handleSize],
        fillColor: 'white',
        strokeColor: '#0066ff',
        strokeWidth: 1,
        data: { type: 'resize', index: i }
      });
      handles.addChild(handle);
    });

    // Create rotation handle
    const rotateHandle = new paper.Path.Circle({
      center: [bounds.center.x, bounds.top - rotateHandleOffset],
      radius: handleSize / 2,
      fillColor: 'white',
      strokeColor: '#0066ff',
      strokeWidth: 1,
      data: { type: 'rotate' }
    });

    // Add connecting line to rotation handle
    const rotateLine = new paper.Path.Line({
      from: [bounds.center.x, bounds.top],
      to: [bounds.center.x, bounds.top - rotateHandleOffset + handleSize/2],
      strokeColor: '#0066ff',
      strokeWidth: 1,
      data: { type: 'rotateLine' }
    });

    handles.addChildren([rotateLine, rotateHandle]);
    return handles;
  }

  selectItemAt(point: paper.Point): void {
    // Clear existing selection
    this.clearSelection();

    // Hit test for items
    const hitResult = paper.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 5
    });

    if (hitResult && hitResult.item) {
      // Only select rectangles
      const rectangle = this.rectangles.find(r => r === hitResult.item);
      if (rectangle) {
        this.selectedItem = rectangle;
        this.transformHandles = this.createTransformHandles(rectangle.bounds);
        rectangle.selected = true;
        paper.view.update();
      }
    }
  }

  clearSelection(): void {
    if (this.selectedItem) {
      this.selectedItem.selected = false;
      this.selectedItem = null;
    }
    if (this.transformHandles) {
      this.transformHandles.remove();
      this.transformHandles = null;
    }
    paper.view.update();
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    if (!this.selectedItem || !this.transformHandles) return;

    // Check if we're interacting with any handle
    const hitHandle = this.transformHandles.children.find(child => {
      if (!child.data) return false;
      return child.bounds.contains(point);
    });

    if (!hitHandle) {
      // If no handle was hit, move the entire shape
      this.selectedItem.position = this.selectedItem.position.add(delta);
      this.transformHandles.position = this.transformHandles.position.add(delta);
      paper.view.update();
      return;
    }

    const handleData = hitHandle.data;

    if (handleData.type === 'resize') {
      // Implement resize logic based on handle index
      const bounds = this.selectedItem.bounds;
      
      // Calculate scale factors based on handle position
      const dx = delta.x;
      const dy = delta.y;
      
      let matrix = new paper.Matrix();
      
      switch (handleData.index) {
        case 0: // Top-left
          matrix.translate(bounds.bottomRight);
          matrix.scale(
            Math.max(0.1, (bounds.width - dx) / bounds.width),
            Math.max(0.1, (bounds.height - dy) / bounds.height)
          );
          matrix.translate(bounds.bottomRight.multiply(-1));
          break;
        case 2: // Top-right
          matrix.translate(bounds.bottomLeft);
          matrix.scale(
            Math.max(0.1, (bounds.width + dx) / bounds.width),
            Math.max(0.1, (bounds.height - dy) / bounds.height)
          );
          matrix.translate(bounds.bottomLeft.multiply(-1));
          break;
        case 4: // Bottom-right
          matrix.translate(bounds.topLeft);
          matrix.scale(
            Math.max(0.1, (bounds.width + dx) / bounds.width),
            Math.max(0.1, (bounds.height + dy) / bounds.height)
          );
          matrix.translate(bounds.topLeft.multiply(-1));
          break;
        case 6: // Bottom-left
          matrix.translate(bounds.topRight);
          matrix.scale(
            Math.max(0.1, (bounds.width - dx) / bounds.width),
            Math.max(0.1, (bounds.height + dy) / bounds.height)
          );
          matrix.translate(bounds.topRight.multiply(-1));
          break;
        case 1: // Top-center
          matrix.translate(bounds.bottomCenter);
          matrix.scale(1, Math.max(0.1, (bounds.height - dy) / bounds.height));
          matrix.translate(bounds.bottomCenter.multiply(-1));
          break;
        case 3: // Middle-right
          matrix.translate(bounds.leftCenter);
          matrix.scale(Math.max(0.1, (bounds.width + dx) / bounds.width), 1);
          matrix.translate(bounds.leftCenter.multiply(-1));
          break;
        case 5: // Bottom-center
          matrix.translate(bounds.topCenter);
          matrix.scale(1, Math.max(0.1, (bounds.height + dy) / bounds.height));
          matrix.translate(bounds.topCenter.multiply(-1));
          break;
        case 7: // Middle-left
          matrix.translate(bounds.rightCenter);
          matrix.scale(Math.max(0.1, (bounds.width - dx) / bounds.width), 1);
          matrix.translate(bounds.rightCenter.multiply(-1));
          break;
      }

      this.selectedItem.transform(matrix);
      this.transformHandles.remove();
      this.transformHandles = this.createTransformHandles(this.selectedItem.bounds);
    } else if (handleData.type === 'rotate') {
      // Implement rotation logic
      const bounds = this.selectedItem.bounds;
      const center = bounds.center;
      const currentPoint = new paper.Point(point.x, point.y);
      
      // Calculate angle from center to current point
      const angleToPoint = Math.atan2(
        currentPoint.y - center.y,
        currentPoint.x - center.x
      );
      
      // Calculate angle from center to last position
      const lastPoint = new paper.Point(
        point.x - delta.x,
        point.y - delta.y
      );
      const lastAngle = Math.atan2(
        lastPoint.y - center.y,
        lastPoint.x - center.x
      );
      
      // Calculate the change in angle
      let angleDelta = (angleToPoint - lastAngle) * 180 / Math.PI;
      
      // Snap to 45-degree increments if shift is held
      if (shiftKey) {
        angleDelta = Math.round(angleDelta / 45) * 45;
      }
      
      this.selectedItem.rotate(angleDelta, center);
      
      this.transformHandles.remove();
      this.transformHandles = this.createTransformHandles(this.selectedItem.bounds);
    }

    paper.view.update();
  }

  startRectangle(x: number, y: number): void {
    const width = 30;
    const height = 30;

    const rectangle = new paper.Path.Rectangle({
      point: [x - width/2, y - height/2],
      size: [width, height], 
      fillColor: '#FF0000',
      strokeColor: '#000000',
      strokeWidth: 1
    });

    this.rectangles.push(rectangle);
    paper.view.update();
  }

  private calculateRectangleAvoidance(
    position: paper.Point,
    velocity: paper.Point
  ): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30; // Distance at which particles start avoiding rectangles
    const maxForce = 0.5; // Maximum avoidance force

    for (const rectangle of this.rectangles) {
      // Get the nearest point on the rectangle to the particle
      const bounds = rectangle.bounds;
      const nearestX = Math.max(bounds.left, Math.min(position.x, bounds.right));
      const nearestY = Math.max(bounds.top, Math.min(position.y, bounds.bottom));
      const nearest = new paper.Point(nearestX, nearestY);

      // Calculate distance and direction from rectangle
      const diff = position.subtract(nearest);
      const distance = diff.length;

      if (distance < avoidanceDistance) {
        // Calculate avoidance force (stronger when closer)
        const force = Math.min(maxForce, (avoidanceDistance - distance) / avoidanceDistance);
        
        // If particle is inside rectangle, push it out strongly
        if (bounds.contains(position)) {
          avoidanceForce.set(
            avoidanceForce.x + diff.x * maxForce * 2,
            avoidanceForce.y + diff.y * maxForce * 2
          );
        } else {
          avoidanceForce.set(
            avoidanceForce.x + diff.normalize().x * force,
            avoidanceForce.y + diff.normalize().y * force
          );
        }
      }
    }

    return avoidanceForce;
  }

  updateRectangle(x: number, y: number, maintainAspectRatio: boolean): void {
    // Method removed
  }

  finishRectangle(): void {
    // Method removed
  }

  cancelRectangle(): void {
    // Method removed
  }

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Paper.js project
    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(500, 400);
    this.project = paper.project;
    
    // Create groups for particles and trails
    this.particles = new paper.Group();
    this.trails = new paper.Group();
    
    // Create test rectangle
    new paper.Path.Rectangle({
      point: [200, 150],
      size: [100, 100],
      fillColor: '#FF0000',
      strokeColor: '#000000',
      strokeWidth: 1
    });

    // Create background
    this.createBackground();
    
    // Force initial render
    paper.view.update();
  }

  handleKeyboardShortcut(event: KeyboardEvent): void {
    if (!this.selectedItem) return;

    // Check if Ctrl/Cmd key is pressed
    const isCtrlCmd = event.ctrlKey || event.metaKey;

    if (isCtrlCmd && event.key === 'c') {
      // Copy
      this.clipboard = this.selectedItem.clone();
      this.clipboard.visible = false;
    } else if (isCtrlCmd && event.key === 'x') {
      // Cut
      this.clipboard = this.selectedItem.clone();
      this.clipboard.visible = false;
      const index = this.rectangles.indexOf(this.selectedItem as paper.Path.Rectangle);
      if (index > -1) {
        this.rectangles.splice(index, 1);
      }
      this.selectedItem.remove();
      this.clearSelection();
    } else if (isCtrlCmd && event.key === 'v' && this.clipboard) {
      // Paste
      const pastedItem = this.clipboard.clone();
      pastedItem.visible = true;
      pastedItem.position = pastedItem.position.add(new paper.Point(20, 20));
      if (pastedItem instanceof paper.Path.Rectangle) {
        this.rectangles.push(pastedItem);
      }
      this.selectItemAt(pastedItem.position);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      // Delete
      const index = this.rectangles.indexOf(this.selectedItem as paper.Path.Rectangle);
      if (index > -1) {
        this.rectangles.splice(index, 1);
      }
      this.selectedItem.remove();
      this.clearSelection();
    }

    paper.view.update();
  }

  private createBackground(): void {
    const background = new paper.Path.Rectangle({
      rectangle: this.project.view.bounds,
      fillColor: 'white'
    });
    background.sendToBack();
  }

  setBackgroundColor(color: string): void {
    const background = this.project.activeLayer.firstChild as paper.Path;
    if (background) {
      background.fillColor = new paper.Color(color);
    }
  }

  createParticle(x: number, y: number): paper.Group {
    const particle = new paper.Group();
    
    // Create particle point
    const point = new paper.Path.Circle({
      center: new paper.Point(x, y),
      radius: this.particleRadius,
      fillColor: this.project.view.element.dataset.particleColor || '#000000'
    });

    // Create trail path
    const trail = new paper.Path({
      strokeColor: this.project.view.element.dataset.trailColor || '#8b8680',
      strokeWidth: this.trailWidth,
      strokeCap: 'round',
      opacity: 1
    });
    trail.add(new paper.Point(x, y));

    particle.addChildren([point, trail]);
    particle.data = {
      velocity: new paper.Point(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      createdAt: Date.now(),
      state: 'active'
    };

    this.particles.addChild(particle);
    return particle;
  }

  eraseParticlesNear(x: number, y: number, radius: number): void {
    const erasePoint = new paper.Point(x, y);
    
    // Update or create eraser visualization
    if (this.eraserCircle) {
      this.eraserCircle.position = erasePoint;
      this.eraserCircle.radius = radius;
    } else {
      this.eraserCircle = new paper.Path.Circle({
        center: erasePoint,
        radius: radius,
        strokeColor: 'white',
        strokeWidth: 1,
        dashArray: [4, 4],
        opacity: 0.5
      });
    }

    // Remove particles within radius
    const particlesToRemove: paper.Group[] = [];
    this.particles.children.forEach(particle => {
      const point = particle.children[0] as paper.Path.Circle;
      const distance = point.position.subtract(erasePoint).length;
      if (distance <= radius) {
        particlesToRemove.push(particle as paper.Group);
      }
    });

    particlesToRemove.forEach(particle => particle.remove());
    this.project.view.draw();
  }

  hideEraserCircle(): void {
    if (this.eraserCircle) {
      this.eraserCircle.remove();
      this.eraserCircle = null;
      this.project.view.draw();
    }
  }

  private calculateFlockingForces(
    particle: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    let separation = new paper.Point(0, 0);
    let cohesion = new paper.Point(0, 0);
    let alignment = new paper.Point(0, 0);
    let neighbors = 0;

    const particlePos = (particle.children[0] as paper.Path.Circle).position;

    this.particles.children.forEach(other => {
      if (particle === other || other.data.state === 'frozen') return;

      const otherPos = (other.children[0] as paper.Path.Circle).position;
      const diff = otherPos.subtract(particlePos);
      const distance = diff.length;

      if (distance < settings.separationDistance) {
        const force = (settings.separationDistance - distance) / settings.separationDistance;
        separation = separation.subtract(diff.multiply(force));
      }

      if (distance < settings.cohesionDistance) {
        cohesion = cohesion.add(otherPos);
        neighbors++;
      }

      if (distance < settings.alignmentDistance) {
        alignment = alignment.add(other.data.velocity);
      }
    });

    let force = new paper.Point(0, 0);

    if (neighbors > 0) {
      cohesion = cohesion.divide(neighbors).subtract(particlePos);
      alignment = alignment.divide(neighbors);
      
      force = force.add(separation.multiply(settings.separation))
                   .add(cohesion.multiply(settings.cohesion))
                   .add(alignment.multiply(settings.alignment));
    }

    return force;
  }

  private calculateWanderForce(
    particle: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.wanderEnabled) return new paper.Point(0, 0);

    const id = particle.id;
    if (!this.wanderAngles.has(id)) {
      this.wanderAngles.set(id, Math.random() * Math.PI * 2);
    }

    let wanderAngle = this.wanderAngles.get(id)!;
    wanderAngle += (Math.random() - 0.5) * settings.wanderSpeed * 0.1;
    this.wanderAngles.set(id, wanderAngle);

    const velocity = particle.data.velocity;
    const center = (particle.children[0] as paper.Path.Circle).position
      .add(velocity.normalize().multiply(settings.wanderRadius));

    const offset = new paper.Point(
      Math.cos(wanderAngle),
      Math.sin(wanderAngle)
    ).multiply(settings.wanderRadius);

    return center.add(offset)
      .subtract((particle.children[0] as paper.Path.Circle).position)
      .multiply(settings.wanderStrength);
  }

  updateParticle(
    particle: paper.Group,
    settings: SimulationSettings,
    width: number,
    height: number
  ): void {
    const point = particle.children[0] as paper.Path.Circle;
    const trail = particle.children[1] as paper.Path;
    const age = Date.now() - particle.data.createdAt;
    let velocity = particle.data.velocity;
    const activeProgress = Math.min(1, age / settings.activeStateDuration);

    // Update state based on age
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'active' && age >= settings.activeStateDuration) {
        particle.data.state = 'freezing';
      } else if (particle.data.state === 'freezing' && 
                 age >= settings.activeStateDuration + settings.freezingDuration) {
        particle.data.state = 'frozen';
      }
    }

    if (!settings.paintingModeEnabled || particle.data.state !== 'frozen') {
      // Calculate forces
      let force = new paper.Point(0, 0);

      if (settings.flockingEnabled) {
        force = force.add(this.calculateFlockingForces(particle, settings));
      }

      if (settings.wanderEnabled) {
        force = force.add(this.calculateWanderForce(particle, settings));
      }
      
      // Add rectangle avoidance force
      force = force.add(this.calculateRectangleAvoidance(point.position, velocity));

      // Apply forces to velocity
      velocity = velocity.add(force);

      // Normalize velocity
      if (velocity.length > 0) {
        velocity = velocity.normalize().multiply(2);
      }

      // Apply speed setting and state-based modifications
      const speedMultiplier = settings.speed * (
        particle.data.state === 'freezing' 
          ? 1 - ((age - settings.activeStateDuration) / settings.freezingDuration)
          : 1
      );

      velocity = velocity.multiply(speedMultiplier);

      // Update position
      const newPosition = point.position.add(velocity);

      // Apply boundary behavior
      switch (settings.boundaryBehavior) {
        case 'wrap-around':
          newPosition.x = ((newPosition.x + width) % width);
          newPosition.y = ((newPosition.y + height) % height);
          break;
          
        case 'bounce':
          if (newPosition.x < 0 || newPosition.x > width) {
            velocity.x *= -1;
            newPosition.x = Math.max(0, Math.min(width, newPosition.x));
          }
          if (newPosition.y < 0 || newPosition.y > height) {
            velocity.y *= -1;
            newPosition.y = Math.max(0, Math.min(height, newPosition.y));
          }
          break;
          
        case 'stop':
          if (newPosition.x < 0 || newPosition.x > width ||
              newPosition.y < 0 || newPosition.y > height) {
            velocity.set(0, 0);
            newPosition.x = Math.max(0, Math.min(width, newPosition.x));
            newPosition.y = Math.max(0, Math.min(height, newPosition.y));
          }
          break;
          
        case 'travel-off':
          if (newPosition.x < 0 || newPosition.x > width ||
              newPosition.y < 0 || newPosition.y > height) {
            particle.remove();
            return;
          }
          break;
      }

      // Update point position
      point.position = newPosition;

      // Add to trail during active and freezing states
      if (particle.data.state === 'active' || particle.data.state === 'freezing') {
        trail.add(newPosition);

        // Smooth the path
        trail.smooth();
      }

      // Store velocity for next frame
      particle.data.velocity = velocity;
    }

    // Update opacity
    if (settings.paintingModeEnabled) {
      if (particle.data.state === 'frozen') {
        point.opacity = settings.trailPersistence;
      } else if (particle.data.state === 'freezing') {
        const freezingProgress = (age - settings.activeStateDuration) / settings.freezingDuration;
        const opacity = 1 - (1 - settings.trailPersistence) * freezingProgress;
        point.opacity = opacity;
      }
    }
  }

  updateParticles(settings: SimulationSettings): void {
    const view = this.project.view;
    this.particles.children.forEach(particle => {
      this.updateParticle(particle as paper.Group, settings, view.bounds.width, view.bounds.height);
    });
    this.project.view.draw();
  }

  clear(): void {
    this.particles.removeChildren();
    this.rectangles.forEach(rect => rect.remove());
    this.rectangles = [];
    paper.view.update();
    this.project.view.draw();
  }

  exportSVG(): string {
    return this.project.exportSVG({ asString: true }) as string;
  }

  setColors(settings: SimulationSettings): void {
    this.particles.children.forEach(particle => {
      const point = particle.children[0] as paper.Path.Circle;
      const trail = particle.children[1] as paper.Path;
      
      point.fillColor = new paper.Color(settings.particleColor);
      trail.strokeColor = new paper.Color(settings.trailColor);
    });
    paper.view.update();
  }

  setParticleRadius(radius: number): void {
    this.particleRadius = radius;
    this.particles.children.forEach(particle => {
      const point = particle.children[0] as paper.Path.Circle;
      point.radius = radius;
    });
    paper.view.update();
  }

  setTrailWidth(width: number): void {
    this.trailWidth = width;
    this.particles.children.forEach(particle => {
      const trail = particle.children[1] as paper.Path;
      trail.strokeWidth = width;
    });
    paper.view.update();
  }
}