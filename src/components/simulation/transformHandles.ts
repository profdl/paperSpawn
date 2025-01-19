import paper from 'paper';

export class TransformHandles {
  private handles: paper.Group | null = null;
  private readonly handleSize = 6;
  private readonly rotateHandleOffset = 20;

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
        size: [this.handleSize, this.handleSize],
        fillColor: 'white',
        strokeColor: '#0066ff',
        strokeWidth: 1,
        data: { type: 'resize', index: i }
      });
      handles.addChild(handle);
    });

    // Create rotation handle
    const rotateHandlePos = new paper.Point(
      bounds.center.x,
      bounds.top - this.rotateHandleOffset
    );
    
    const rotateHandle = new paper.Path.Circle({
      center: rotateHandlePos,
      radius: this.handleSize / 2,
      fillColor: 'white',
      strokeColor: '#0066ff',
      strokeWidth: 1,
      data: { type: 'rotate' }
    });

    const rotateLine = new paper.Path.Line({
      from: bounds.center.add(new paper.Point(0, -bounds.height / 2)),
      to: rotateHandlePos,
      strokeColor: '#0066ff',
      strokeWidth: 1,
      data: { type: 'rotateLine' }
    });

    handles.addChildren([rotateLine, rotateHandle]);
    
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
    
    // First, try to hit test the group itself
    const groupHit = this.handles.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance: 5,
      match: (item: paper.Item) => {
        return item.data?.type === 'resize';
      }
    });
  
    if (groupHit?.item) {
      return groupHit.item;
    }
  
    // If that fails, try each handle individually
    for (let child of this.handles.children) {
      if (child.data?.type === 'resize') {
        const bounds = child.bounds;
        if (bounds.contains(point) || bounds.expand(5).contains(point)) {
          return child;
        }
      }
    }
  
    return null;
  }
  
  getRotateHandle(): paper.Item | null {
    if (!this.handles) return null;
    return this.handles.children.find((child: paper.Item) => child.data?.type === 'rotate') || null;
  }
  
  isHandleAt(point: paper.Point): boolean {
    const resizeHandle = this.getHandleAt(point);
    const rotateHandle = this.getRotateHandle();
    
    if (resizeHandle) {
      console.log('Found resize handle:', resizeHandle.data?.index);
      return true;
    }
    
    if (rotateHandle && rotateHandle.bounds.expand(5).contains(point)) {
      console.log('Found rotate handle');
      return true;
    }
    
    return false;
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