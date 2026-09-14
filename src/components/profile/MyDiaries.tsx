import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookMarked, Clock, Trash2, PenLine, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { diaryService, type Diary } from '../../services/diaryService';
import { stripMetadataForDisplay } from '@/lib/diaryContent';

interface MyDiariesProps {
  onOpenDiary: (diaryId: string) => void;
  onShareDiary?: (diaryId: string) => void;
}

const MyDiaries: React.FC<MyDiariesProps> = ({ onOpenDiary, onShareDiary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDiaries();
    }
  }, [user]);

  const fetchDiaries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await diaryService.getMyDiaries(user.id);
      setDiaries(data);
    } catch (error) {
      console.error('Failed to fetch diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiaries = diaries.filter(diary =>
    diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (diary.description && diary.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteDiary = async (diaryId: string) => {
    if (!user) return;
    try {
      await diaryService.deleteDiary(diaryId);
      setDiaries(prev => prev.filter(d => d.id !== diaryId));
    } catch (error) {
      console.error('Failed to delete diary:', error);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      'Peaceful': 'bg-ink-blue/10 text-ink-blue border-ink-blue/20',
      'Excited': 'bg-muted-stardust/10 text-muted-stardust border-muted-stardust/20',
      'Contemplative': 'bg-lunara-accent/10 text-lunara-accent border-lunara-accent/20',
      'Joyful': 'bg-lunara-accent/10 text-lunara-accent border-lunara-accent/20',
      'Melancholy': 'bg-muted-stardust/10 text-muted-stardust border-muted-stardust/20',
      'Reflective': 'bg-lunara-accent/10 text-lunara-accent border-lunara-accent/20',
    };
    return colors[mood] || 'bg-soft-gray/10 text-soft-gray border-soft-gray/20';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-lunara-silver/20 border-t-ink-blue rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-garamond text-muted-brown italic">Gathering your diaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-garamond font-bold text-ink-blue">My diaries</h2>
        <p className="text-muted-brown font-garamond italic text-sm">
          Your private books, held safely
        </p>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-brown w-4 h-4" />
          <Input
            placeholder="Search your diaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-moon-paper/50 border-2 border-lunara-silver/30 font-garamond focus:border-ink-blue"
          />
        </div>
      </div>

      {filteredDiaries.length > 0 ? (
        <div className="space-y-4">
          {filteredDiaries.map((diary) => {
            const wordCount = diary.content?.split(/\s+/).length || 0;
            const excerpt = diary.description || stripMetadataForDisplay(diary.content || '').substring(0, 160) || '';

            return (
              <div
                key={diary.id}
                className="vintage-card border border-lunara-silver/15 p-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => onOpenDiary(diary.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-garamond text-[0.85rem] text-muted-brown/60 italic">
                        {formatRelativeTime(diary.updated_at)}
                      </p>
                      {diary.mood && (
                        <span className={`font-garamond text-[10px] border rounded-full px-2 py-0.5 ${getMoodColor(diary.mood)}`}>
                          {diary.mood}
                        </span>
                      )}
                      <Badge variant="outline" className="font-garamond text-[10px] border-lunara-silver/15 text-muted-brown/50">
                        Private
                      </Badge>
                    </div>

                    <h3 className="text-xl font-garamond font-medium text-ink-blue mb-2 group-hover:text-muted-stardust transition-colors">
                      {diary.title || 'Untitled diary'}
                    </h3>

                    <p className="text-sm font-garamond text-muted-brown/70 leading-relaxed line-clamp-2 mb-3">
                      {excerpt}...
                    </p>

                    <div className="flex items-center gap-4">
                      <span className="font-garamond text-[10px] text-muted-brown/40">
                        {wordCount} words
                      </span>
                      <span className="font-garamond text-[10px] text-muted-brown/40">
                        {new Date(diary.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-garamond text-xs text-muted-stardust whitespace-nowrap">
                      Open diary
                    </span>
                    {onShareDiary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-brown/40 hover:text-muted-brown"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareDiary(diary.id);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-brown/40 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('This diary will be removed forever.')) {
                          handleDeleteDiary(diary.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="ornamental-divider mb-8"></div>
          <BookMarked className="w-12 h-12 text-muted-brown/30 mx-auto mb-4" />
          <p className="font-garamond text-lg text-muted-brown/60 italic leading-relaxed">
            No diaries yet. Begin your first private book.
          </p>
          <p className="font-garamond text-sm text-muted-brown/40 italic mt-2">
            Your thoughts will rest here safely.
          </p>
          <div className="ornamental-divider mt-8"></div>
        </div>
      )}
    </div>
  );
};

export default MyDiaries;
