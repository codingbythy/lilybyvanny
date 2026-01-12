'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PondCanvas from '@/components/PondCanvas';
import { PondConfig } from '@/lib/types';
import { decodePondConfig } from '@/lib/encoding';
import styles from '../[id]/page.module.css';

function EncodedPondContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const [config, setConfig] = useState<PondConfig | null>(null);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!data) {
      setError('No pond data provided.');
      return;
    }

    try {
      const decoded = decodePondConfig(data);
      if (decoded) {
        setConfig(decoded);
      } else {
        setError('Invalid pond data.');
      }
    } catch (err) {
      console.error('Error decoding pond:', err);
      setError('Failed to decode pond data.');
    }
  }, [data]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  };

  if (error || !config) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Oops!</h2>
          <p>{error || 'Something went wrong.'}</p>
          <a href="/" className={styles.homeLink}>
            Create your own pond →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <PondCanvas config={config} />
      </div>

      <div className={styles.controls}>
        <a href="/" className={styles.branding}>
          Made with @bubbleteacrypto
        </a>
        <button onClick={copyLink} className={styles.copyButton}>
          {copySuccess ? '✓ Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}

export default function EncodedPondPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Loading your pond...</div>
      </div>
    }>
      <EncodedPondContent />
    </Suspense>
  );
}
