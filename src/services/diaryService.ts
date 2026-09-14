import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row'];
type DiaryEntryInsert = Database['public']['Tables']['diary_entries']['Insert'];
type DiaryEntryUpdate = Database['public']['Tables']['diary_entries']['Update'];

export type Diary = DiaryEntry;
export type DiaryInsert = DiaryEntryInsert;
export type DiaryUpdate = DiaryEntryUpdate;

export const diaryService = {
  async getMyDiaries(userId: string): Promise<Diary[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDiaryById(id: string): Promise<Diary | null> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async createDiary(data: DiaryInsert): Promise<Diary> {
    const { data: diary, error } = await supabase
      .from('diary_entries')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return diary;
  },

  async createDiaryShell(title: string, description: string | null, userId: string): Promise<Diary> {
    const { data: diary, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: userId,
        title: title || 'Untitled diary',
        content: '',
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return diary;
  },

  async updateDiary(id: string, updates: DiaryUpdate): Promise<Diary> {
    const { data, error } = await supabase
      .from('diary_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDiary(id: string): Promise<void> {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getRecentDiaries(userId: string, limit = 5): Promise<Diary[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async searchDiaries(userId: string, query: string): Promise<Diary[]> {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDiaryStats(userId: string) {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('mood, date, content')
      .eq('user_id', userId);

    if (error) throw error;

    const entries = data || [];
    const moodCounts: Record<string, number> = {};
    let totalWords = 0;
    entries.forEach((e) => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
      totalWords += (e.content || '').split(/\s+/).length;
    });

    return {
      totalDiaries: entries.length,
      totalWords,
      moodDistribution: moodCounts,
    };
  },

  // Legacy aliases for backward compatibility
  async getAll(userId: string): Promise<Diary[]> {
    return this.getMyDiaries(userId);
  },

  async getById(id: string): Promise<Diary | null> {
    return this.getDiaryById(id);
  },

  async create(entry: DiaryInsert): Promise<Diary> {
    return this.createDiary(entry);
  },

  async update(id: string, updates: DiaryUpdate): Promise<Diary> {
    return this.updateDiary(id, updates);
  },

  async delete(id: string): Promise<void> {
    return this.deleteDiary(id);
  },
};

export type { DiaryEntry, DiaryEntryInsert, DiaryEntryUpdate };
