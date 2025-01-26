import paper from 'paper';
import { SimulationSettings } from '../../../types';

interface BranchConnection {
  particleId: number;
  branchId: number;
}

interface BranchData {
  id: number;
  age: number;
  direction: paper.Point;
  length: number;
  startPoint: paper.Point;
}

export class AggregationForce {
  private static branchCounter = 0;
  private static branches: Map<number, BranchData> = new Map();

  private static initializeParticleData(particle: paper.Group): void {
    if (!particle.data) {
      particle.data = {};
    }
    
    if (!particle.data.branchConnections) {
      particle.data.branchConnections = new Set<BranchConnection>();
    }

    if (particle.data.branchId === undefined) {
      particle.data.branchId = null;
    }

    if (particle.data.branchPosition === undefined) {
      particle.data.branchPosition = 0; // Position in branch (0 = root)
    }
  }

  private static updateBranches(particles: paper.Group): void {
    // Update branch ages and calculate properties
    for (const [branchId, branchData] of this.branches) {
      branchData.age++;
      
      // Find all particles in this branch
      const branchParticles = (particles.children as paper.Group[])
        .filter(p => p.data?.branchId === branchId)
        .sort((a, b) => a.data.branchPosition - b.data.branchPosition);

      if (branchParticles.length >= 2) {
        const startParticle = branchParticles[0];
        const endParticle = branchParticles[branchParticles.length - 1];
        const startPos = (startParticle.children[1] as paper.Path.Circle).position;
        const endPos = (endParticle.children[1] as paper.Path.Circle).position;
        
        branchData.direction = endPos.subtract(startPos).normalize();
        branchData.length = branchParticles.length;
        branchData.startPoint = startPos;
      }
    }
  }

  



  private static connectionLines: Map<string, paper.Path> = new Map();

private static getConnectionKey(id1: number, id2: number): string {
  return [Math.min(id1, id2), Math.max(id1, id2)].join('-');
}

private static createConnectionLine(
  particle1: paper.Group,
  particle2: paper.Group,
  settings: SimulationSettings
): paper.Path {
  const point1 = (particle1.children[1] as paper.Path.Circle).position;
  const point2 = (particle2.children[1] as paper.Path.Circle).position;
  
  const line = new paper.Path.Line(point1, point2);
  line.strokeColor = new paper.Color(settings.aggregationLineColor);
  line.strokeWidth = 1; // Increased width for better visibility
  line.bringToFront(); // Changed from sendToBack() to make lines visible
  
  return line;
}

private static updateConnectionLine(
  particle1: paper.Group,
  particle2: paper.Group,
  line: paper.Path
): void {
  const point1 = (particle1.children[1] as paper.Path.Circle).position;
  const point2 = (particle2.children[1] as paper.Path.Circle).position;
  
  line.segments[0].point = point1;
  line.segments[1].point = point2;
}

static calculate(
  particle: paper.Group,
  particles: paper.Group,
  settings: SimulationSettings
): paper.Point {
  if (!settings.aggregationEnabled) {
    // Clean up all connection lines when aggregation is disabled
    this.connectionLines.forEach(line => line.remove());
    this.connectionLines.clear();
    return new paper.Point(0, 0);
  }

  this.initializeParticleData(particle);
  this.updateBranches(particles);
    
  const point = particle.children[1] as paper.Path.Circle;
  let totalForce = new paper.Point(0, 0);
  const criticalDistance = settings.particleSize * 1.5;

  // First handle connections and their forces
  if (particle.data.branchConnections?.size > 0) {
    // For connected particles, apply strong cohesive forces
    for (const connection of particle.data.branchConnections) {
      const connectedParticle = particles.children.find(p => p.id === connection.particleId) as paper.Group;
      if (connectedParticle) {
        const connectedPoint = connectedParticle.children[1] as paper.Path.Circle;
        const vectorToConnected = connectedPoint.position.subtract(point.position);
        const distance = vectorToConnected.length;
        
        // Strong cohesive force to maintain exact spacing
        const targetDistance = settings.particleSize * settings.aggregationSpacing;
        const strength = 0.5; // Increased strength for connected particles
        
        if (distance > targetDistance) {
          // Pull together
          totalForce = totalForce.add(
            vectorToConnected.normalize().multiply((distance - targetDistance) * strength)
          );
        } else if (distance < targetDistance) {
          // Push apart slightly to maintain spacing
          totalForce = totalForce.add(
            vectorToConnected.normalize().multiply((distance - targetDistance) * strength)
          );
        }
      }
    }
  }

  // Then handle repulsion for non-connected particles
  for (const otherParticle of particles.children as paper.Group[]) {
    if (particle === otherParticle || this.areConnected(particle, otherParticle)) continue;
    
    const otherPoint = otherParticle.children[1] as paper.Path.Circle;
    const vectorToOther = otherPoint.position.subtract(point.position);
    const distance = vectorToOther.length;

    if (distance < criticalDistance) {
      const repulsionStrength = 0.8;
      const repulsion = vectorToOther.normalize()
        .multiply(-(criticalDistance - distance) * repulsionStrength);
      totalForce = totalForce.add(repulsion);
    }
  }

 // Branch formation and maintenance
 const nearbyParticles = (particles.children as paper.Group[])
 .filter(p => p !== particle)
 .map(p => ({
   particle: p,
   distance: (p.children[1] as paper.Path.Circle).position.subtract(point.position).length
 }))
 .sort((a, b) => a.distance - b.distance);

 for (const {particle: otherParticle, distance} of nearbyParticles) {
  this.initializeParticleData(otherParticle);

  if (distance <= settings.aggregationDistance) {
    // Simplified connection logic - connect if within range and not already connected
    if (!this.areConnected(particle, otherParticle)) {
      const newBranchId = ++this.branchCounter;
      
      // Create new connection
      const connection: BranchConnection = { 
        particleId: otherParticle.id, 
        branchId: newBranchId 
      };
      particle.data.branchConnections.add(connection);
      otherParticle.data.branchConnections.add({ 
        particleId: particle.id, 
        branchId: newBranchId 
      });

      // Create connection line
      const connectionKey = this.getConnectionKey(particle.id, otherParticle.id);
      if (!this.connectionLines.has(connectionKey)) {
        const line = this.createConnectionLine(particle, otherParticle, settings);
        this.connectionLines.set(connectionKey, line);
      }
    }
  }

  // Update existing connection lines
  if (this.areConnected(particle, otherParticle)) {
    const connectionKey = this.getConnectionKey(particle.id, otherParticle.id);
    const line = this.connectionLines.get(connectionKey);
    if (line) {
      this.updateConnectionLine(particle, otherParticle, line);
    }
  }
}

  // Clean up any connection lines for particles that are no longer connected
  for (const [key, line] of this.connectionLines) {
    const [id1, id2] = key.split('-').map(Number);
    const particle1 = particles.children.find(p => p.id === id1) as paper.Group;
    const particle2 = particles.children.find(p => p.id === id2) as paper.Group;
    
    if (!particle1 || !particle2 || !this.areConnected(particle1, particle2)) {
      line.remove();
      this.connectionLines.delete(key);
    }
  }

// Limit maximum force
const maxForce = settings.particleSize * 0.5;
if (totalForce.length > maxForce) {
  totalForce = totalForce.normalize().multiply(maxForce);
}

return totalForce;
}


  static cleanup(particleId: number, particles: paper.Group): void {
    for (const [key, line] of this.connectionLines) {
      const [id1, id2] = key.split('-').map(Number);
      if (id1 === particleId || id2 === particleId) {
        line.remove();
        this.connectionLines.delete(key);
      }
    (particles.children as paper.Group[]).forEach(particle => {
      if (particle.data?.branchConnections) {
        const oldBranchId = particle.data.branchId;
        const connections = particle.data.branchConnections as Set<BranchConnection>;
        
        particle.data.branchConnections = new Set(
          Array.from(connections)
            .filter((conn: BranchConnection) => conn.particleId !== particleId)
        );
        
        if (particle.data.branchConnections.size === 0) {
          particle.data.branchId = null;
          particle.data.branchPosition = 0;
          
          // Clean up branch if it's empty
          if (oldBranchId !== null) {
            const branch = this.branches.get(oldBranchId);
            if (branch) {
              branch.length--;
              if (branch.length <= 1) {
                this.branches.delete(oldBranchId);
              }
            }
          }
        }
      }
    });
  }}

  private static areConnected(particle1: paper.Group, particle2: paper.Group): boolean {
    const connections1 = particle1.data.branchConnections as Set<BranchConnection>;
    return Array.from(connections1).some(conn => conn.particleId === particle2.id);
  }
}