import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diaryToDelete, setDiaryToDelete] = useState<Diary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDeleting(true);
    setDeleteError(null);
    try {
      await diaryService.deleteDiary(diaryId);
      setDiaries(prev => prev.filter(d => d.id !== diaryId));
      setDeleteDialogOpen(false);
      setDiaryToDelete(null);
    } catch (error) {
      setDeleteError('Could not delete this diary. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (diary: Diary) => {
    setDiaryToDelete(diary);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setDiaryToDelete(null);
    setDeleteError(null);
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
      <div className="lunara-loading-state text-center py-12">
        <div className="w-12 h-12 border-4 border-lunara-silver/20 border-t-ink-blue rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-garamond text-muted-stardust italic">Gathering your diaries...</p>
      </div>
    );
  }

  return (
    <div className="lunara-list-page space-y-6">
      <div className="space-y-2">
        <h2 className="lunara-page-heading-on-bg text-3xl font-garamond font-bold">My diaries</h2>
        <p className="lunara-subtitle-on-bg font-garamond italic text-sm">
          Your private books, held safely
        </p>
      </div>

      <div className="lunara-search-row max-w-[520px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-stardust/70 w-4 h-4" />
          <Input
            placeholder="Search your diaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="lunara-field pl-10 font-garamond text-pearl-mist placeholder:text-lunara-silver/55 focus:border-lunara-accent"
          />
        </div>
      </div>

      {filteredDiaries.length > 0 ? (
        <div className="lunara-diary-grid">
          {filteredDiaries.map((diary) => {
            const wordCount = diary.content?.split(/\s+/).length || 0;
            const excerpt = diary.description || stripMetadataForDisplay(diary.content || '').substring(0, 160) || '';

            return (
              <div
                key={diary.id}
                className="lunara-diary-card group"
                onClick={() => onOpenDiary(diary.id)}
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
                      <p className="font-garamond text-[0.8rem] text-muted-stardust/70 italic">
                        {formatRelativeTime(diary.updated_at)}
                      </p>
                      {diary.mood && (
                        <span className={`font-garamond text-[10px] border rounded-full px-2 py-0.5 ${getMoodColor(diary.mood)}`}>
                          {diary.mood}
                        </span>
                      )}
                      <Badge variant="outline" className="font-garamond text-[10px] border-lunara-silver/20 text-muted-stardust/60">
                        Private
                      </Badge>
                    </div>

                    <h3 className="text-lg font-garamond font-medium text-pearl-mist mb-2 group-hover:text-lunara-accent transition-colors">
                      {diary.title || 'Untitled diary'}
                    </h3>

                    <p className="text-sm font-garamond text-muted-stardust leading-relaxed line-clamp-3 mb-3">
                      {excerpt}...
                    </p>

                    <div className="flex items-center gap-4">
                      <span className="font-garamond text-[10px] text-muted-stardust/70">
                        {wordCount} words
                      </span>
                      <span className="font-garamond text-[10px] text-muted-stardust/70">
                        {new Date(diary.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-lunara-silver/15 pt-3">
                    <span className="font-garamond text-xs text-muted-stardust whitespace-nowrap">
                      Open diary
                    </span>
                    {onShareDiary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-stardust/50 hover:text-muted-stardust"
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
                      className="h-8 w-8 p-0 text-muted-stardust/50 hover:text-error-rose"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(diary);
                      }}
                      aria-label="Delete diary"
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
        <div className="lunara-dark-empty-card text-center py-16 px-6">
          <div className="ornamental-divider mb-8"></div>
          <BookMarked className="w-12 h-12 text-lunara-silver/50 mx-auto mb-4" />
          <p className="font-garamond text-lg text-pearl-mist italic leading-relaxed">
            No diaries yet. Begin your first private book.
          </p>
          <p className="font-garamond text-sm text-lunara-silver/60 italic mt-2">
            Your thoughts will rest here safely.
          </p>
          <div className="ornamental-divider mt-8"></div>
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <DialogContent className="lunara-danger-dialog max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-garamond text-xl text-pearl-mist">
              Delete this diary?
            </DialogTitle>
            <DialogDescription className="font-garamond text-lunara-silver/80 italic">
              This diary will be removed forever. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="font-garamond text-sm text-error-rose italic" role="alert">{deleteError}</p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleting}
              className="border-2 border-lunara-silver/30 bg-transparent text-lunara-silver hover:bg-lunara-silver/10 hover:text-pearl-mist font-garamond"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => diaryToDelete && handleDeleteDiary(diaryToDelete.id)}
              disabled={deleting}
              className="bg-error-rose hover:bg-error-rose/90 text-pearl-mist font-garamond shadow-lg shadow-error-rose/20"
            >
              {deleting ? 'Deleting...' : 'Delete diary'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDiaries;
