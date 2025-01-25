import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';
import { SimulationSettings } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

interface Preset {
  id: string;
  name: string;
  property_values: SimulationSettings;
  user_id: string;
  created_at: string;
}

export function usePresets() {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch presets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const savePreset = async (name: string, values: SimulationSettings) => {
    if (!user) throw new Error('You must be signed in to save presets');

    const { data, error } = await supabase
      .from('property_presets')
      .upsert({
        name,
        property_values: values,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    await fetchPresets();
    return data;
  };

  const loadPreset = async (id: string) => {
    if (!user) throw new Error('You must be signed in to load presets');

    const { data, error } = await supabase
      .from('property_presets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data.property_values as SimulationSettings;
  };

  return {
    presets,
    loading,
    error,
    savePreset,
    loadPreset
  };
}