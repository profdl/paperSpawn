
import { useSimulation } from "../../contexts/SimulationContext";
import DraggableNumberInput from "../ui/DraggableNumberInput";
import { BoundaryBehavior, BehaviorConfig } from "../../types";
import { Switch } from "../ui/Switch";

const BEHAVIORS: BehaviorConfig[] = [
  {
    key: "flocking",
    label: "Flocking",
    enabledKey: "flockingEnabled",
    controls: [
      {
        label: "Separation",
        settingKey: "separation",
        min: 0,
        max: 1,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "",
        settingKey: "separationDistance",
        min: 1,
        max: 100,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
      {
        label: "Cohesion",
        settingKey: "cohesion",
        min: 0,
        max: 1,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "",
        settingKey: "cohesionDistance",
        min: 1,
        max: 200,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
      {
        label: "Alignment",
        settingKey: "alignment",
        min: 0,
        max: 1,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "",
        settingKey: "alignmentDistance",
        min: 1,
        max: 150,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
    ],
  },
  {
    key: "aggregation",
    label: "Aggregation",
    enabledKey: "aggregationEnabled",
    controls: [
      {
        label: "Distance",
        settingKey: "aggregationDistance",
        min: 1,
        max: 100,
        step: 1,
        formatValue: (v) => `${Math.round(v)}px`,
      },
      {
        label: "Spacing",
        settingKey: "aggregationSpacing",
        min: 1,
        max: 20,
        step: 0.1,
        formatValue: (v) => `${v.toFixed(1)}x`,
      },
    ],
  },
  {
    key: "dla",
    label: "Freeze (DLA)",
    enabledKey: "dlaEnabled",
    controls: [
      {
        label: "Snap Distance",
        settingKey: "dlaSnapDistance",
        min: 1,
        max: 50,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
      {
        label: "Snap Spacing",
        settingKey: "dlaSnapSpacing",
        min: 1,
        max: 20,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
    ],
  },
  {
    key: "magnetism",
    label: "Magnetism",
    enabledKey: "magnetismEnabled",
    controls: [
      {
        label: "Strength",
        settingKey: "magnetismStrength",
        min: 0,
        max: 1,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "Distance",
        settingKey: "magnetismDistance",
        min: 0,
        max: 300,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
    ],
  },
  {
    key: "wander",
    label: "Wander",
    enabledKey: "wanderEnabled",
    controls: [
      {
        label: "Strength",
        settingKey: "wanderStrength",
        min: 0,
        max: 3,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "Speed",
        settingKey: "wanderSpeed",
        min: 0,
        max: 4,
        step: 0.1,
        formatValue: (v) => v.toFixed(1),
      },
      {
        label: "Radius",
        settingKey: "wanderRadius",
        min: 0,
        max: 300,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
    ],
  },
  {
    key: "externalForces",
    label: "External Forces",
    enabledKey: "externalForcesEnabled",
    controls: [
      {
        label: "Angle",
        settingKey: "externalForceAngle",
        min: 0,
        max: 360,
        step: 1,
        formatValue: (v) => `${v}°`,
      },
      {
        label: "Randomize",
        settingKey: "externalForceAngleRandomize",
        min: 0,
        max: 180,
        step: 1,
        formatValue: (v) => `±${v}°`,
      },
      {
        label: "Strength",
        settingKey: "externalForceStrength",
        min: 0,
        max: 2,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
    ],
  },
  {
    key: "avoidance",
    label: "Obstacle Avoidance",
    enabledKey: "avoidanceEnabled",
    controls: [
      {
        label: "Distance",
        settingKey: "avoidanceDistance",
        min: 0,
        max: 100,
        step: 1,
        formatValue: (v) => `${v}px`,
      },
      {
        label: "Strength",
        settingKey: "avoidanceStrength",
        min: 0,
        max: 2,
        step: 0.01,
        formatValue: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        label: "Push Force",
        settingKey: "avoidancePushMultiplier",
        min: 1,
        max: 5,
        step: 0.1,
        formatValue: (v) => `${v}x`,
      },
    ],
  },
];

function BehaviorSection({ config }: { config: BehaviorConfig }) {
  const { settings, updateSetting } = useSimulation();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] uppercase tracking-wider text-white/60">
          {config.label}
        </div>
        <Switch
          size="xs"
          checked={Boolean(settings[config.enabledKey])}
          onCheckedChange={(checked) =>
            updateSetting(config.enabledKey, checked)
          }
        />
      </div>
      {settings[config.enabledKey] && config.controls && (
        <div className="space-y-1.5">
          {config.controls.map((control) => (
            <div key={control.settingKey} className="control">
              <label className="inline-block w-[80px] text-[10px]">
                {control.label}
              </label>
              <DraggableNumberInput
                value={Number(settings[control.settingKey]) || 0}
                onChange={(value) => updateSetting(control.settingKey, value)}
                min={control.min}
                max={control.max}
                step={control.step}
                formatValue={control.formatValue}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BehaviorControls() {
  const { settings, updateSetting } = useSimulation();

  return (
    <div className="space-y-6">
      {BEHAVIORS.map((behavior) => (
        <BehaviorSection key={behavior.key} config={behavior} />
      ))}

      {/* Boundary Behavior Section */}
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Boundary Behavior
        </div>
        <select
          className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs"
          value={settings.boundaryBehavior}
          onChange={(e) =>
            updateSetting("boundaryBehavior", e.target.value as BoundaryBehavior)
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