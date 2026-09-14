import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Calendar, BookOpen, Camera, Feather, Clock, Copy, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import ProfileImageCropDialog from './ProfileImageCropDialog';

const JournalOverview = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser({ full_name: name, bio });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile changes:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please choose an image file (PNG, JPEG, or WebP).');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('This image is too large. Choose one under 5 MB.');
      return;
    }

    setSelectedImageFile(file);
    setCropDialogOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropUpload = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploading(true);
    try {
      const file = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' });
      const imageUrl = await profileService.uploadProfileImage(user.id, file);
      setProfileImage(imageUrl);
      await refreshUser();
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    } finally {
      setUploading(false);
      setSelectedImageFile(null);
    }
  };

  const handleCropDialogClose = (open: boolean) => {
    setCropDialogOpen(open);
    if (!open) {
      setSelectedImageFile(null);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setRemoving(true);
    setRemoveError('');
    try {
      await profileService.deleteProfileImage(user.id);
      setProfileImage('');
      await refreshUser();
      setRemoveDialogOpen(false);
    } catch (error) {
      console.error('Failed to remove profile image:', error);
      setRemoveError('Could not remove your photo.');
    } finally {
      setRemoving(false);
    }
  };

  const copyLunaraId = () => {
    if (user?.lunara_user_id) {
      navigator.clipboard.writeText(user.lunara_user_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalWords = user?.diaries?.reduce((sum, d) => sum + (d.content?.split(/\s+/).length || 0), 0) || 0;
  const todayDiaries = user?.diaries?.filter(d => {
    const diaryDate = new Date(d.updated_at);
    const today = new Date();
    return diaryDate.toDateString() === today.toDateString();
  }).length || 0;
  const moodTracked = user?.diaries?.filter(d => d.mood).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-garamond font-medium text-ink-blue mb-2">Your journal space</h2>
        <p className="text-muted-brown font-garamond italic text-sm">
          "A quiet place for your thoughts"
        </p>
      </div>

      <div className="ornamental-divider"></div>

      {/* Profile Card */}
      <Card className="vintage-card p-8 border-2 border-lunara-silver/20">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-2 border-lunara-silver/20 p-0.5 bg-cream">
              <Avatar className="w-full h-full">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-2xl font-garamond text-ink-blue bg-cream">
                  {name ? name.charAt(0).toUpperCase() : 'L'}
                </AvatarFallback>
              </Avatar>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              id="profile-image-upload"
              className="hidden"
              onChange={handleImageSelect}
              ref={fileInputRef}
            />
            <Button
              ref={cameraButtonRef}
              size="sm"
              className="absolute -bottom-1 -right-1 rounded-full w-9 h-9 bg-ink-blue hover:bg-deep-moon-navy"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
            {profileImage && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-1 -left-1 rounded-full w-9 h-9 border-2 border-lunara-silver/30 text-muted-brown hover:text-red-600 hover:border-red-300 bg-cream"
                onClick={() => {
                  setRemoveError('');
                  setRemoveDialogOpen(true);
                }}
                disabled={uploading}
                aria-label="Remove profile photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <ProfileImageCropDialog
            open={cropDialogOpen}
            onOpenChange={handleCropDialogClose}
            imageFile={selectedImageFile}
            onUpload={handleCropUpload}
          />

          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent className="vintage-card border-2 border-lunara-silver/20 bg-moon-paper max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-garamond text-xl text-ink-blue">
                  Remove profile photo?
                </DialogTitle>
                <DialogDescription className="font-garamond text-muted-brown italic">
                  Your journal will return to the default avatar.
                </DialogDescription>
              </DialogHeader>
              {removeError && (
                <p className="font-garamond text-sm text-red-600 italic">{removeError}</p>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setRemoveDialogOpen(false)}
                  disabled={removing}
                  className="border-2 border-lunara-silver/30 text-muted-brown hover:bg-lunara-silver/10 font-garamond"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemovePhoto}
                  disabled={removing}
                  className="bg-red-600 hover:bg-red-700 text-white font-garamond"
                >
                  {removing ? 'Removing...' : 'Remove photo'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-garamond bg-moon-paper/50 border-2 border-lunara-silver/30 focus:border-ink-blue"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-lg bg-moon-paper/50 border-2 border-lunara-silver/30 font-garamond text-muted-brown resize-none focus:border-ink-blue"
                  rows={3}
                  placeholder="A few words about yourself..."
                />
                <div className="flex gap-3 justify-center md:justify-start">
                  <Button onClick={handleSave} className="lunara-button text-cream font-garamond">
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-2 border-lunara-silver/30 text-muted-brown hover:bg-lunara-silver/10 font-garamond"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h3 className="text-2xl font-garamond font-medium text-ink-blue">{name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="text-muted-brown hover:text-ink-blue h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>

                {bio && (
                  <p className="text-sm font-garamond text-muted-brown italic leading-relaxed">
                    {bio}
                  </p>
                )}

                {/* Lunara User ID */}
                {user?.lunara_user_id && (
                  <div className="flex items-center gap-2 justify-center md:justify-start p-2 bg-moon-paper/50 border border-lunara-silver/15 rounded-lg">
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
                )}

                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-xs text-muted-brown">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-garamond">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-garamond">{user?.diaries?.length || 0} diaries</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="vintage-card p-5 border-2 border-lunara-silver/20 text-center">
          <Feather className="w-5 h-5 text-ink-blue mx-auto mb-2" />
          <div className="text-2xl font-garamond font-medium text-ink-blue">{user?.diaries?.length || 0}</div>
          <div className="text-xs font-garamond text-muted-brown">Private diaries</div>
        </Card>
        <Card className="vintage-card p-5 border-2 border-lunara-silver/20 text-center">
          <BookOpen className="w-5 h-5 text-ink-blue mx-auto mb-2" />
          <div className="text-2xl font-garamond font-medium text-ink-blue">{totalWords.toLocaleString()}</div>
          <div className="text-xs font-garamond text-muted-brown">Words written</div>
        </Card>
        <Card className="vintage-card p-5 border-2 border-lunara-silver/20 text-center">
          <Calendar className="w-5 h-5 text-ink-blue mx-auto mb-2" />
          <div className="text-2xl font-garamond font-medium text-ink-blue">{todayDiaries}</div>
          <div className="text-xs font-garamond text-muted-brown">Touched today</div>
        </Card>
        <Card className="vintage-card p-5 border-2 border-lunara-silver/20 text-center">
          <Clock className="w-5 h-5 text-ink-blue mx-auto mb-2" />
          <div className="text-2xl font-garamond font-medium text-ink-blue">{moodTracked}</div>
          <div className="text-xs font-garamond text-muted-brown">Moods tracked</div>
        </Card>
      </div>

      {/* Recent Activity */}
      {user?.diaries && user.diaries.length > 0 && (
        <Card className="vintage-card p-6 border-2 border-lunara-silver/20">
          <h3 className="text-lg font-garamond font-medium text-ink-blue mb-4">Recent diaries</h3>
          <div className="space-y-3">
            {user.diaries.slice(0, 5).map((diary) => (
              <div
                key={diary.id}
                className="flex items-center justify-between p-3 bg-moon-paper/40 rounded-lg border border-lunara-silver/10 hover:bg-moon-paper/60 transition-colors cursor-pointer"
                onClick={() => {
                  window.location.href = `/profile?tab=write&diaryId=${diary.id}`;
                }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-garamond font-medium text-ink-blue text-sm truncate">
                    {diary.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-muted-brown font-garamond">
                    {new Date(diary.updated_at).toLocaleDateString()}
                    {diary.mood && <span className="ml-2">· {diary.mood}</span>}
                  </p>
                </div>
                <div className="text-xs text-muted-brown font-garamond ml-4 whitespace-nowrap">
                  {diary.content?.split(/\s+/).length || 0} words
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JournalOverview;
