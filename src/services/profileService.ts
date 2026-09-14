import { supabase } from '../lib/supabaseClient';
import type { Database, LunaraProfileSearchResult } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadProfileImage(
    userId: string,
    file: File
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    await this.updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  },

  async deleteProfileImage(userId: string): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile?.avatar_url) {
      const urlParts = profile.avatar_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      await supabase.storage.from('avatars').remove([filePath]);
    }

    await this.updateProfile(userId, { avatar_url: null });
  },

  async findProfileByLunaraId(
    lunaraUserId: string
  ): Promise<LunaraProfileSearchResult | null> {
    const { data, error } = await supabase.rpc('find_lunara_profile', {
      search_lunara_user_id: lunaraUserId.trim().toUpperCase(),
    });

    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data[0] as LunaraProfileSearchResult;
  },
};

export type { Profile, ProfileUpdate };
