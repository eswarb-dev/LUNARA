import { supabase } from './supabaseClient';

const STORAGE_URL_MARKER = 'storage://';

export const storage = {
  async uploadDiaryImage(
    userId: string,
    file: File,
    diaryId?: string
  ): Promise<{ url: string; path: string }> {
    const fileExt = file.name.split('.').pop();
    const folder = diaryId ? `${userId}/${diaryId}` : userId;
    const fileName = `${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('diary-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    return { url: `${STORAGE_URL_MARKER}${fileName}`, path: fileName };
  },

  async deleteDiaryImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('diary-images')
      .remove([path]);

    if (error) throw error;
  },
};
