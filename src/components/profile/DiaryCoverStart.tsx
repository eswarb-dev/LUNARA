import React, { useState, useRef, useEffect } from 'react';
import { diaryService } from '../../services/diaryService';
import { useAuth } from '../../context/AuthContext';

interface DiaryCoverStartProps {
  onComplete: (diaryId: string, title: string, description: string) => void;
}

const DiaryCoverStart: React.FC<DiaryCoverStartProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [diaryName, setDiaryName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleOpenDiary = async () => {
    const trimmedName = diaryName.trim();
    if (!trimmedName) {
      setError('Give this diary a name before opening it.');
      nameInputRef.current?.focus();
      return;
    }

    if (!user) return;

    setError('');
    setIsOpening(true);

    try {
      const diary = await diaryService.createDiaryShell(
        trimmedName,
        description.trim() || null,
        user.id
      );

      setTimeout(() => {
        onComplete(diary.id, trimmedName, description.trim());
      }, 800);
    } catch (err) {
      console.error('Failed to create diary:', err);
      setError('Something went wrong. Please try again.');
      setIsOpening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleOpenDiary();
    }
  };

  return (
    <div className={`diary-cover-fade ${isVisible ? 'diary-cover-visible' : ''} ${isOpening ? 'diary-cover-opening' : ''}`}>
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="diary-cover-shell">
          {/* Floral corner decorations */}
          <div className="diary-cover-florals">
            <div className="diary-cover-floral diary-cover-floral-tl">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="rgba(168,166,199,0.35)"/>
                <circle cx="25" cy="6" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <circle cx="6" cy="25" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <line x1="12" y1="12" x2="25" y2="6" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
                <line x1="12" y1="12" x2="6" y2="25" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
                <circle cx="35" cy="3" r="1" fill="rgba(168,166,199,0.15)"/>
                <line x1="25" y1="6" x2="35" y2="3" stroke="rgba(168,166,199,0.1)" strokeWidth="0.4"/>
              </svg>
            </div>
            <div className="diary-cover-floral diary-cover-floral-tr">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="rgba(168,166,199,0.35)"/>
                <circle cx="25" cy="6" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <circle cx="6" cy="25" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <line x1="12" y1="12" x2="25" y2="6" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
                <line x1="12" y1="12" x2="6" y2="25" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="diary-cover-floral diary-cover-floral-bl">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="rgba(168,166,199,0.35)"/>
                <circle cx="6" cy="25" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <line x1="12" y1="12" x2="6" y2="25" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="diary-cover-floral diary-cover-floral-br">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="2" fill="rgba(168,166,199,0.35)"/>
                <circle cx="25" cy="6" r="1.5" fill="rgba(168,166,199,0.25)"/>
                <line x1="12" y1="12" x2="25" y2="6" stroke="rgba(168,166,199,0.15)" strokeWidth="0.5"/>
              </svg>
            </div>
          </div>

          {/* Moon glow */}
          <div className="diary-cover-glow"></div>

          {/* Cover content */}
          <div className="diary-cover-inner">
            {/* Brand name */}
            <div className="diary-cover-brand">
              <h1 className="diary-cover-title">Lunara</h1>
              <p className="diary-cover-subtitle">Moonlit Emotional Journal</p>
            </div>

            {/* Ornamental divider */}
            <div className="diary-cover-divider">
              <div className="h-px bg-gradient-to-r from-transparent via-muted-brown/30 to-transparent w-32 mx-auto"></div>
              <span className="diary-cover-ornament">☽</span>
              <div className="h-px bg-gradient-to-r from-transparent via-muted-brown/30 to-transparent w-32 mx-auto"></div>
            </div>

            {/* Tagline */}
            <p className="diary-cover-tagline">Reflect softly. Heal privately.</p>

            {/* Form fields */}
            <div className="diary-cover-form">
              <div className="diary-cover-field">
                <label htmlFor="diary-name" className="diary-cover-label">
                  Name this diary
                </label>
                <input
                  ref={nameInputRef}
                  id="diary-name"
                  type="text"
                  value={diaryName}
                  onChange={(e) => {
                    setDiaryName(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Name this diary…"
                  maxLength={80}
                  className="diary-cover-input"
                  disabled={isOpening}
                  aria-describedby={error ? 'diary-name-error' : undefined}
                />
                {error && (
                  <p id="diary-name-error" className="diary-cover-error" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <div className="diary-cover-field">
                <label htmlFor="diary-description" className="diary-cover-label">
                  What will this diary hold?
                  <span className="diary-cover-optional">(optional)</span>
                </label>
                <textarea
                  id="diary-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this diary hold?"
                  maxLength={240}
                  rows={2}
                  className="diary-cover-textarea"
                  disabled={isOpening}
                />
              </div>
            </div>

            {/* Open button */}
            <button
              onClick={handleOpenDiary}
              disabled={isOpening}
              className="diary-cover-button"
            >
              {isOpening ? (
                <span className="diary-cover-button-opening">Opening your diary…</span>
              ) : (
                'Open diary'
              )}
            </button>

            {/* Privacy note */}
            <p className="diary-cover-privacy">
              Your words stay private unless you choose to share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryCoverStart;
