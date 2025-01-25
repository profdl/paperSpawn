
import paper from 'paper';
import { SimulationSettings } from '../../../types';


class MagneticFieldVisualizer {
  static draw(
    canvas: paper.Path.Rectangle,
    settings: SimulationSettings
  ): void {
    if (!settings.magnetismEnabled || !settings.showMagneticField) return;

    // Clear existing field lines
    canvas.project.activeLayer.children['magneticField']?.remove();
    
    const fieldGroup = new paper.Group();
    fieldGroup.name = 'magneticField';

    // Draw field lines
    const gridSize = 30;
    const rows = Math.ceil(canvas.bounds.height / gridSize);
    const cols = Math.ceil(canvas.bounds.width / gridSize);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * gridSize;
        const y = i * gridSize;
        
        // Calculate field direction at this point
        const angle = settings.magnetismAngle * Math.PI / 180;
        const fieldLine = new paper.Path.Line({
          from: [x, y],
          to: [
            x + Math.cos(angle) * 10,
            y + Math.sin(angle) * 10
          ],
          strokeColor: new paper.Color(1, 1, 1, 0.1),
          strokeWidth: 1
        });
        
        fieldGroup.addChild(fieldLine);
      }
    }
  }
}
