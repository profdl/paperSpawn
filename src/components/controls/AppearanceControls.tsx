import { useSimulation } from '../../contexts/SimulationContext';
import ColorPicker from '../ui/ColorPicker';
import { colorSchemes } from '../../types';
import { Shuffle } from 'lucide-react';
import DraggableNumberInput from '../ui/DraggableNumberInput';

function HSLToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function generateHarmoniousColors() {
  // Generate a random base hue
  const baseHue = Math.random() * 360;
  
  // Create harmonious colors using color theory
  const colors = {
    // Background: Lower saturation, higher lightness
    background: HSLToHex(
      baseHue,
      Math.random() * 20 + 10, // 10-30% saturation
      Math.random() * 20 + 80  // 80-100% lightness for light backgrounds
                              // Or use 5-20% for dark backgrounds
    ),
    
    // Particle: Related hue, higher saturation
    particle: HSLToHex(
      (baseHue + 180) % 360,   // Complementary color
      Math.random() * 30 + 70, // 70-100% saturation
      Math.random() * 30 + 35  // 35-65% lightness
    ),
    
    // Trail: Similar hue to particle but different brightness
    trail: HSLToHex(
      (baseHue + 150 + Math.random() * 60) % 360, // Analogous to complementary
      Math.random() * 30 + 60, // 60-90% saturation
      Math.random() * 30 + 25  // 25-55% lightness
    )
  };

  return colors;
}

export default function AppearanceControls({ style }: { style?: React.CSSProperties }) {
  const { settings, updateSetting } = useSimulation();
  const { systemRef } = useSimulation();


  const handleRandomizeColors = () => {
    const colors = generateHarmoniousColors();
    updateSetting('backgroundColor', colors.background);
    updateSetting('particleColor', colors.particle);
    updateSetting('trailColor', colors.trail);
  };

  return (
    <div className="space-y-4" style={style}>
      <div className="control">
        <label className="block text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Color Schemes
        </label>
        <div className="grid grid-cols-8 gap-0.5">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              title={scheme.name}
              className="aspect-square p-0.5 rounded hover:bg-white/10 transition-colors"
              onClick={() => {
                updateSetting('backgroundColor', scheme.background);
                updateSetting('particleColor', scheme.particle);
                updateSetting('trailColor', scheme.trail);
              }}
            >
              <div className="w-full h-full rounded overflow-hidden grid grid-rows-3 gap-px">
                <div style={{ backgroundColor: scheme.background }} className="row-span-2" />
                <div className="grid grid-cols-2 gap-px">
                  <div style={{ backgroundColor: scheme.particle }} />
                  <div style={{ backgroundColor: scheme.trail }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-white/60">
            Custom Colors
          </span>
          <button
            onClick={handleRandomizeColors}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 rounded transition-colors"
            title="Generate Harmonious Colors"
          >
            <Shuffle className="w-3 h-3" />
            Random
          </button>
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Background</label>
            <ColorPicker
              value={settings.backgroundColor}
              onChange={(value) => updateSetting('backgroundColor', value)}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Particles</label>
            <ColorPicker
              value={settings.particleColor}
              onChange={(value) => updateSetting('particleColor', value)}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Trails</label>
            <ColorPicker
              value={settings.trailColor}
              onChange={(value) => updateSetting('trailColor', value)}
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2 text-white/60">
          Particle Properties
        </div>
        <div className="space-y-1.5">
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Radius</label>
            <DraggableNumberInput
              value={settings.particleSize}
              onChange={(value) => {
                updateSetting('particleSize', value);
                systemRef.current?.setParticleRadius(value);
              }}
              min={0.5}
              max={10}
              step={0.5}
              formatValue={(v) => `${v}px`}
            />
          </div>
          <div className="control">
            <label className="inline-block w-[80px] text-[10px]">Trail Width</label>
            <DraggableNumberInput
              value={settings.chemicalDeposit}
              onChange={(value) => {
                updateSetting('chemicalDeposit', value);
                systemRef.current?.setTrailWidth(value);
              }}
              min={0.5}
              max={5}
              step={0.5}
              formatValue={(v) => `${v}px`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}