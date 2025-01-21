import paper from 'paper';
import { TransformHandles } from './transformHandles';

export class RectangleManager {
  private rectangles: paper.Path.Rectangle[] = [];
  private selectedItem: paper.Path.Rectangle | null = null;
  private transformHandles: TransformHandles;
  private dragStartPosition: paper.Point | null = null;
  private originalBounds: paper.Rectangle | null = null;

  constructor() {
    this.transformHandles = new TransformHandles();
  }

  calculateAvoidanceForce(position: paper.Point): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30; // Increased from 15 to make avoidance more noticeable
    const maxForce = 1.0; // Increased from 0.5 to make avoidance stronger

    for (const rectangle of this.rectangles) {
      const bounds = rectangle.bounds;
      const nearestX = Math.max(bounds.left, Math.min(position.x, bounds.right));
      const nearestY = Math.max(bounds.top, Math.min(position.y, bounds.bottom));
      const nearest = new paper.Point(nearestX, nearestY);

      const diff = position.subtract(nearest);
      const distance = diff.length;

      if (distance < avoidanceDistance) {
        // Use inverse square law for more natural avoidance
        const force = Math.min(maxForce, Math.pow(avoidanceDistance - distance, 2) / (avoidanceDistance * avoidanceDistance));
        
        if (bounds.contains(position)) {
          // Stronger force when inside rectangle to push particles out
          avoidanceForce.set(
            avoidanceForce.x + diff.x * maxForce * 3,
            avoidanceForce.y + diff.y * maxForce * 3
          );
        } else {
          // Normal avoidance force when outside
          const normalizedForce = diff.normalize().multiply(force);
          avoidanceForce.set(
            avoidanceForce.x + normalizedForce.x,
            avoidanceForce.y + normalizedForce.y
          );
        }
      }
    }

    // Limit the maximum force magnitude
    if (avoidanceForce.length > maxForce) {
      avoidanceForce.length = maxForce;
    }

    return avoidanceForce;
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

  clear(): void {
    this.rectangles.forEach(rect => rect.remove());
    this.rectangles = [];
    this.clearSelection();
  }

  
}