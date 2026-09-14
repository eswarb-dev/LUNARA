import { supabase } from '../lib/supabaseClient';
import type { UserAudioTrack } from '../types/database';

const BUCKET = 'user-audio';
const SIGNED_URL_TTL = 3600;

export const userAudioService = {
  async listTracks(userId: string): Promise<UserAudioTrack[]> {
    const { data, error } = await supabase
      .from('user_audio_tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async uploadTrack(
    userId: string,
    file: File,
    title: string,
    mood: string,
    durationSeconds: number | null
  ): Promise<UserAudioTrack> {
    const ext = file.name.split('.').pop() || 'mp3';
    const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: track, error: insertError } = await supabase
      .from('user_audio_tracks')
      .insert({
        user_id: userId,
        title,
        mood,
        storage_path: storagePath,
        duration_seconds: durationSeconds,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return track;
  },

  async deleteTrack(trackId: string, storagePath: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([storagePath]);

    const { error } = await supabase
      .from('user_audio_tracks')
      .delete()
      .eq('id', trackId);

    if (error) throw error;
  },

  async getSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL);

    if (error) throw error;
    return data.signedUrl;
  },
};
