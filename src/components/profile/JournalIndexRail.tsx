import React from 'react';
import { BookOpen, PenLine, BookMarked, Users, Settings } from 'lucide-react';

interface JournalIndexRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'diaries', label: 'My diaries', icon: BookMarked },
  { id: 'write', label: 'New diary', icon: PenLine },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const JournalIndexRail: React.FC<JournalIndexRailProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="journal-rail hidden lg:flex flex-col w-56 min-h-screen border-r border-lunara-silver/10 py-8 px-4">
      {/* Rail header */}
      <div className="mb-8 px-3">
        <h1 className="text-[0.65rem] font-semibold tracking-[0.35em] text-lunara-silver/80 uppercase">
          LUNARA
        </h1>
        <p className="text-xs font-garamond text-lunara-silver/40 italic mt-1">
          your private journal
        </p>
      </div>

      {/* Ornamental divider */}
      <div className="mx-3 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-lunara-silver/15 to-transparent"></div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                ${isActive
                  ? 'bg-lunara-silver/10 text-lunara-silver border border-lunara-silver/15'
                  : 'text-lunara-silver/50 hover:bg-lunara-silver/5 hover:text-lunara-silver/80 border border-transparent'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-lunara-silver/90' : 'text-lunara-silver/40'}`} />
              <span className="font-garamond text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom ornament */}
      <div className="mt-auto px-3 pt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-lunara-silver/15 to-transparent mb-4"></div>
        <p className="text-[10px] font-garamond text-lunara-silver/30 italic text-center">
          Reflect softly. Heal privately.
        </p>
      </div>
    </nav>
  );
};

export default JournalIndexRail;
