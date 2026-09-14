import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, BookOpen, Eye, Edit2, Search, Copy, Check, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { shareService, type SharedDiary } from '../../services/shareService';
import { profileService } from '../../services/profileService';
import { stripMetadataForDisplay } from '@/lib/diaryContent';
import type { LunaraProfileSearchResult } from '../../types/database';

const LUNA_ID_REGEX = /^LUNA-[A-Z0-9]{6}$/;

interface SharedDiariesProps {
  onOpenDiary: (diaryId: string) => void;
}

const SharedDiaries: React.FC<SharedDiariesProps> = ({ onOpenDiary }) => {
  const [sharedDiaries, setSharedDiaries] = useState<SharedDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'searching' | 'found' | 'not-found' | 'invalid' | 'error' | 'self'
  >('idle');
  const [foundProfile, setFoundProfile] = useState<LunaraProfileSearchResult | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSharedDiaries();
    }
  }, [user]);

  const fetchSharedDiaries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await shareService.getSharedDiaries();
      setSharedDiaries(data);
    } catch (error) {
      console.error('Failed to fetch shared diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = searchInput.trim().toUpperCase();

    if (!trimmed) {
      setSearchStatus('idle');
      setFoundProfile(null);
      return;
    }

    const normalized = trimmed.startsWith('LUNA-') ? trimmed : `LUNA-${trimmed}`;

    if (!LUNA_ID_REGEX.test(normalized)) {
      setSearchStatus('invalid');
      setFoundProfile(null);
      return;
    }

    if (user && normalized === user.lunara_user_id) {
      setSearchStatus('self');
      setFoundProfile(null);
      return;
    }

    setSearchStatus('searching');
    setFoundProfile(null);

    try {
      const profile = await profileService.findProfileByLunaraId(normalized);
      if (profile) {
        setFoundProfile(profile);
        setSearchStatus('found');
      } else {
        setSearchStatus('not-found');
      }
    } catch (error) {
      console.error('Profile search failed:', error);
      setSearchStatus('error');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatMemberSince = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="lunara-loading-state text-center py-12">
        <div className="w-12 h-12 border-4 border-lunara-silver/20 border-t-ink-blue rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-garamond text-muted-stardust italic">Gathering shared diaries...</p>
      </div>
    );
  }

  return (
    <div className="lunara-list-page space-y-8">
      {/* Find People Section */}
      <div className="lunara-panel-card p-5 md:p-7">
        <div className="flex items-center gap-3 mb-2">
          <UserPlus className="w-5 h-5 text-lunara-blue" />
          <h3 className="text-xl font-garamond font-medium text-pearl-mist">Find people</h3>
        </div>
        <p className="font-garamond text-sm text-muted-stardust italic mb-5">
          Search with a Lunara ID to find a trusted reader.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value.toUpperCase());
              if (searchStatus !== 'idle') setSearchStatus('idle');
            }}
            onKeyDown={handleKeyDown}
            placeholder="LUNA-FF6A23"
            className="lunara-field flex-1 font-garamond text-pearl-mist placeholder:text-lunara-silver/55 focus:border-lunara-accent tracking-wide"
          />
          <Button
            onClick={handleSearch}
            disabled={searchStatus === 'searching'}
            className="lunara-button text-pearl-mist font-garamond px-6"
          >
            {searchStatus === 'searching' ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-pearl-mist/30 border-t-pearl-mist rounded-full animate-spin" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find
              </span>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {searchStatus === 'invalid' && (
          <p className="font-garamond text-sm text-lunara-glow italic mt-3">
            This looks like an invalid Lunara ID.
          </p>
        )}
        {searchStatus === 'not-found' && (
          <p className="font-garamond text-sm text-muted-stardust/60 italic mt-3">
            No Lunara profile found.
          </p>
        )}
        {searchStatus === 'error' && (
          <p className="font-garamond text-sm text-error-rose italic mt-3">
            Could not search right now.
          </p>
        )}
        {searchStatus === 'self' && (
          <p className="font-garamond text-sm text-lunara-accent italic mt-3">
            That is your own Lunara ID.
          </p>
        )}

        {/* Profile Result Card */}
        {searchStatus === 'found' && foundProfile && (
          <div className="mt-5 lunara-glass-card p-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-lunara-silver/25 p-0.5 bg-lunara-silver/15 flex-shrink-0">
                <Avatar className="w-full h-full">
                  <AvatarImage src={foundProfile.avatar_url || '/placeholder.svg'} alt="Profile" />
                  <AvatarFallback className="text-lg font-garamond text-pearl-mist bg-deep-moon-navy">
                    {foundProfile.full_name
                      ? foundProfile.full_name.charAt(0).toUpperCase()
                      : 'L'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="font-garamond text-xs text-muted-stardust font-medium mb-1">
                  Lunara profile · Trusted identity
                </p>
                <h4 className="font-garamond text-lg font-medium text-pearl-mist">
                  {foundProfile.full_name || 'Unnamed'}
                </h4>

                <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                  <span className="font-garamond text-sm text-muted-stardust">
                    {foundProfile.lunara_user_id}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => handleCopyId(foundProfile.lunara_user_id)}
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-lunara-accent" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-stardust/60" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start mt-2 text-xs text-muted-stardust font-garamond">
                  <span>
                    Member since {formatMemberSince(foundProfile.member_since)}
                  </span>
                  <span>·</span>
                  <span>
                    Diaries shared with you:{' '}
                    <span className="text-pearl-mist font-medium">
                      {foundProfile.diaries_shared_with_me}
                    </span>
                  </span>
                  <span>·</span>
                  <span>
                    Your shared diaries with them:{' '}
                    <span className="text-pearl-mist font-medium">
                      {foundProfile.my_diaries_shared_with_them}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Diaries List */}
      <div className="space-y-2">
        <h2 className="lunara-page-heading-on-bg text-3xl font-garamond font-bold">Shared diaries</h2>
        <p className="lunara-subtitle-on-bg font-garamond italic text-sm">
          Diaries trusted with you
        </p>
      </div>

      {sharedDiaries.length > 0 ? (
        <div className="lunara-diary-grid">
          {sharedDiaries.map((share) => {
            const diary = share.diary;
            if (!diary) return null;

            const wordCount = diary.content?.split(/\s+/).length || 0;
            const excerpt = stripMetadataForDisplay(diary.content || '').substring(0, 160) || '';
            const ownerName = (share.owner as any)?.full_name || 'Unknown';
            const isEditable = share.permission === 'edit';

            return (
              <div
                key={share.id}
                className="lunara-diary-card group"
                onClick={() => onOpenDiary(diary.id)}
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
                      <p className="font-garamond text-[0.8rem] text-muted-stardust/70 italic">
                        Shared by {ownerName}
                      </p>
                      <Badge
                        variant="outline"
                        className={`font-garamond text-[10px] ${
                          isEditable
                            ? 'border-muted-stardust/30 text-muted-stardust'
                            : 'border-lunara-blue/20 text-lunara-blue'
                        }`}
                      >
                        {isEditable ? (
                          <><Edit2 className="w-3 h-3 mr-1" /> Can edit</>
                        ) : (
                          <><Eye className="w-3 h-3 mr-1" /> Read only</>
                        )}
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
                        {new Date(share.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="border-t border-lunara-silver/15 pt-3 font-garamond text-xs text-muted-stardust transition-colors whitespace-nowrap">
                    Open diary
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="lunara-dark-empty-card text-center py-16 px-6">
          <div className="ornamental-divider mb-8"></div>
          <Users className="w-12 h-12 text-lunara-silver/50 mx-auto mb-4" />
          <p className="font-garamond text-lg text-pearl-mist italic leading-relaxed">
            No shared diaries yet.
          </p>
          <p className="font-garamond text-sm text-lunara-silver/60 italic mt-2">
            When someone trusts you with their words, they will appear here.
          </p>
          <div className="ornamental-divider mt-8"></div>
        </div>
      )}
    </div>
  );
};

export default SharedDiaries;
