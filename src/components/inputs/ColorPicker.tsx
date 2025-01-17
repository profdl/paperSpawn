import React, { useState, useRef, useEffect, useMemo } from 'react';

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function hexToHSL(hex: string): HSL {
  // Convert hex to RGB first
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

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

export default function ColorPicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const initialHSL = useMemo(() => hexToHSL(value), [value]);
  const [hsl, setHSL] = useState<HSL>(initialHSL);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHSL(hexToHSL(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newH = Number(e.target.value);
    const newHex = HSLToHex(newH, hsl.s, hsl.l);
    setHSL(prev => ({ ...prev, h: newH }));
    onChange(newHex);
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newS = Number(e.target.value);
    const newHex = HSLToHex(hsl.h, newS, hsl.l);
    setHSL(prev => ({ ...prev, s: newS }));
    onChange(newHex);
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newL = Number(e.target.value);
    const newHex = HSLToHex(hsl.h, hsl.s, newL);
    setHSL(prev => ({ ...prev, l: newL }));
    onChange(newHex);
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        className="w-[120px] h-5 rounded flex items-center gap-2 px-2 bg-black/50 border border-white/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-3 h-3 rounded-sm border border-white/20"
          style={{ backgroundColor: value }}
        />
        <span className="text-xs font-mono">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-3 bg-black/90 rounded shadow-lg z-50 w-48">
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Hue</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={handleHueChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, ${hsl.s}%, ${hsl.l}%),
                    hsl(60, ${hsl.s}%, ${hsl.l}%),
                    hsl(120, ${hsl.s}%, ${hsl.l}%),
                    hsl(180, ${hsl.s}%, ${hsl.l}%),
                    hsl(240, ${hsl.s}%, ${hsl.l}%),
                    hsl(300, ${hsl.s}%, ${hsl.l}%),
                    hsl(360, ${hsl.s}%, ${hsl.l}%))`
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Saturation</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={handleSaturationChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hsl.h}, 0%, ${hsl.l}%),
                    hsl(${hsl.h}, 100%, ${hsl.l}%))`
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Lightness</label>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={handleLightnessChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hsl.h}, ${hsl.s}%, 0%),
                    hsl(${hsl.h}, ${hsl.s}%, 50%),
                    hsl(${hsl.h}, ${hsl.s}%, 100%))`
                }}
              />
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
                  onChange(newValue.toUpperCase());
                  setHSL(hexToHSL(newValue));
                }
              }}
              className="mt-2 w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs font-mono"
              placeholder="#RRGGBB"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      )}
    </div>
  );
}