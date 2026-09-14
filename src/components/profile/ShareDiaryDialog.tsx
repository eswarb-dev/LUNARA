import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, X, Copy, Check, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { shareService, type SharedDiary } from '../../services/shareService';

interface ShareDiaryDialogProps {
  diaryId: string;
  open: boolean;
  onClose: () => void;
}

const ShareDiaryDialog: React.FC<ShareDiaryDialogProps> = ({ diaryId, open, onClose }) => {
  const { user } = useAuth();
  const [lunaraId, setLunaraId] = useState('');
  const [permission, setPermission] = useState<'read' | 'edit'>('read');
  const [shares, setShares] = useState<SharedDiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (open && diaryId) {
      loadShares();
    }
  }, [open, diaryId]);

  const loadShares = async () => {
    try {
      const data = await shareService.getDiaryShares(diaryId);
      setShares(data);
    } catch (err) {
      console.error('Failed to load shares:', err);
    }
  };

  const handleShare = async () => {
    if (!lunaraId.trim()) return;
    setLoading(true);
    setError('');
    try {
      await shareService.shareDiary(diaryId, lunaraId.trim(), permission);
      setLunaraId('');
      await loadShares();
    } catch (err: any) {
      setError(err.message || 'Failed to share diary');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await shareService.removeDiaryShare(shareId);
      await loadShares();
    } catch (err) {
      console.error('Failed to remove share:', err);
    }
  };

  const copyLunaraId = () => {
    if (user?.lunara_user_id) {
      navigator.clipboard.writeText(user.lunara_user_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink-blue/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-moon-paper border border-lunara-silver/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-ink-blue" />
            <h3 className="text-xl font-garamond font-medium text-ink-blue">Share this diary</h3>
          </div>
          <button onClick={onClose} className="text-muted-brown hover:text-ink-blue">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Your Lunara ID */}
        {user?.lunara_user_id && (
          <div className="mb-6 p-3 bg-cream/50 border border-lunara-silver/15 rounded-lg">
            <p className="text-xs font-garamond text-muted-brown/60 mb-1">Your Lunara ID</p>
            <div className="flex items-center gap-2">
              <span className="font-garamond text-sm text-ink-blue font-medium">{user.lunara_user_id}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={copyLunaraId}
              >
                {copied ? <Check className="w-3 h-3 text-forest-green" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <p className="text-[10px] font-garamond text-muted-brown/40 mt-1 italic">
              Share this ID with trusted friends so they can share diaries with you
            </p>
          </div>
        )}

        {/* Share form */}
        <div className="space-y-4">
          <div>
            <label className="block font-garamond text-sm text-ink-blue mb-1">
              Enter their Lunara ID
            </label>
            <Input
              value={lunaraId}
              onChange={(e) => setLunaraId(e.target.value)}
              placeholder="LUNA-XXXXXX"
              className="bg-cream/50 border-2 border-lunara-silver/30 font-garamond focus:border-ink-blue uppercase"
            />
          </div>

          <div>
            <label className="block font-garamond text-sm text-ink-blue mb-2">Permission</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={permission === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPermission('read')}
                className={permission === 'read' ? 'bg-ink-blue text-cream' : 'border-lunara-silver/30 text-muted-brown'}
              >
                Read only
              </Button>
              <Button
                type="button"
                variant={permission === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPermission('edit')}
                className={permission === 'edit' ? 'bg-ink-blue text-cream' : 'border-lunara-silver/30 text-muted-brown'}
              >
                Can edit
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 font-garamond">{error}</p>
          )}

          <Button
            onClick={handleShare}
            disabled={!lunaraId.trim() || loading}
            className="w-full lunara-button text-cream font-garamond"
          >
            {loading ? 'Sharing...' : 'Share diary'}
          </Button>
        </div>

        {/* Existing shares */}
        {shares.length > 0 && (
          <div className="mt-6 pt-4 border-t border-lunara-silver/15">
            <p className="text-xs font-garamond text-muted-brown/60 mb-3">Shared with</p>
            <div className="space-y-2">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-garamond text-sm text-ink-blue">
                      {(share.shared_with as any)?.full_name || 'Unknown'}
                    </span>
                    <Badge variant="outline" className="font-garamond text-[10px]">
                      {share.permission}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-brown/40 hover:text-red-600"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareDiaryDialog;
