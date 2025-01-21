import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useSimulation } from '../../contexts/SimulationContext';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveProjectModal({ isOpen, onClose }: SaveProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { saveProject } = useProjects();
  const { systemRef, settings } = useSimulation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemRef.current || !projectName.trim()) return;

    setIsSaving(true);
    try {
      const svgContent = systemRef.current.exportSVG();
      await saveProject(projectName.trim(), svgContent, settings);
      onClose();
      setProjectName('');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Save Project</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-white/70 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !projectName.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}