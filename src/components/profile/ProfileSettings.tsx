import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Shield, Download, Palette, Globe, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [preferences, setPreferences] = useState({
    accentColor: user?.accent_color || '#e8b4b8',
    language: user?.language || 'English',
    dailyReminder: user?.daily_reminder ?? false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
      setPreferences({
        accentColor: user.accent_color || '#e8b4b8',
        language: user.language || 'English',
        dailyReminder: user.daily_reminder ?? false,
      });
    }
  }, [user]);

  const handleSaveAllSettings = async () => {
    if (!user) return;
    try {
      await updateUser({
        full_name: profileData.displayName,
        bio: profileData.bio,
        accent_color: preferences.accentColor,
        language: preferences.language,
        daily_reminder: preferences.dailyReminder,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        lunara_user_id: user.lunara_user_id,
        createdAt: user.createdAt,
      },
      diaries: user.diaries,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunara-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLunaraId = () => {
    if (user?.lunara_user_id) {
      navigator.clipboard.writeText(user.lunara_user_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
       <div className="text-center">
         <h2 className="lunara-page-heading-on-bg text-3xl font-garamond font-bold mb-2">Lunara Settings</h2>
         <p className="lunara-subtitle-on-bg font-garamond italic">
           "Customize your moonlit journal experience"
         </p>
       </div>

      <div className="ornamental-divider"></div>

      {/* Lunara User ID */}
      {user?.lunara_user_id && (
        <Card className="lunara-panel-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-6 h-6 text-lunara-blue" />
            <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Your Lunara ID</h3>
          </div>
          <p className="text-muted-stardust font-garamond mb-4">
            Share this ID with trusted friends so they can share their private diaries with you.
          </p>
          <div className="lunara-field flex items-center gap-3 p-4">
            <span className="font-garamond text-xl text-pearl-mist font-medium tracking-wide">{user.lunara_user_id}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyLunaraId}
              className="ml-auto"
            >
              {copied ? <Check className="w-4 h-4 text-muted-stardust" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 font-garamond">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </Card>
      )}

      <Card className="lunara-panel-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-6 h-6 text-lunara-accent" />
          <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-garamond text-lg text-pearl-mist mb-2 font-medium">
              Display Name
            </label>
            <Input
              value={profileData.displayName}
              onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
              className="lunara-field font-garamond focus:border-lunara-accent"
            />
          </div>
          <div>
            <label className="block font-garamond text-lg text-pearl-mist mb-2 font-medium">
              Email Address
            </label>
            <Input
              type="email"
              value={profileData.email}
              disabled
              className="lunara-field font-garamond text-lunara-silver/50 opacity-70"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-garamond text-lg text-pearl-mist mb-2 font-medium">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full p-3 rounded-xl lunara-field font-garamond focus:border-lunara-accent resize-none"
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="lunara-panel-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Palette className="w-6 h-6 text-lunara-blue" />
          <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Preferences</h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block font-garamond text-lg text-pearl-mist mb-3 font-medium">
              Accent Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={preferences.accentColor}
                onChange={(e) => setPreferences(prev => ({...prev, accentColor: e.target.value}))}
                className="w-12 h-12 rounded-xl border-2 border-lunara-silver/30 cursor-pointer"
              />
              <span className="font-garamond text-muted-stardust">{preferences.accentColor}</span>
            </div>
          </div>
          <div>
            <label className="block font-garamond text-lg text-pearl-mist mb-3 font-medium">
              Language
            </label>
            <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({...prev, language: value}))}>
              <SelectTrigger className="lunara-field font-garamond">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-garamond text-lg text-pearl-mist font-medium">Daily Reminder</h4>
              <p className="text-muted-stardust font-garamond text-sm">Get reminded to write every day</p>
            </div>
            <Switch
              checked={preferences.dailyReminder}
              onCheckedChange={(checked) => setPreferences(prev => ({...prev, dailyReminder: checked}))}
            />
          </div>
        </div>
      </Card>

      <Card className="lunara-panel-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Download className="w-6 h-6 text-muted-stardust" />
          <h3 className="text-2xl font-garamond font-bold text-pearl-mist">Export Data</h3>
        </div>
        <p className="text-muted-stardust font-garamond mb-5">
          Download all your private diaries and data as JSON.
        </p>
        <Button onClick={handleExportData} variant="outline" className="border-2 border-lunara-silver/30 text-muted-stardust hover:bg-lunara-silver/10 font-garamond">
          Export as JSON
        </Button>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          className="border-2 border-error-rose/50 text-error-rose hover:bg-error-rose/10 font-garamond"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button onClick={handleSaveAllSettings} className="lunara-button text-pearl-mist font-garamond px-8 py-3 text-lg shadow-lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
