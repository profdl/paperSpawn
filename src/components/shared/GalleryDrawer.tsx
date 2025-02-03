import { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryDrawer({ isOpen, onClose }: GalleryDrawerProps) {
  const [images, setImages] = useState<{ id: string; url: string; date: string }[]>([]);

  const handleSaveCurrentCanvas = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Create a temporary canvas to draw the Paper.js canvas content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the original canvas onto the temporary canvas
    ctx.drawImage(canvas, 0, 0);

    // Convert to PNG
    const dataUrl = tempCanvas.toDataURL('image/png');
    
    // Save to images array
    setImages(prev => [...prev, {
      id: Date.now().toString(),
      url: dataUrl,
      date: new Date().toLocaleString()
    }]);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-black/90 backdrop-blur-sm transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } border-l border-white/10`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono text-white">Gallery</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <button
          onClick={handleSaveCurrentCanvas}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded text-sm text-white mb-4"
        >
          Save Current Canvas
        </button>

        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={`Saved canvas ${image.date}`}
                className="w-full h-auto rounded border border-white/10"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(image.url, '_blank')}
                  className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-white text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image.url;
                    link.download = `canvas-${image.date}.png`;
                    link.click();
                  }}
                  className="p-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-white text-xs"
                >
                  Download
                </button>
              </div>
              <div className="text-xs text-white/60 mt-1">{image.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
