import { X, Trash2 } from 'lucide-react';
import { useProjects, Project } from '../../hooks/useProjects';
import { useSimulation } from '../../contexts/SimulationContext';
import { format } from 'date-fns';

interface ProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectsDrawer({ isOpen, onClose }: ProjectsDrawerProps) {
  const { projects, isLoading, deleteProject } = useProjects();
  const { systemRef, updateSettings } = useSimulation();

  const loadProject = (project: Project) => {
    if (!systemRef.current) return;

    // Load SVG content
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(project.svg_content, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    
    // Clear current content and load new SVG
    systemRef.current.clear();
    systemRef.current.loadSVG(svgElement);

    // Update settings
    updateSettings(project.settings);
    
    onClose();
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