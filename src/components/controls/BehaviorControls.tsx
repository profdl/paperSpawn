import { useSimulation } from "../../contexts/SimulationContext";
import DraggableNumberInput from "../ui/DraggableNumberInput";
import { BoundaryBehavior } from "../../types";
import { Switch } from "../ui/Switch";

export default function BehaviorControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Flocking Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            Flocking
          </div>
          <Switch
            size="xs"
            checked={settings.flockingEnabled}
            onCheckedChange={(checked) =>
              updateSetting("flockingEnabled", checked)
            }
          />
        </div>
        {settings.flockingEnabled && (
          <div className="space-y-3">
            {/* Separation Controls */}
            <div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px] mb-1">
                  Separation
                </label>
                <DraggableNumberInput
                  value={settings.separation}
                  onChange={(value) => updateSetting("separation", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
              </div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px] "></label>
                <DraggableNumberInput
                  value={settings.separationDistance}
                  onChange={(value) =>
                    updateSetting("separationDistance", value)
                  }
                  min={1}
                  max={100}
                  step={1}
                  formatValue={(v) => `${v}px`}
                />
              </div>
            </div>

            {/* Cohesion Controls */}
            <div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px] mb-1">
                  Cohesion
                </label>
                <DraggableNumberInput
                  value={settings.cohesion}
                  onChange={(value) => updateSetting("cohesion", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
              </div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px]"></label>
                <DraggableNumberInput
                  value={settings.cohesionDistance}
                  onChange={(value) => updateSetting("cohesionDistance", value)}
                  min={1}
                  max={200}
                  step={1}
                  formatValue={(v) => `${v}px`}
                />
              </div>
            </div>

            {/* Alignment Controls */}
            <div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px] mb-1">
                  Alignment
                </label>
                <DraggableNumberInput
                  value={settings.alignment}
                  onChange={(value) => updateSetting("alignment", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                />
              </div>
              <div className="control">
                <label className="inline-block w-[80px] text-[10px]"></label>
                <DraggableNumberInput
                  value={settings.alignmentDistance}
                  onChange={(value) =>
                    updateSetting("alignmentDistance", value)
                  }
                  min={1}
                  max={150}
                  step={1}
                  formatValue={(v) => `${v}px`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
{/* Aggregation Section */}
<div>
  <div className="flex justify-between items-center mb-2">
    <div className="text-[10px] uppercase tracking-wider text-white/60">
      Aggregation
    </div>
    <Switch
      size="xs"
      checked={settings.aggregationEnabled}
      onCheckedChange={(checked) =>
        updateSetting("aggregationEnabled", checked)
      }
    />
  </div>
  {settings.aggregationEnabled && (
    <div className="space-y-1.5">
      <div className="control">
        <label className="inline-block w-[80px] text-[10px]">
          Distance
        </label>
        <DraggableNumberInput
          value={settings.aggregationDistance}
          onChange={(value) => updateSetting("aggregationDistance", value)}
          min={1}
          max={50}
          step={1}
          formatValue={(v) => `${v}px`}
        />
      </div>
      <div className="control">
        <label className="inline-block w-[80px] text-[10px]">
          DLA Mode
        </label>
        <input
          type="checkbox"
          checked={settings.isDLA}
          onChange={(e) => updateSetting('isDLA', e.target.checked)}
          className="ml-4"
        />
      </div>
      {settings.isDLA && (
        <div className="control">
          <label className="inline-block w-[80px] text-[10px]">
            Seed Count
          </label>
          <DraggableNumberInput
            value={settings.aggregationSeedCount}
            onChange={(value) => updateSetting("aggregationSeedCount", value)}
            min={1}
            max={10}
            step={1}
            formatValue={(v) => `${v}`}
          />
        </div>
      )}
    </div>
  )}
</div>
      {/* Magnetism Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            Magnetism
          </div>
          <Switch
            size="xs"
            checked={settings.magnetismEnabled}
            onCheckedChange={(checked) =>
              updateSetting("magnetismEnabled", checked)
            }
          />
        </div>
        {settings.magnetismEnabled && (
          <div className="space-y-1.5">
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Strength
              </label>
              <DraggableNumberInput
                value={settings.magnetismStrength}
                onChange={(value) => updateSetting("magnetismStrength", value)}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>

            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Distance
              </label>
              <DraggableNumberInput
                value={settings.magnetismDistance}
                onChange={(value) => updateSetting("magnetismDistance", value)}
                min={0}
                max={300}
                step={1}
                formatValue={(v) => `${v}px`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Wander Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            Wander
          </div>
          <Switch
            size="xs"
            checked={settings.wanderEnabled}
            onCheckedChange={(checked) =>
              updateSetting("wanderEnabled", checked)
            }
          />
        </div>
        {settings.wanderEnabled && (
          <div className="space-y-1.5">
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Strength
              </label>
              <DraggableNumberInput
                value={settings.wanderStrength}
                onChange={(value) => updateSetting("wanderStrength", value)}
                min={0}
                max={3}
                step={0.01}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">Speed</label>
              <DraggableNumberInput
                value={settings.wanderSpeed}
                onChange={(value) => updateSetting("wanderSpeed", value)}
                min={0}
                max={4}
                step={0.1}
                formatValue={(v) => v.toFixed(1)}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Radius
              </label>
              <DraggableNumberInput
                value={settings.wanderRadius}
                onChange={(value) => updateSetting("wanderRadius", value)}
                min={0}
                max={300}
                step={1}
                formatValue={(v) => `${v}px`}
              />
            </div>
          </div>
        )}
      </div>

      {/* External Forces Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            External Forces
          </div>
          <Switch
            size="xs"
            checked={settings.externalForcesEnabled}
            onCheckedChange={(checked) =>
              updateSetting("externalForcesEnabled", checked)
            }
          />
        </div>
        {settings.externalForcesEnabled && (
          <div className="space-y-1.5">
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">Angle</label>
              <DraggableNumberInput
                value={settings.externalForceAngle}
                onChange={(value) => updateSetting("externalForceAngle", value)}
                min={0}
                max={360}
                step={1}
                formatValue={(v) => `${v}°`}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Randomize
              </label>
              <DraggableNumberInput
                value={settings.externalForceAngleRandomize}
                onChange={(value) =>
                  updateSetting("externalForceAngleRandomize", value)
                }
                min={0}
                max={180}
                step={1}
                formatValue={(v) => `±${v}°`}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Strength
              </label>
              <DraggableNumberInput
                value={settings.externalForceStrength}
                onChange={(value) =>
                  updateSetting("externalForceStrength", value)
                }
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Obstacle Avoidance Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/60">
            Obstacle Avoidance
          </div>
          <Switch
            size="xs"
            checked={settings.avoidanceEnabled}
            onCheckedChange={(checked) =>
              updateSetting("avoidanceEnabled", checked)
            }
          />
        </div>
        {settings.avoidanceEnabled && (
          <div className="space-y-1.5">
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Distance
              </label>
              <DraggableNumberInput
                value={settings.avoidanceDistance}
                onChange={(value) => updateSetting("avoidanceDistance", value)}
                min={0}
                max={100}
                step={1}
                formatValue={(v) => `${v}px`}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Strength
              </label>
              <DraggableNumberInput
                value={settings.avoidanceStrength}
                onChange={(value) => updateSetting("avoidanceStrength", value)}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
            <div className="control">
              <label className="inline-block w-[80px] text-[10px]">
                Push Force
              </label>
              <DraggableNumberInput
                value={settings.avoidancePushMultiplier}
                onChange={(value) =>
                  updateSetting("avoidancePushMultiplier", value)
                }
                min={1}
                max={5}
                step={0.1}
                formatValue={(v) => `${v}x`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Boundary Behavior Section */}
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Boundary Behavior
        </div>
        <select
          className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs"
          value={settings.boundaryBehavior}
          onChange={(e) =>
            updateSetting(
              "boundaryBehavior",
              e.target.value as BoundaryBehavior
            )
          }
        >
          <option value="travel-off">Travel Off</option>
          <option value="wrap-around">Wrap Around</option>
          <option value="reflect">Reflect</option>
          <option value="stop">Stop</option>
        </select>
      </div>
    </div>
  );
}
