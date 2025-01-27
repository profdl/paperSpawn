import paper from 'paper';
import { SimulationSettings } from '../../types';

export class WanderForce {
  private static wanderAngles: Map<number, number> = new Map();

  static calculate(
    particle: paper.Group,
    settings: SimulationSettings
  ): paper.Point {
    if (!settings.wanderEnabled) return new paper.Point(0, 0);

    const id = particle.id;
    if (!this.wanderAngles.has(id)) {
      this.wanderAngles.set(id, Math.random() * Math.PI * 2);
    }

    let wanderAngle = this.wanderAngles.get(id)!;
    wanderAngle += (Math.random() - 0.5) * settings.wanderSpeed * 0.05;
    this.wanderAngles.set(id, wanderAngle);

    const velocity = particle.data.velocity;
    const center = (particle.children[0] as paper.Path.Circle).position
      .add(velocity.normalize().multiply(settings.wanderRadius));

    const offset = new paper.Point(
      Math.cos(wanderAngle),
      Math.sin(wanderAngle)
    ).multiply(settings.wanderRadius);

    const wanderForce = center.add(offset)
      .subtract((particle.children[0] as paper.Path.Circle).position)
      .multiply(settings.wanderStrength);

    return wanderForce.length > 0 ? wanderForce.normalize() : wanderForce;
  }
}