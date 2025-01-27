import paper from 'paper';

export class TransformHandles {
  private handles: paper.Group | null = null;
  private readonly handleSize = 6;

  create(bounds: paper.Rectangle, rotation: number = 0): paper.Group {
    // Ensure any existing handles are completely removed first
    this.remove();
    
    // Remove any other existing handle groups in the project (cleanup)
    paper.project.activeLayer.children.forEach((child: paper.Item) => {
      if (child instanceof paper.Group && child.data?.isTransformHandle) {
        child.remove();
      }
    });
    
    const handles = new paper.Group();
    // Mark this group as transform handles for identification
    handles.data = { isTransformHandle: true };
    
    // Create single resize handle in bottom-right corner
    const resizeHandle = new paper.Path.Rectangle({
      center: [bounds.right, bounds.bottom],
      size: [this.handleSize, this.handleSize],
      fillColor: 'white',
      strokeColor: '#0066ff',
      strokeWidth: 1,
      data: { type: 'resize', index: 0 }
    });
    
    handles.addChild(resizeHandle);
    
    // Apply rotation
    handles.rotate(rotation, bounds.center);
    
    this.handles = handles;
    return handles;
  }

  update(bounds: paper.Rectangle, rotation: number = 0): void {
    this.remove();
    this.create(bounds, rotation);
  }

  getHandleAt(point: paper.Point): paper.Item | null {
    if (!this.handles) return null;
    
    // Only check for the resize handle
    const resizeHandle = this.handles.children[0];
    if (resizeHandle.bounds.expand(5).contains(point)) {
      return resizeHandle;
    }
    
    return null;
  }
  
  isHandleAt(point: paper.Point): boolean {
    return this.getHandleAt(point) !== null;
  }

  remove(): void {
    if (this.handles) {
      this.handles.remove();
      this.handles = null;
    }
    
    // Additional cleanup of any orphaned handle groups
    paper.project.activeLayer.children.forEach((child: paper.Item) => {
      if (child instanceof paper.Group && child.data?.isTransformHandle) {
        child.remove();
      }
    });
  }

  get current(): paper.Group | null {
    return this.handles;
  }
}