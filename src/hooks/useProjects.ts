import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SimulationSettings } from '../types';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  svg_content: string;
  settings: SimulationSettings;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (name: string, svgContent: string, settings: SimulationSettings) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            svg_content: svgContent,
            settings,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving project:', error);
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .match({ id });

      if (error) throw error;
      
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    isLoading,
    saveProject,
    deleteProject,
    refreshProjects: fetchProjects 
  };
}