import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface IDiary {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  readTime?: number;
  excerpt?: string;
  tags: string[];
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  author?: { name: string };
  mood_tags: string[];
  emotion_tags: string[];
  life_balance_tags: string[];
  mood_score?: number;
  sentiment?: string;
  is_public: boolean;
  image_url?: string;
  image_headline?: string;
  image_caption?: string;
}

// Keep IEntry as alias for backward compatibility
export type IEntry = IDiary;

interface IUser {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  lunara_user_id?: string;
  accent_color?: string;
  language?: string;
  daily_reminder?: boolean;
  createdAt: string;
  diaries: IDiary[];
  entries: IDiary[]; // alias for backward compatibility
  drafts: IDiary[];
}

interface AuthContextType {
  user: IUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const buildUser = async (supabaseUser: SupabaseUser): Promise<IUser> => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    const { data: diaries } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .order('updated_at', { ascending: false });

    const mappedDiaries: IDiary[] = (diaries || []).map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      date: e.date,
      mood: e.mood,
      readTime: Math.ceil(e.content.split(/\s+/).length / 200),
      excerpt: e.content.substring(0, 160),
      tags: [...(e.mood_tags || []), ...(e.emotion_tags || []), ...(e.life_balance_tags || [])],
      bannerImage: e.image_url,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      author: { name: profile?.full_name || 'Anonymous' },
      mood_tags: e.mood_tags,
      emotion_tags: e.emotion_tags,
      life_balance_tags: e.life_balance_tags,
      mood_score: e.mood_score,
      sentiment: e.sentiment,
      is_public: e.is_public,
      image_url: e.image_url,
      image_headline: e.image_headline,
      image_caption: e.image_caption,
    }));

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.full_name || undefined,
      bio: profile?.bio || undefined,
      profileImage: profile?.avatar_url || profile?.profile_image_url || undefined,
      lunara_user_id: profile?.lunara_user_id || undefined,
      accent_color: profile?.accent_color,
      language: profile?.language,
      daily_reminder: profile?.daily_reminder,
      createdAt: profile?.created_at || supabaseUser.created_at,
      diaries: mappedDiaries,
      entries: mappedDiaries,
      drafts: [],
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          const builtUser = await buildUser(currentSession.user);
          setUser(builtUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const builtUser = await buildUser(newSession.user);
          setUser(builtUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (error) throw error;
  };

  const register = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<Profile>) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (error) throw error;
    await refreshUser();
  };

  const refreshUser = async () => {
    if (!session?.user) return;
    const builtUser = await buildUser(session.user);
    setUser(builtUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
