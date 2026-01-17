'use client';

import { useState } from 'react';
import { PondConfig } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [pads, setPads] = useState(4);
  const [koiCount, setKoiCount] = useState(2);
  const [frogCount, setFrogCount] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [dedication, setDedication] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  const generateShareLink = async () => {
    setIsGenerating(true);
    setError('');
    setShareUrl('');

    try {
      const config: PondConfig = {
        pads,
        timeOfDay,
        koi: koiCount > 0,
        frogs: frogCount > 0,
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

  const adjustPads = (delta: number) => {
    setPads(Math.max(0, Math.min(11, pads + delta)));
  };

  const adjustKoi = (delta: number) => {
    setKoiCount(Math.max(0, Math.min(6, koiCount + delta)));
  };

  const adjustFrogs = (delta: number) => {
    setFrogCount(Math.max(0, Math.min(6, frogCount + delta)));
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Send a Lily Pond</h1>
          <p className={styles.subtitle}>Customize your lily pond</p>
        </div>

        <div className={styles.editor}>
          {/* Lily Pads Control */}
          <div className={styles.control}>
            <div className={styles.controlHeader}>
              <span className={styles.controlLabel}>i. Add lily pads</span>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustPads(-1)}
                  disabled={pads === 0}
                >
                  -
                </button>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustPads(1)}
                  disabled={pads === 11}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.previewRow}>
              {Array.from({ length: pads }).map((_, i) => (
                <img
                  key={i}
                  src="/images/lilypads/lilypad.png"
                  alt="Lily pad"
                  className={styles.previewItem}
                />
              ))}
            </div>
          </div>

          {/* Kois Control */}
          <div className={styles.control}>
            <div className={styles.controlHeader}>
              <span className={styles.controlLabel}>ii. Add Kois</span>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustKoi(-1)}
                  disabled={koiCount === 0}
                >
                  -
                </button>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustKoi(1)}
                  disabled={koiCount === 6}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.previewRow}>
              {Array.from({ length: koiCount }).map((_, i) => (
                <img
                  key={i}
                  src={`/images/kois/koi-${(i % 6) + 1}.png`}
                  alt={`Koi ${i + 1}`}
                  className={styles.previewItem}
                />
              ))}
            </div>
          </div>

          {/* Frogs Control */}
          <div className={styles.control}>
            <div className={styles.controlHeader}>
              <span className={styles.controlLabel}>iii. Add Frogs</span>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustFrogs(-1)}
                  disabled={frogCount === 0}
                >
                  -
                </button>
                <button
                  className={styles.adjustButton}
                  onClick={() => adjustFrogs(1)}
                  disabled={frogCount === 6}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.previewRow}>
              {Array.from({ length: frogCount }).map((_, i) => (
                <img
                  key={i}
                  src={`/images/frogs/frog-${(i % 6) + 1}.png`}
                  alt={`Frog ${i + 1}`}
                  className={styles.previewItem}
                />
              ))}
            </div>
          </div>

          {/* Message Control */}
          <div className={styles.control}>
            <label htmlFor="dedication" className={styles.controlLabel}>
              iv. Add a message
            </label>
            <input
              id="dedication"
              type="text"
              maxLength={80}
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              placeholder="Type your message here..."
              className={styles.messageInput}
            />
          </div>

          <button
            onClick={generateShareLink}
            disabled={isGenerating}
            className={styles.generateButton}
          >
            {isGenerating ? 'Creating...' : 'Create my pond!'}
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
          Made by ebubbletea.crypto
        </footer>
      </main>
    </div>
  );
}
