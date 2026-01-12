'use client';

import { useState } from 'react';
import { PondConfig } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [pads, setPads] = useState(15);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [koi, setKoi] = useState(true);
  const [frogs, setFrogs] = useState(true);
  const [dedication, setDedication] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  // Get background colors based on time of day
  const getBackgroundStyle = () => {
    const backgrounds = {
      dawn: 'linear-gradient(to bottom, #FFA07A, #FFE4B5)',
      day: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)',
      dusk: 'linear-gradient(to bottom, #FF6B6B, #FFA500)',
      night: 'linear-gradient(to bottom, #191970, #000033)',
    };
    return backgrounds[timeOfDay];
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    setError('');
    setShareUrl('');

    try {
      const config: PondConfig = {
        pads,
        timeOfDay,
        koi,
        frogs,
        dedication: dedication.substring(0, 80),
        seed: Math.random().toString(36).substring(2, 15),
      };

      const response = await fetch('/api/pond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pond');
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.url}`;
      setShareUrl(fullUrl);
    } catch (err) {
      console.error('Error generating pond:', err);
      setError('Failed to generate pond. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.container} style={{ background: getBackgroundStyle() }}>
      <main className={styles.main}>
        <h1 className={styles.title}>Lilypad Pond</h1>
        <p className={styles.description}>Make a tiny pond scene and share it.</p>

        <div className={styles.editor}>
          <div className={styles.control}>
            <label htmlFor="pads">
              Number of lily pads: <strong>{pads}</strong>
            </label>
            <input
              id="pads"
              type="range"
              min="1"
              max="30"
              value={pads}
              onChange={(e) => setPads(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.control}>
            <label htmlFor="timeOfDay">Time of day:</label>
            <select
              id="timeOfDay"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              className={styles.select}
            >
              <option value="dawn">Dawn</option>
              <option value="day">Day</option>
              <option value="dusk">Dusk</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className={styles.control}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={koi}
                onChange={(e) => setKoi(e.target.checked)}
              />
              <span>Show koi</span>
            </label>
          </div>

          <div className={styles.control}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={frogs}
                onChange={(e) => setFrogs(e.target.checked)}
              />
              <span>Show frogs</span>
            </label>
          </div>

          <div className={styles.control}>
            <label htmlFor="dedication">Dedication (optional, max 80 chars):</label>
            <input
              id="dedication"
              type="text"
              maxLength={80}
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              placeholder="For someone special..."
              className={styles.textInput}
            />
            <small className={styles.charCount}>{dedication.length}/80</small>
          </div>

          <button
            onClick={generateShareLink}
            disabled={isGenerating}
            className={styles.generateButton}
          >
            {isGenerating ? 'Generating...' : 'Generate Share Link'}
          </button>

          {error && <div className={styles.error}>{error}</div>}

          {shareUrl && (
            <div className={styles.shareBox}>
              <p className={styles.shareLabel}>Your pond is ready!</p>
              <div className={styles.shareUrlContainer}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={styles.shareUrl}
                  onClick={(e) => e.currentTarget.select()}
                />
                <button onClick={copyToClipboard} className={styles.copyButton}>
                  Copy
                </button>
              </div>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                View your pond →
              </a>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <p>
            Made with <a href="https://twitter.com/bubbleteacrypto" target="_blank" rel="noopener noreferrer">@bubbleteacrypto</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
