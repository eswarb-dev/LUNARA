import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import JournalIndexRail from '@/components/profile/JournalIndexRail';
import JournalOverview from '@/components/profile/JournalOverview';
import MyDiaries from '@/components/profile/MyDiaries';
import WriteEditor from '@/components/profile/WriteEditor';
import DiaryCoverStart from '@/components/profile/DiaryCoverStart';
import SharedDiaries from '@/components/profile/SharedDiaries';
import ProfileSettings from '@/components/profile/ProfileSettings';
import LunaraAmbientPlayer from '@/components/profile/LunaraAmbientPlayer';
import LunaraCelestialBackground from '@/components/profile/LunaraCelestialBackground';

type NewDiaryStep = 'cover' | 'transition' | 'writing';

const VALID_TABS = ['journal', 'diaries', 'my-diaries', 'write', 'shared', 'settings'] as const;
type TabValue = typeof VALID_TABS[number];

function normalizeTab(tab: string | null): TabValue {
  if (tab === 'my-diaries') return 'diaries';
  if (tab !== null && (VALID_TABS as readonly string[]).includes(tab)) return tab as TabValue;
  return 'journal';
}

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const diaryIdParam = searchParams.get('diaryId');

  const [activeTab, setActiveTab] = useState<TabValue>(() => normalizeTab(tabParam));
  const [newDiaryStep, setNewDiaryStep] = useState<NewDiaryStep>('cover');
  const [newDiaryMeta, setNewDiaryMeta] = useState<{ diaryId: string; title: string; description: string } | null>(null);

  useEffect(() => {
    setActiveTab(normalizeTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    if (tabParam === 'write' && diaryIdParam) {
      setNewDiaryStep('writing');
      setNewDiaryMeta({ diaryId: diaryIdParam, title: '', description: '' });
    }
  }, [tabParam, diaryIdParam]);

  const updateTab = useCallback((tab: string, extraParams?: Record<string, string>) => {
    const params: Record<string, string> = { tab };
    if (extraParams) {
      Object.assign(params, extraParams);
    } else {
      searchParams.forEach((value, key) => {
        if (key !== 'tab' && key !== 'diaryId') {
          params[key] = value;
        }
      });
    }
    setSearchParams(params, { replace: false });
  }, [setSearchParams, searchParams]);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'write') {
      setNewDiaryStep('cover');
      setNewDiaryMeta(null);
    }
    updateTab(tab);
  }, [updateTab]);

  const handleOpenDiary = useCallback((diaryId: string) => {
    setNewDiaryMeta({ diaryId, title: '', description: '' });
    setNewDiaryStep('writing');
    updateTab('write', { diaryId });
  }, [updateTab]);

  const handleCoverComplete = useCallback((diaryId: string, title: string, description: string) => {
    setNewDiaryMeta({ diaryId, title, description });
    setNewDiaryStep('transition');
    setTimeout(() => {
      setNewDiaryStep('writing');
    }, 600);
  }, []);

  const handleInvalidDiary = useCallback(() => {
    setNewDiaryMeta(null);
    setNewDiaryStep('cover');
    updateTab('diaries');
  }, [updateTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return <JournalOverview onOpenDiary={handleOpenDiary} />;
      case 'diaries':
        return <MyDiaries onOpenDiary={handleOpenDiary} />;
      case 'write':
        if (newDiaryStep === 'cover') {
          return <DiaryCoverStart onComplete={handleCoverComplete} />;
        }
        if (newDiaryStep === 'transition') {
          return (
            <div className="diary-transition-fade-in">
              <WriteEditor
                initialDiaryId={newDiaryMeta?.diaryId}
                initialTitle={newDiaryMeta?.title}
                initialDescription={newDiaryMeta?.description}
                onInvalidDiary={handleInvalidDiary}
              />
            </div>
          );
        }
        if (newDiaryMeta?.diaryId) {
          return (
            <WriteEditor
              initialDiaryId={newDiaryMeta.diaryId}
              initialTitle={newDiaryMeta.title}
              initialDescription={newDiaryMeta.description}
              onInvalidDiary={handleInvalidDiary}
            />
          );
        }
        return <DiaryCoverStart onComplete={handleCoverComplete} />;
      case 'shared':
        return <SharedDiaries onOpenDiary={handleOpenDiary} />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <JournalOverview onOpenDiary={handleOpenDiary} />;
    }
  };

  const visibleActiveTab =
    activeTab === 'write'
      ? diaryIdParam
        ? 'diaries'
        : 'write'
      : activeTab;

  return (
    <div className="flex min-h-screen bg-deep-moon-navy">
      {/* Left Journal Index Rail */}
      <JournalIndexRail activeTab={visibleActiveTab} onTabChange={handleTabChange} />

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-deep-moon-navy/98 backdrop-blur-sm border-t border-lunara-silver/10 px-2 py-2">
        <div className="flex justify-around">
          {[
            { id: 'journal', label: 'Journal' },
            { id: 'diaries', label: 'Diaries' },
            { id: 'write', label: 'New' },
            { id: 'shared', label: 'Shared' },
            { id: 'settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-garamond transition-colors
                ${visibleActiveTab === item.id
                  ? 'bg-lunara-silver/15 text-lunara-silver'
                  : 'text-lunara-silver/50 hover:text-lunara-silver/80'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Workspace */}
      <main className="lunara-celestial-workspace flex-1 min-h-screen lg:pb-0 pb-28">
        <LunaraCelestialBackground />
        <div className={`lunara-workspace-content relative z-10 mx-auto px-6 pt-8 pb-36 lg:px-12 lg:pb-28 ${activeTab === 'write' ? 'max-w-[1400px]' : 'max-w-5xl'}`}>
          {renderContent()}
        </div>
        <LunaraAmbientPlayer />
      </main>
    </div>
  );
};

export default Profile;
