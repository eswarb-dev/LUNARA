export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          bio: string | null;
          avatar_url: string | null;
          profile_image_url: string | null;
          lunara_user_id: string | null;
          accent_color: string;
          language: string;
          daily_reminder: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          profile_image_url?: string | null;
          lunara_user_id?: string | null;
          accent_color?: string;
          language?: string;
          daily_reminder?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          profile_image_url?: string | null;
          lunara_user_id?: string | null;
          accent_color?: string;
          language?: string;
          daily_reminder?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          description: string | null;
          date: string;
          mood: string | null;
          mood_score: number | null;
          sentiment: string | null;
          mood_tags: string[];
          emotion_tags: string[];
          life_balance_tags: string[];
          is_public: boolean;
          image_url: string | null;
          image_headline: string | null;
          image_caption: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          description?: string | null;
          date?: string;
          mood?: string | null;
          mood_score?: number | null;
          sentiment?: string | null;
          mood_tags?: string[];
          emotion_tags?: string[];
          life_balance_tags?: string[];
          is_public?: boolean;
          image_url?: string | null;
          image_headline?: string | null;
          image_caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          description?: string | null;
          date?: string;
          mood?: string | null;
          mood_score?: number | null;
          sentiment?: string | null;
          mood_tags?: string[];
          emotion_tags?: string[];
          life_balance_tags?: string[];
          is_public?: boolean;
          image_url?: string | null;
          image_headline?: string | null;
          image_caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      diary_shares: {
        Row: {
          id: string;
          diary_id: string;
          owner_id: string;
          shared_with_user_id: string;
          permission: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          diary_id: string;
          owner_id: string;
          shared_with_user_id: string;
          permission?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          diary_id?: string;
          owner_id?: string;
          shared_with_user_id?: string;
          permission?: string;
          created_at?: string;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          mood: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: string;
          created_at?: string;
        };
      };
    };
  };
}

export interface LunaraProfileSearchResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  lunara_user_id: string;
  member_since: string;
  diaries_shared_with_me: number;
  my_diaries_shared_with_them: number;
}

export interface UserAudioTrack {
  id: string;
  user_id: string;
  title: string;
  mood: string;
  storage_path: string;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface DefaultAudioTrack {
  id: string;
  title: string;
  mood_label: string;
  bucket_id: string;
  storage_path: string;
  content_type: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LunaraPlayableTrack {
  id: string;
  title: string;
  moodLabel: string;
  src: string;
  source: 'default' | 'user';
}
