import { X, Trash2 } from 'lucide-react';
import { useProjects, Project } from '../../hooks/useProjects';
import { useSimulation } from '../../contexts/SimulationContext';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface ProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectsDrawer({ isOpen, onClose }: ProjectsDrawerProps) {
  const { projects, isLoading, deleteProject } = useProjects();
  const { systemRef, updateSettings } = useSimulation();
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: { [key: string]: string } = {};
      for (const project of projects) {
        const svgContent = project.svg_content;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        newPreviews[project.id] = url;
      }
      setPreviews(newPreviews);
    };

    if (projects.length > 0) {
      generatePreviews();
    }
  }, [projects]);

  const loadProject = (project: Project) => {
    if (!systemRef.current) {
      console.error('Simulation system not initialized');
      return;
    }
  
    console.log('Loading project:', project.name);
    
    try {
      // Parse SVG content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(project.svg_content, 'image/svg+xml');
      
      if (!svgDoc || svgDoc.documentElement.nodeName === 'parsererror') {
        console.error('Invalid SVG content');
        return;
      }
  
      console.log('SVG parsed successfully');
      
      const svgElement = svgDoc.documentElement as unknown as SVGElement;
      
      // Update settings first
      updateSettings(project.settings);
      
      // Small delay to ensure settings are applied
      setTimeout(() => {
        // Clear and load SVG
        systemRef.current?.clear();
        systemRef.current?.loadSVG(svgElement);
        
        console.log('Project loaded successfully');
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-80 bg-black/90 backdrop-blur-sm transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white text-lg font-medium">Saved Projects</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-white/50">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-white/50">No saved projects</div>
          ) : (
            <div className="p-2 space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 rounded bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => loadProject(project)}
                      className="text-white hover:text-white/80 transition-colors text-left flex-1"
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-white/50">
                        {format(new Date(project.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      {previews[project.id] && (
                        <img src={previews[project.id]} alt="Project Preview" className="mt-2 w-full h-auto rounded" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}