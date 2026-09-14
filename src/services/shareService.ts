import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type DiaryShare = Database['public']['Tables']['diary_shares']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface SharedDiary extends DiaryShare {
  diary?: Database['public']['Tables']['diary_entries']['Row'];
  owner?: Pick<Profile, 'full_name' | 'avatar_url' | 'lunara_user_id'>;
  shared_with?: Pick<Profile, 'full_name' | 'avatar_url' | 'lunara_user_id'>;
}

export const shareService = {
  async getUserByLunaraId(lunaraUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('lunara_user_id', lunaraUserId.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async shareDiary(
    diaryId: string,
    lunaraUserId: string,
    permission: 'read' | 'edit' = 'read'
  ): Promise<DiaryShare> {
    // First, find the target user
    const targetUser = await this.getUserByLunaraId(lunaraUserId);
    if (!targetUser) {
      throw new Error('No user found with this Lunara ID');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Cannot share with yourself
    if (targetUser.id === user.id) {
      throw new Error('You cannot share a diary with yourself');
    }

    // Verify ownership of the diary
    const { data: diary, error: diaryError } = await supabase
      .from('diary_entries')
      .select('user_id')
      .eq('id', diaryId)
      .single();

    if (diaryError || !diary) throw new Error('Diary not found');
    if (diary.user_id !== user.id) throw new Error('Only the diary owner can share');

    // Create share record
    const { data, error } = await supabase
      .from('diary_shares')
      .insert({
        diary_id: diaryId,
        owner_id: user.id,
        shared_with_user_id: targetUser.id,
        permission,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This diary is already shared with this user');
      }
      throw error;
    }
    return data;
  },

  async getSharedDiaries(): Promise<SharedDiary[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('diary_shares')
      .select(`
        *,
        diary:diary_entries(*),
        owner:profiles!diary_shares_owner_id_fkey(full_name, avatar_url, lunara_user_id)
      `)
      .eq('shared_with_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDiaryShares(diaryId: string): Promise<SharedDiary[]> {
    const { data, error } = await supabase
      .from('diary_shares')
      .select(`
        *,
        shared_with:profiles!diary_shares_shared_with_user_id_fkey(full_name, avatar_url, lunara_user_id)
      `)
      .eq('diary_id', diaryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async removeDiaryShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('diary_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;
  },

  async updateSharePermission(
    shareId: string,
    permission: 'read' | 'edit'
  ): Promise<void> {
    const { error } = await supabase
      .from('diary_shares')
      .update({ permission })
      .eq('id', shareId);

    if (error) throw error;
  },
};
