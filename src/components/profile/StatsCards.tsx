import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Eye, Heart, MessageCircle, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Corrected import path based on project structure

const StatsCards = () => {
  const { user } = useAuth();

  const statsData = [
    { title: 'Views This Month', value: user?.viewsThisMonth || '0', icon: Eye, color: 'text-lunara-blue' },
    { title: 'Engagements', value: user?.engagements || '0', icon: Heart, color: 'text-muted-stardust' },
    { title: 'Comments', value: user?.commentsCount || '0', icon: MessageCircle, color: 'text-lunara-accent' },
    { title: 'Reading Time', value: user?.totalReadingTime || '0', icon: Clock, color: 'text-muted-stardust' },
  ];

  const recentEntries = user?.entries ? user.entries.map(entry => ({ title: entry.title, date: entry.date, views: entry.views || 0, mood: entry.mood || 'N/A' })) : [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="lunara-glass-card p-5 md:p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <IconComponent className={`w-7 h-7 ${stat.color}`} />

              </div>
              <div className="space-y-1">
                <p className="text-3xl font-garamond font-bold text-pearl-mist">{stat.value}</p>
                <p className="text-sm font-garamond text-muted-stardust">{stat.title}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Popular Entries */}
        <Card className="lunara-panel-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-6 h-6 text-lunara-blue" />
            <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Popular Entries</h3>
          </div>
          
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-lunara-silver/15 hover:bg-lunara-silver/8 transition-colors">
                <div className="flex-1">
                  <h4 className="font-garamond font-medium text-pearl-mist mb-1">{entry.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-stardust">
                    <span>{entry.date}</span>
                    <span className="px-2 py-1 bg-lunara-silver/15 rounded-full text-xs">{entry.mood}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-stardust">
                  <Eye className="w-4 h-4" />
                  <span className="font-garamond">{entry.views}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Writing Calendar */}
        <Card className="lunara-panel-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <Calendar className="w-6 h-6 text-lunara-accent" />
            <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Writing Calendar</h3>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 rounded-xl border border-lunara-silver/15">
              <div className="text-4xl font-garamond font-bold text-pearl-mist mb-2">{user?.writingStreak || 127}</div>
              <div className="text-lg font-garamond text-muted-stardust">Day Writing Streak</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-garamond text-muted-stardust">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-sm ${
                    Math.random() > 0.3 ? 'bg-lunara-blue/20' : 'bg-lunara-silver/10'
                  } hover:bg-lunara-blue/40 transition-colors cursor-pointer`}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-sm font-garamond text-muted-stardust">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-lunara-silver/10 rounded-sm"></div>
                <div className="w-3 h-3 bg-lunara-blue/20 rounded-sm"></div>
                <div className="w-3 h-3 bg-lunara-blue/40 rounded-sm"></div>
                <div className="w-3 h-3 bg-lunara-blue/60 rounded-sm"></div>
                <div className="w-3 h-3 bg-lunara-blue/80 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatsCards;
