import paper from 'paper';
import { SimulationSettings } from '../../types';
import { VectorParticleSystem } from '../core/VectorParticleSystem';

export class BGColorForce {
  static calculate(
    particle: paper.Group,
    system: VectorParticleSystem,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.bgColorForceEnabled) {
      return new paper.Point(0, 0);
    }

    const backgroundImage = system.getBackgroundImage();
    if (!backgroundImage) {
      return new paper.Point(0, 0);
    }

    const point = (particle.children[1] as paper.Path.Circle).position;
    
    try {
      // Convert the point coordinates relative to the image size
      const rasterPoint = new paper.Point(
        Math.floor((point.x / paper.view.bounds.width) * backgroundImage.width),
        Math.floor((point.y / paper.view.bounds.height) * backgroundImage.height)
      );
      
      // Check if point is within image bounds
      if (rasterPoint.x < 0 || rasterPoint.x >= backgroundImage.width ||
          rasterPoint.y < 0 || rasterPoint.y >= backgroundImage.height) {
        return new paper.Point(0, 0);
      }

      // Get color at particle position
      const color = backgroundImage.getPixel(rasterPoint);
      
      // Calculate color components influence
      const brightness = (color.red + color.green + color.blue) / 3;
      
      // Calculate force based on min/max angles
      const minAngle = settings.bgColorForceAngleMin || 0;
      const maxAngle = settings.bgColorForceAngleMax || 360;
      const forceAngle = minAngle + (brightness * (maxAngle - minAngle));
      const forceAngleRad = forceAngle * Math.PI / 180;
      
      const force = new paper.Point(
        Math.cos(forceAngleRad) * settings.bgColorForceStrength * 0.125,
        Math.sin(forceAngleRad) * settings.bgColorForceStrength * 0.125
      );
      
      return force;
      
    } catch (error) {
      console.warn('Error calculating background color force:', error);
      return new paper.Point(0, 0);
    }
  }

  static calculateDisplacement(
    particle: paper.Group,
    system: VectorParticleSystem,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.bgColorDisplaceEnabled) {
      return new paper.Point(0, 0);
    }

    const backgroundImage = system.getBackgroundImage();
    if (!backgroundImage) {
      return new paper.Point(0, 0);
    }

    const point = (particle.children[1] as paper.Path.Circle).position;
    
    try {
      const rasterPoint = new paper.Point(
        Math.floor((point.x / paper.view.bounds.width) * backgroundImage.width),
        Math.floor((point.y / paper.view.bounds.height) * backgroundImage.height)
      );
      
      if (rasterPoint.x < 0 || rasterPoint.x >= backgroundImage.width ||
          rasterPoint.y < 0 || rasterPoint.y >= backgroundImage.height) {
        return new paper.Point(0, 0);
      }

      const color = backgroundImage.getPixel(rasterPoint);
      const brightness = (color.red + color.green + color.blue) / 3;
      
      // Calculate displacement using its own angle setting
      const displaceAngleRad = settings.bgColorDisplaceAngle * Math.PI / 180;
      return new paper.Point(
        Math.cos(displaceAngleRad) * settings.bgColorDisplaceDistance * brightness,
        Math.sin(displaceAngleRad) * settings.bgColorDisplaceDistance * brightness
      );
      
    } catch (error) {
      console.warn('Error calculating displacement:', error);
      return new paper.Point(0, 0);
    }
  }
}