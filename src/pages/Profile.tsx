import React, { useState, useCallback } from 'react';
import JournalIndexRail from '@/components/profile/JournalIndexRail';
import JournalOverview from '@/components/profile/JournalOverview';
import MyDiaries from '@/components/profile/MyDiaries';
import WriteEditor from '@/components/profile/WriteEditor';
import DiaryCoverStart from '@/components/profile/DiaryCoverStart';
import SharedDiaries from '@/components/profile/SharedDiaries';
import ProfileSettings from '@/components/profile/ProfileSettings';

type NewDiaryStep = 'cover' | 'transition' | 'writing';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [newDiaryStep, setNewDiaryStep] = useState<NewDiaryStep>('cover');
  const [newDiaryMeta, setNewDiaryMeta] = useState<{ diaryId: string; title: string; description: string } | null>(null);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'write') {
      setNewDiaryStep('cover');
      setNewDiaryMeta(null);
    }
  }, []);

  const handleCoverComplete = useCallback((diaryId: string, title: string, description: string) => {
    setNewDiaryMeta({ diaryId, title, description });
    setNewDiaryStep('transition');
    setTimeout(() => {
      setNewDiaryStep('writing');
    }, 600);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return <JournalOverview />;
      case 'diaries':
        return <MyDiaries onOpenDiary={(diaryId) => {
          window.location.href = `/profile?tab=write&diaryId=${diaryId}`;
        }} />;
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
              />
            </div>
          );
        }
        return (
          <WriteEditor
            initialDiaryId={newDiaryMeta?.diaryId}
            initialTitle={newDiaryMeta?.title}
            initialDescription={newDiaryMeta?.description}
          />
        );
      case 'shared':
        return <SharedDiaries />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <JournalOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Left Journal Index Rail */}
      <JournalIndexRail activeTab={activeTab} onTabChange={handleTabChange} />

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
                ${activeTab === item.id
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
      <main className="flex-1 min-h-screen lg:pb-0 pb-16">
        <div className={`mx-auto px-6 py-8 lg:px-12 ${activeTab === 'write' ? 'max-w-[1400px]' : 'max-w-5xl'}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Profile;
