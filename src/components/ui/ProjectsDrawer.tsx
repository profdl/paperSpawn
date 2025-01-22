import { useEffect } from 'react';
import { X, Trash2, Download } from 'lucide-react';
import { useProjects, Project } from '../../hooks/useProjects';
import { useSimulation } from '../../contexts/SimulationContext';
import { format } from 'date-fns';
import { useState, useCallback } from 'react';

interface ProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectsDrawer({ isOpen, onClose }: ProjectsDrawerProps) {
  const { projects, isLoading, deleteProject, refreshProjects } = useProjects();  // Add refreshProjects here
  const { systemRef, updateSettings } = useSimulation();
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const handleOverlayClick = useCallback((e: MouseEvent) => {
    const drawer = document.getElementById('projects-drawer');
    if (drawer && !drawer.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  
  useEffect(() => {
    if (isOpen) {
      refreshProjects();
    }
  }, [isOpen, refreshProjects]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOverlayClick);
      
    }
    return () => {
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [isOpen, handleOverlayClick]);

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

  const downloadSVG = (project: Project) => {
    const blob = new Blob([project.svg_content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" />
      )}
      <div
        id="projects-drawer"
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
              <div className="grid grid-cols-2 gap-2 p-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => loadProject(project)}
                  >
                    {previews[project.id] && (
                      <img 
                        src={previews[project.id]} 
                        alt={project.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex flex-col justify-between p-2">
                      <div className="text-white">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="text-xs text-white/50">
                          {format(new Date(project.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSVG(project);
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          title="Download SVG"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}