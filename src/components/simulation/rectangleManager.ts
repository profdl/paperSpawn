import paper from 'paper';
import { TransformHandles } from './transformHandles';

export class RectangleManager {
  private rectangles: paper.Path.Rectangle[] = [];
  private selectedItem: paper.Path.Rectangle | null = null;
  private transformHandles: TransformHandles;
  private clipboard: paper.Path.Rectangle | null = null;
  private dragStartPosition: paper.Point | null = null;
  private originalBounds: paper.Rectangle | null = null;
  private isRotating: boolean = false;
  private rotationStartAngle: number = 0;

  constructor() {
    this.transformHandles = new TransformHandles();
  }

  calculateAvoidanceForce(position: paper.Point): paper.Point {
    const avoidanceForce = new paper.Point(0, 0);
    const avoidanceDistance = 30;
    const maxForce = 0.5;

    for (const rectangle of this.rectangles) {
      const bounds = rectangle.bounds;
      const nearestX = Math.max(bounds.left, Math.min(position.x, bounds.right));
      const nearestY = Math.max(bounds.top, Math.min(position.y, bounds.bottom));
      const nearest = new paper.Point(nearestX, nearestY);

      const diff = position.subtract(nearest);
      const distance = diff.length;

      if (distance < avoidanceDistance) {
        const force = Math.min(maxForce, (avoidanceDistance - distance) / avoidanceDistance);
        
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

  create(x: number, y: number): void {
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
    this.isRotating = false;
    this.rotationStartAngle = 0;
  }

  handleTransform(point: paper.Point, delta: paper.Point, shiftKey: boolean): void {
    if (!this.selectedItem) return;

    // Initialize drag start if not set
    if (!this.dragStartPosition) {
      this.dragStartPosition = point.subtract(delta);
      this.originalBounds = this.selectedItem.bounds.clone();
      
      // Check if we're starting on a handle
      const rotateHandle = this.transformHandles.getRotateHandle();
      const resizeHandle = this.transformHandles.getHandleAt(point);
      
      if (rotateHandle && rotateHandle.bounds.contains(point)) {
        this.isRotating = true;
        this.rotationStartAngle = this.getAngleToCenter(point);
      } else if (resizeHandle) {
        // Store the handle we're using for resize
        this.selectedItem.data.activeHandle = resizeHandle;
      }
    }

    if (this.isRotating) {
      this.handleRotation(point);
    } else if (this.selectedItem.data.activeHandle) {
      // We're resizing
      this.handleResize(this.selectedItem.data.activeHandle, delta, shiftKey);
    } else {
      // We're moving
      this.handleMove(delta);
    }

    paper.view.update();
  }

  private handleRotation(point: paper.Point): void {
    if (!this.selectedItem || !this.dragStartPosition) return;
  
    const currentAngle = this.getAngleToCenter(point);
    const deltaAngle = currentAngle - this.rotationStartAngle;
    const snappedAngle = Math.round(deltaAngle / 45) * 45;
    
    this.selectedItem.rotate(snappedAngle, this.selectedItem.bounds.center);
    this.transformHandles.update(this.selectedItem.bounds, snappedAngle);
  }

  private handleResize(handle: paper.Item, delta: paper.Point, shiftKey: boolean): void {
    if (!this.selectedItem || !this.originalBounds) return;
    
    const newBounds = this.originalBounds.clone();
    const handleIndex = handle.data.index;
    
    // Apply the cumulative delta to the original bounds
    switch (handleIndex) {
      case 0: // Top-left
        newBounds.left += delta.x;
        newBounds.top += delta.y;
        break;
      case 1: // Top-center
        newBounds.top += delta.y;
        break;
      case 2: // Top-right
        newBounds.right += delta.x;
        newBounds.top += delta.y;
        break;
      case 3: // Middle-right
        newBounds.right += delta.x;
        break;
      case 4: // Bottom-right
        newBounds.right += delta.x;
        newBounds.bottom += delta.y;
        break;
      case 5: // Bottom-center
        newBounds.bottom += delta.y;
        break;
      case 6: // Bottom-left
        newBounds.left += delta.x;
        newBounds.bottom += delta.y;
        break;
      case 7: // Middle-left
        newBounds.left += delta.x;
        break;
    }

    // Maintain aspect ratio if shift is held
    if (shiftKey && handleIndex % 2 === 0) {
      const originalRatio = this.originalBounds.width / this.originalBounds.height;
      const width = Math.abs(newBounds.width);
      const height = width / originalRatio;
      
      if (handleIndex < 3) { // Top handles
        newBounds.top = newBounds.bottom - height;
      } else if (handleIndex > 4) { // Bottom handles
        newBounds.bottom = newBounds.top + height;
      }
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

  private getAngleToCenter(point: paper.Point): number {
    if (!this.selectedItem) return 0;
    const center = this.selectedItem.bounds.center;
    return Math.atan2(point.y - center.y, point.x - center.x) * 180 / Math.PI;
  }

  handleKeyboardShortcut(event: KeyboardEvent): void {
    if (!this.selectedItem) return;

    const isCtrlCmd = event.ctrlKey || event.metaKey;

    if (isCtrlCmd && event.key === 'c') {
      this.clipboard = this.selectedItem.clone();
      this.clipboard.visible = false;
    } else if (isCtrlCmd && event.key === 'x') {
      this.clipboard = this.selectedItem.clone();
      this.clipboard.visible = false;
      this.removeSelected();
    } else if (isCtrlCmd && event.key === 'v' && this.clipboard) {
      const pastedItem = this.clipboard.clone();
      pastedItem.visible = true;
      pastedItem.position = pastedItem.position.add(new paper.Point(20, 20));
      this.rectangles.push(pastedItem);
      this.selectAt(pastedItem.position);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
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
    this.isRotating = false;
    this.rotationStartAngle = 0;
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