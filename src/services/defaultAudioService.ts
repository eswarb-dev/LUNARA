import { supabase } from '../lib/supabaseClient';
import type { DefaultAudioTrack, LunaraPlayableTrack } from '../types/database';

export const defaultAudioService = {
  async listDefaultAudioTracks(): Promise<LunaraPlayableTrack[]> {
    try {
      const { data, error } = await supabase
        .from('default_audio_tracks')
        .select('*')
        .eq('id', 'default-moonlit-lofi')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return ((data || []) as DefaultAudioTrack[]).map((track) => {
        const { data: publicUrlData } = supabase.storage
          .from(track.bucket_id)
          .getPublicUrl(track.storage_path);

        return {
          id: track.id,
          title: track.title,
          moodLabel: track.mood_label,
          src: publicUrlData.publicUrl,
          source: 'default',
        };
      });
    } catch (error) {
      console.error('Default audio tracks could not be loaded:', error);
      return [];
    }
  },
};
