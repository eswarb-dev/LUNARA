import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle,
  Plus, X, Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { audioCacheService } from '@/services/audioCacheService';
import type { AudioCacheStatus } from '@/services/audioCacheService';
import { defaultAudioService } from '@/services/defaultAudioService';
import { userAudioService } from '@/services/userAudioService';
import type { LunaraPlayableTrack } from '@/types/database';

const MAX_USER_TRACKS = 10;
const ACCEPTED_AUDIO_TYPES = 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm';
const MAX_FILE_SIZE_MB = 50;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCacheStatusLabel(status: AudioCacheStatus | undefined): string {
  switch (status) {
    case 'cached':
      return 'Cached';
    case 'streaming':
      return 'Streaming';
    case 'caching':
      return 'Caching...';
    case 'failed':
      return 'Cache failed';
    default:
      return 'Not cached';
  }
}

function loadNumber(key: string, fallback: number, min: number, max: number): number {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

function loadBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

export default function LunaraAmbientPlayer() {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedTrackIdRef = useRef<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const cacheStartedRef = useRef<Set<string>>(new Set());
  const playingRef = useRef(false);

  const [defaultTracks, setDefaultTracks] = useState<LunaraPlayableTrack[]>([]);
  const [userTracks, setUserTracks] = useState<LunaraPlayableTrack[]>([]);
  const [allTracks, setAllTracks] = useState<LunaraPlayableTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(() =>
    loadNumber('lunaraAmbientTrackIndex', 0, 0, 999)
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() =>
    loadNumber('lunaraAmbientVolume', 0.25, 0, 1)
  );
  const [loop, setLoop] = useState(() => loadBool('lunaraAmbientLoop', false));
  const [shuffle, setShuffle] = useState(() => loadBool('lunaraAmbientShuffle', false));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadMood, setUploadMood] = useState('');
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [signingUrls, setSigningUrls] = useState(false);
  const [cacheStatuses, setCacheStatuses] = useState<Record<string, AudioCacheStatus>>({});

  const track = allTracks[trackIndex] ?? allTracks[0] ?? null;

  useEffect(() => {
    if (track?.id) selectedTrackIdRef.current = track.id;
  }, [track?.id]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    localStorage.setItem('lunaraAmbientTrackIndex', String(trackIndex));
  }, [trackIndex]);

  useEffect(() => {
    localStorage.setItem('lunaraAmbientVolume', String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('lunaraAmbientLoop', String(loop));
  }, [loop]);

  useEffect(() => {
    localStorage.setItem('lunaraAmbientShuffle', String(shuffle));
  }, [shuffle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  const loadDefaultTracks = useCallback(async () => {
    setLoadingTracks(true);
    const tracks = await defaultAudioService.listDefaultAudioTracks();
    setDefaultTracks(tracks);
    if (tracks.length === 0) {
      setLoadError('The Lunara playlist is not available yet.');
    }
    setLoadingTracks(false);
  }, []);

  const loadUserTracks = useCallback(async () => {
    if (!user?.id) {
      setUserTracks([]);
      return;
    }

    try {
      setSigningUrls(true);
      const tracks = await userAudioService.listTracks(user.id);
      const withSignedUrls = await Promise.all(
        tracks.map(async (t) => ({
          id: t.id,
          title: t.title,
          moodLabel: t.mood,
          src: await userAudioService.getSignedUrl(t.storage_path),
          source: 'user' as const,
        }))
      );
      setUserTracks(withSignedUrls);
    } catch {
      setUserTracks([]);
      setLoadError('Your songs could not be loaded right now.');
    } finally {
      setSigningUrls(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDefaultTracks();
  }, [loadDefaultTracks]);

  useEffect(() => {
    loadUserTracks();
  }, [loadUserTracks]);

  useEffect(() => {
    const tracks = [...defaultTracks, ...userTracks];
    setAllTracks(tracks);
    setTrackIndex((prev) => {
      const selectedTrackId = selectedTrackIdRef.current;
      if (selectedTrackId) {
        const nextIndex = tracks.findIndex((candidate) => candidate.id === selectedTrackId);
        if (nextIndex >= 0) return nextIndex;
      }
      if (tracks.length === 0) return 0;
      return Math.min(Math.max(prev, 0), tracks.length - 1);
    });
  }, [defaultTracks, userTracks]);

  useEffect(() => {
    if (allTracks.length === 0) return;
    setTrackIndex((prev) => Math.min(Math.max(prev, 0), allTracks.length - 1));
  }, [allTracks.length]);

  const refreshCacheInfo = useCallback(async () => {
    const cacheInfo = await audioCacheService.getAudioCacheInfo();
    const cachedTrackIds = new Set(cacheInfo.map((item) => item.trackId));
    setCacheStatuses((prev) => {
      const next: Record<string, AudioCacheStatus> = {};
      for (const candidate of allTracks) {
        const existing = prev[candidate.id];
        if (existing === 'caching' || existing === 'failed') {
          next[candidate.id] = existing;
        } else {
          next[candidate.id] = cachedTrackIds.has(candidate.id) ? 'cached' : 'not-cached';
        }
      }
      return next;
    });
  }, [allTracks]);

  useEffect(() => {
    refreshCacheInfo();
  }, [refreshCacheInfo]);

  const revokeActiveObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const cacheTrack = useCallback(async (targetTrack: LunaraPlayableTrack, manual = false) => {
    const status = cacheStatuses[targetTrack.id];
    if (!manual && (status === 'cached' || status === 'caching' || cacheStartedRef.current.has(targetTrack.id))) {
      return;
    }

    cacheStartedRef.current.add(targetTrack.id);
    setCacheStatuses((prev) => ({ ...prev, [targetTrack.id]: 'caching' }));

    try {
      await audioCacheService.cacheAudioTrack({
        trackId: targetTrack.id,
        source: targetTrack.source,
        title: targetTrack.title,
        moodLabel: targetTrack.moodLabel,
        url: targetTrack.src,
        contentType: 'audio/mpeg',
      });
      setCacheStatuses((prev) => ({ ...prev, [targetTrack.id]: 'cached' }));
      if (targetTrack.id === track?.id) {
        setLoadError('Cached for this browser.');
      }
    } catch (error) {
      cacheStartedRef.current.delete(targetTrack.id);
      setCacheStatuses((prev) => ({ ...prev, [targetTrack.id]: 'failed' }));
      if (audioCacheService.isQuotaError(error)) {
        setLoadError('Cache limit reached. Clear cached songs to save this track offline.');
      } else if (manual || targetTrack.id === track?.id) {
        setLoadError('Could not cache this track on this browser.');
      }
    }
  }, [cacheStatuses, track?.id]);

  const removeCachedTrack = useCallback(async (trackId: string) => {
    await audioCacheService.deleteCachedAudio(trackId);
    cacheStartedRef.current.delete(trackId);
    setCacheStatuses((prev) => ({ ...prev, [trackId]: 'not-cached' }));
    if (track?.id === trackId) {
      const audio = audioRef.current;
      revokeActiveObjectUrl();
      if (audio) {
        audio.src = track.src;
        audio.load();
      }
      setLoadError('Streaming from Supabase.');
    }
  }, [revokeActiveObjectUrl, track]);

  const clearCachedTracks = useCallback(async () => {
    await audioCacheService.clearAudioCache();
    cacheStartedRef.current.clear();
    setCacheStatuses((prev) => {
      const next: Record<string, AudioCacheStatus> = {};
      for (const candidate of allTracks) next[candidate.id] = 'not-cached';
      return next;
    });
    if (track) {
      const audio = audioRef.current;
      revokeActiveObjectUrl();
      if (audio) {
        audio.src = track.src;
        audio.load();
      }
    }
    setLoadError('Cached songs cleared. Streaming is available.');
  }, [allTracks, revokeActiveObjectUrl, track]);

  const playSafe = useCallback(async (audio: HTMLAudioElement) => {
    try {
      audio.volume = volume;
      await audio.play();
      setPlaying(true);
      setLoadError(null);
    } catch {
      setPlaying(false);
      setLoadError('Tap play again to begin the moonlit track.');
    }
  }, [volume]);

  const handleNext = useCallback(() => {
    if (allTracks.length === 0) return;
    if (shuffle) {
      let next = trackIndex;
      while (next === trackIndex && allTracks.length > 1) {
        next = Math.floor(Math.random() * allTracks.length);
      }
      setTrackIndex(next);
    } else {
      setTrackIndex((prev) => (prev + 1) % allTracks.length);
    }
  }, [trackIndex, shuffle, allTracks.length]);

  const handlePrev = useCallback(() => {
    if (allTracks.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setTrackIndex((prev) => (prev - 1 + allTracks.length) % allTracks.length);
  }, [allTracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      if (cacheStatuses[track.id] !== 'cached') {
        cacheTrack(track);
      }
    };
    const onError = async () => {
      const failedObjectUrl = objectUrlRef.current;
      setLoadError('This moonlit track could not be found.');
      setPlaying(false);
      if (failedObjectUrl && audio.src === failedObjectUrl) {
        await removeCachedTrack(track.id);
        setLoadError('Cached copy was refreshed. Streaming from Supabase.');
        cacheTrack(track);
      }
    };
    const onEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        playSafe(audio);
      } else if (shuffle) {
        let next = trackIndex;
        while (next === trackIndex && allTracks.length > 1) {
          next = Math.floor(Math.random() * allTracks.length);
        }
        setTrackIndex(next);
      } else {
        setTrackIndex((prev) => (prev + 1) % allTracks.length);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [track, trackIndex, loop, shuffle, playSafe, allTracks.length, cacheStatuses, cacheTrack, removeCachedTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    let cancelled = false;

    const loadTrackSource = async () => {
      const cachedObjectUrl = await audioCacheService.createCachedObjectUrl(track.id);
      if (cancelled) {
        if (cachedObjectUrl) URL.revokeObjectURL(cachedObjectUrl);
        return;
      }

      revokeActiveObjectUrl();
      const nextSrc = cachedObjectUrl || track.src;
      objectUrlRef.current = cachedObjectUrl;
      setCacheStatuses((prev) => ({
        ...prev,
        [track.id]: cachedObjectUrl ? 'cached' : (prev[track.id] === 'caching' ? 'caching' : 'streaming'),
      }));

      audio.src = nextSrc;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setLoadError(null);

      if (playingRef.current) {
        playSafe(audio);
      }
    };

    loadTrackSource();

    return () => {
      cancelled = true;
    };
  }, [track, playSafe, revokeActiveObjectUrl]);

  useEffect(() => () => {
    revokeActiveObjectUrl();
  }, [revokeActiveObjectUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      cacheTrack(track);
      await playSafe(audio);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleExpand = () => setExpanded((prev) => !prev);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (!nextFocused || !playerRef.current?.contains(nextFocused)) {
      setExpanded(false);
      setShowLibrary(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setLoadError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const title = uploadTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
    const mood = uploadMood.trim() || 'My audio';

    setUploading(true);
    setLoadError(null);

    try {
      const audioEl = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audioEl.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        audioEl.onloadedmetadata = () => resolve();
        audioEl.onerror = () => reject(new Error('Could not read audio file'));
      });

      const durationSec = Math.round(audioEl.duration);
      URL.revokeObjectURL(objectUrl);

      await userAudioService.uploadTrack(user.id, file, title, mood, durationSec);
      setUploadTitle('');
      setUploadMood('');
      await loadUserTracks();
    } catch {
      setLoadError('Could not upload this track. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    const selectedTrack = allTracks.find((t) => t.id === trackId);
    if (!user?.id || selectedTrack?.source !== 'user') return;

    try {
      const allUserTracks = await userAudioService.listTracks(user.id);
      const target = allUserTracks.find((t) => t.id === trackId);
      if (target) {
        await userAudioService.deleteTrack(trackId, target.storage_path);
        await audioCacheService.deleteCachedAudio(trackId);
        cacheStartedRef.current.delete(trackId);

        const wasPlaying = playing;
        if (wasPlaying) {
          audioRef.current?.pause();
          setPlaying(false);
        }

        await loadUserTracks();

        if (trackIndex >= allTracks.length - 1) {
          setTrackIndex(0);
        }
      }
    } catch {
      setLoadError('Could not delete this track.');
    }
  };

  const userTrackCount = userTracks.length;

  return (
    <div
      ref={playerRef}
      className={`lunara-mood-player ${expanded ? 'lunara-mood-player-expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={handleBlur}
    >
      <audio ref={audioRef} preload="metadata" />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AUDIO_TYPES}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Top row: orb + info + play controls */}
      <div className="lunara-mood-player-top">
        {/* Music orb / disc */}
        <button
          type="button"
          className="lunara-music-orb"
          onClick={handleExpand}
          aria-label={expanded ? 'Collapse player' : 'Expand player'}
        >
          <div className={`lunara-music-orb-disc ${playing ? 'is-playing' : ''}`}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="rgba(11,16,32,0.9)" />
              <circle cx="12" cy="11" r="0.7" fill="rgba(253,230,138,0.6)" />
              <circle cx="28" cy="9" r="0.5" fill="rgba(253,230,138,0.4)" />
              <circle cx="16" cy="28" r="0.6" fill="rgba(253,230,138,0.5)" />
              <circle cx="30" cy="25" r="0.4" fill="rgba(253,230,138,0.3)" />
              <path
                d="M22 10c-4.4 0-8 3.6-8 8s3.6 8 8 8c2.2 0 4.2-.9 5.6-2.3-1.2.5-2.5.8-3.8.8-4.4 0-8-3.6-8-8s3.6-8 8-8c1.3 0 2.6.3 3.8.8C26.2 10.9 24.2 10 22 10z"
                fill="rgba(253,230,138,0.7)"
              />
              <path
                d="M4 32c3-3 7-4 10-3s6 3 10 2 6-3 10-4v10H4z"
                fill="rgba(18,26,46,0.8)"
              />
              <path d="M10 28l2-4 2 4z" fill="rgba(168,166,199,0.25)" />
              <path d="M26 27l1.5-3 1.5 3z" fill="rgba(168,166,199,0.2)" />
            </svg>
          </div>
          <div className="lunara-music-orb-pin" />
        </button>

        {/* Track info */}
        <div className="lunara-mood-player-info">
          <span className="lunara-mood-track-title">{track?.title ?? 'Lunara playlist'}</span>
          <span className="lunara-mood-track-mood">{track?.moodLabel ?? 'Waiting for moonlit audio'}</span>
        </div>

        {/* Controls */}
        <div className="lunara-mood-controls">
          <button
            type="button"
            className="lunara-mood-btn"
            onClick={handlePrev}
            aria-label="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="lunara-mood-btn lunara-mood-btn-play"
            onClick={togglePlay}
            disabled={!track}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            className="lunara-mood-btn"
            onClick={handleNext}
            aria-label="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded section */}
      <div className={`lunara-mood-player-body ${expanded ? 'is-visible' : ''}`}>
        {/* Error message */}
        {loadError && (
          <p className="lunara-mood-error">{loadError}</p>
        )}

        {/* Progress */}
        <div className="lunara-mood-progress-row">
          <span className="lunara-mood-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="lunara-track-progress"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek position"
          />
          <span className="lunara-mood-time">{formatTime(duration)}</span>
        </div>

        {/* Volume + toggles */}
        <div className="lunara-mood-bottom-row">
          <label className="lunara-mood-volume">
            <button
              type="button"
              className="lunara-mood-btn lunara-mood-volume-btn"
              onClick={() => setVolume((v) => (v > 0 ? 0 : 0.25))}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              className="lunara-volume-slider"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </label>

          <div className="lunara-mood-toggles">
            <button
              type="button"
              className={`lunara-mood-btn lunara-mood-toggle ${loop ? 'is-active' : ''}`}
              onClick={() => setLoop((v) => !v)}
              aria-label={loop ? 'Disable loop' : 'Enable loop'}
              aria-pressed={loop}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`lunara-mood-btn lunara-mood-toggle ${shuffle ? 'is-active' : ''}`}
              onClick={() => setShuffle((v) => !v)}
              aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
              aria-pressed={shuffle}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Library toggle */}
        <button
          type="button"
          className="lunara-mood-library-toggle"
          onClick={() => setShowLibrary((v) => !v)}
          aria-label={showLibrary ? 'Hide library' : 'Show library'}
        >
          <span>Lunara playlist</span>
          <span>Your songs ({userTrackCount})</span>
          {signingUrls && <span className="lunara-mood-library-loading">Loading...</span>}
          {loadingTracks && <span className="lunara-mood-library-loading">Loading...</span>}
        </button>

        {/* Library panel */}
        {showLibrary && (
          <div className="lunara-mood-library">
            {/* Track list */}
            <div className="lunara-mood-library-list">
              {allTracks.map((t, i) => (
                <div
                  key={t.id}
                  className={`lunara-mood-library-item ${i === trackIndex ? 'is-active' : ''}`}
                >
                  <button
                    type="button"
                    className="lunara-mood-library-item-play"
                    onClick={() => setTrackIndex(i)}
                    aria-label={`Play ${t.title}`}
                  >
                    {i === trackIndex && playing ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </button>
                  <div className="lunara-mood-library-item-info">
                    <span className="lunara-mood-library-item-title">{t.title}</span>
                    <span className="lunara-mood-library-item-mood">
                      {t.moodLabel} · {t.source === 'default' ? 'Lunara' : 'Private'}
                    </span>
                    <span className="lunara-mood-cache-status">
                      {getCacheStatusLabel(cacheStatuses[t.id])}
                    </span>
                  </div>
                  {cacheStatuses[t.id] === 'cached' ? (
                    <button
                      type="button"
                      className="lunara-mood-library-item-cache"
                      onClick={() => removeCachedTrack(t.id)}
                      aria-label={`Remove cached copy of ${t.title}`}
                    >
                      Remove cache
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="lunara-mood-library-item-cache"
                      onClick={() => cacheTrack(t, true)}
                      disabled={cacheStatuses[t.id] === 'caching'}
                      aria-label={`Cache ${t.title}`}
                    >
                      {cacheStatuses[t.id] === 'caching' ? 'Caching...' : 'Cache song'}
                    </button>
                  )}
                  {t.source === 'user' && (
                    <button
                      type="button"
                      className="lunara-mood-library-item-delete"
                      onClick={() => handleDeleteTrack(t.id)}
                      aria-label={`Delete ${t.title}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="lunara-mood-clear-cache"
              onClick={clearCachedTracks}
            >
              <Check className="w-3 h-3" />
              <span>Clear cached songs</span>
            </button>

            {/* Upload section */}
            {userTrackCount < MAX_USER_TRACKS && (
              <div className="lunara-mood-library-upload">
                <input
                  type="text"
                  className="lunara-mood-upload-input"
                  placeholder="Track title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploading}
                />
                <input
                  type="text"
                  className="lunara-mood-upload-input"
                  placeholder="Mood (e.g. Calm, Focus)"
                  value={uploadMood}
                  onChange={(e) => setUploadMood(e.target.value)}
                  disabled={uploading}
                />
                <button
                  type="button"
                  className="lunara-mood-btn lunara-mood-upload-btn"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  aria-label="Upload audio file"
                >
                  {uploading ? (
                    <span className="lunara-mood-upload-spinner" />
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add track</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {userTrackCount >= MAX_USER_TRACKS && (
              <p className="lunara-mood-library-limit">
                Maximum {MAX_USER_TRACKS} uploaded tracks.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
