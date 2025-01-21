import paper from 'paper';
import { TransformHandles } from './transformHandles';



export class RectangleManager {
  private rectangles: paper.Path.Rectangle[] = [];
  private paths: paper.Path[] = [];
  private selectedItem: paper.Path.Rectangle | null = null;
  private transformHandles: TransformHandles;
  private dragStartPosition: paper.Point | null = null;
  private originalBounds: paper.Rectangle | null = null;
  private currentPath: paper.Path | null = null; 

  constructor() {
    this.transformHandles = new TransformHandles();
  }

getAllClosedPaths(): paper.Path[] {
  // Get all rectangles (which are closed paths) and closed freehand paths
  return [
    ...this.rectangles,
    ...this.paths.filter(path => path.closed)
  ];
}


  importRectangle(rectangle: paper.Path.Rectangle): void {
    rectangle.data.isObstacle = true;
    rectangle.fillColor = new paper.Color('#00000010');
    rectangle.strokeColor = new paper.Color('#000000');
    rectangle.strokeWidth = 1;
    this.rectangles.push(rectangle);
  }

  startFreehandPath(point: paper.Point): void {
    console.log('RM: Starting freehand path'); // Debug log
    this.currentPath = new paper.Path({
      segments: [point],
      strokeColor: '#000000',
      strokeWidth: 1,
      fillColor: '#00000010',
      closed: false,
      data: { isObstacle: true }
    });
  }

  continueFreehandPath(point: paper.Point): void {
    console.log('RM: Continuing freehand path', this.currentPath ? 'path exists' : 'no path'); // Debug log
    if (this.currentPath) {
      const lastPoint = this.currentPath.lastSegment.point;
      const minDistance = 5;
      
      if (lastPoint.getDistance(point) > minDistance) {
        this.currentPath.add(point);
      }
    }
  }

  endFreehandPath(): void {
    console.log('RM: Ending freehand path', this.currentPath ? 'path exists' : 'no path'); // Debug log
    if (this.currentPath && this.currentPath.segments.length >= 3) {
      console.log('RM: Path has enough segments:', this.currentPath.segments.length);
      
      const firstPoint = this.currentPath.firstSegment.point;
      const lastPoint = this.currentPath.lastSegment.point;
      const closeDistance = 20;
      
      if (lastPoint.getDistance(firstPoint) < closeDistance) {
        this.currentPath.add(firstPoint);
      } else {
        this.currentPath.add(firstPoint);
      }

      this.currentPath.closed = true;
      this.currentPath.smooth({ type: 'continuous' });
      this.currentPath.simplify(2.5);
      
      this.currentPath.fillColor = new paper.Color('#00000010');
      this.currentPath.strokeColor = new paper.Color('#000000');
      this.currentPath.strokeWidth = 1;
      
      this.paths.push(this.currentPath);
      console.log('RM: Added closed path. Segments:', this.currentPath.segments.length, 'Closed:', this.currentPath.closed);
      
      this.currentPath = null;
    } else if (this.currentPath) {
      console.log('RM: Path too short, removing');
      this.currentPath.remove();
      this.currentPath = null;
    }
  }

  calculateAvoidanceForce(position: paper.Point, ): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30;
    const maxForce = 1.0;

    // Check paths
    for (const path of this.paths) {
        if (!path.closed) continue;

        const nearestPoint = path.getNearestPoint(position);
        const isInside = path.contains(position);
        const diff = position.subtract(nearestPoint);
        const distance = diff.length;

        if (distance < avoidanceDistance || isInside) {
            let forceVector;
            if (isInside) {
                forceVector = diff.multiply(maxForce * 3);
            } else {
                const force = Math.min(maxForce, Math.pow(avoidanceDistance - distance, 2) / (avoidanceDistance * avoidanceDistance));
                forceVector = diff.normalize().multiply(force);
            }
            avoidanceForce.add(forceVector);
        }
    }

    // Check rectangles
    for (const rectangle of this.rectangles) {
        const bounds = rectangle.bounds;
        const nearestX = Math.max(bounds.left, Math.min(position.x, bounds.right));
        const nearestY = Math.max(bounds.top, Math.min(position.y, bounds.bottom));
        const nearest = new paper.Point(nearestX, nearestY);
        
        const diff = position.subtract(nearest);
        const distance = diff.length;
        const isInside = bounds.contains(position);

        if (distance < avoidanceDistance || isInside) {
            let forceVector;
            if (isInside) {
                forceVector = diff.multiply(maxForce * 3);
            } else {
                const force = Math.min(maxForce, Math.pow(avoidanceDistance - distance, 2) / (avoidanceDistance * avoidanceDistance));
                forceVector = diff.normalize().multiply(force);
            }
            avoidanceForce.add(forceVector);
        }
    }

    // Limit the maximum force
    if (avoidanceForce.length > maxForce) {
        avoidanceForce.length = maxForce;
    }

    return avoidanceForce;
}


  clear(): void {
    this.rectangles.forEach(rect => rect.remove());
    this.paths.forEach(path => path.remove());
    this.rectangles = [];
    this.paths = [];
    this.clearSelection();
  }


  create(x: number, y: number): paper.Path.Rectangle {
    const width = 30;
    const height = 30;

    const rectangle = new paper.Path.Rectangle({
      point: [x - width/2, y - height/2],
      size: [width, height],
      fillColor: '#000000',
      strokeColor: '#000000',
      strokeWidth: 1
    });

    this.rectangles.push(rectangle);
    paper.view.update();
    return rectangle; // Return the created rectangle
  }

  isHandleAt(point: paper.Point): boolean {
    return this.transformHandles.isHandleAt(point);
  }

  selectAt(point: paper.Point): void {
    this.clearSelection();

    const hitResult = paper.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 5
    });

    if (hitResult && hitResult.item) {
      const rectangle = this.rectangles.find(r => r === hitResult.item);
      if (rectangle) {
        this.selectedItem = rectangle;
        this.transformHandles.create(rectangle.bounds);
        paper.view.update();
      }
    }
  }

  clearSelection(): void {
    if (this.selectedItem) {
      delete this.selectedItem.data.activeHandle;
      this.selectedItem = null;
    }
    this.transformHandles.remove();
    this.dragStartPosition = null;
    this.originalBounds = null;
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    if (!this.selectedItem) return;

    // Initialize drag start if not set
    if (!this.dragStartPosition) {
      this.dragStartPosition = point.subtract(delta);
      this.originalBounds = this.selectedItem.bounds.clone();
      
      // Check if we're starting on the resize handle
      const resizeHandle = this.transformHandles.getHandleAt(point);
      
      if (resizeHandle) {
        this.selectedItem.data.activeHandle = resizeHandle;
      }
    }

    if (this.selectedItem.data.activeHandle) {
      // We're resizing - calculate the total delta from the original position
      const totalDelta = point.subtract(this.dragStartPosition);
      this.handleResize(totalDelta, shiftKey);
    } else {
      // We're moving
      this.handleMove(delta);
    }

    paper.view.update();
  }

  private handleResize(totalDelta: paper.Point, shiftKey: boolean): void {
    if (!this.selectedItem || !this.originalBounds) return;
    
    const newBounds = this.originalBounds.clone();
    
    // Calculate new width and height based on the total delta from drag start
    const newWidth = Math.max(10, this.originalBounds.width + totalDelta.x);
    const newHeight = Math.max(10, this.originalBounds.height + totalDelta.y);
    
    if (shiftKey) {
      // Maintain aspect ratio
      const originalRatio = this.originalBounds.width / this.originalBounds.height;
      const newRatio = newWidth / newHeight;
      
      if (newRatio > originalRatio) {
        // Width is dominant, adjust height
        newBounds.size = new paper.Size(newWidth, newWidth / originalRatio);
      } else {
        // Height is dominant, adjust width
        newBounds.size = new paper.Size(newHeight * originalRatio, newHeight);
      }
    } else {
      // Free resize
      newBounds.size = new paper.Size(newWidth, newHeight);
    }

    // Apply the new bounds
    this.selectedItem.bounds = newBounds;
    // Update transform handles
    this.transformHandles.update(newBounds);
  }

  handleMove(delta: paper.Point): void {
    if (!this.selectedItem) return;
    
    this.selectedItem.position = this.selectedItem.position.add(delta);
    this.transformHandles.update(this.selectedItem.bounds);
  }

  handleKeyboardShortcut(event: KeyboardEvent): void {
    if (!this.selectedItem) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.removeSelected();
    }

    paper.view.update();
  }

  private removeSelected(): void {
    if (!this.selectedItem) return;
    const index = this.rectangles.indexOf(this.selectedItem);
    if (index > -1) {
      this.rectangles.splice(index, 1);
    }
    this.selectedItem.remove();
    this.clearSelection();
  }

  endTransform(): void {
    if (this.selectedItem) {
      delete this.selectedItem.data.activeHandle;
    }
    this.dragStartPosition = null;
    this.originalBounds = null;
  }

  getAllRectangles(): paper.Path.Rectangle[] {
    return this.rectangles;
  }



  
}