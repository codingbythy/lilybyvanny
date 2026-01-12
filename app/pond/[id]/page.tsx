'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PondCanvas from '@/components/PondCanvas';
import { PondConfig } from '@/lib/types';
import styles from './page.module.css';

export default function PondPage() {
  const params = useParams();
  const id = params.id as string;
  const [config, setConfig] = useState<PondConfig | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPond = async () => {
      try {
        const response = await fetch(`/api/pond?id=${id}`);

        if (!response.ok) {
          throw new Error('Pond not found');
        }

        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching pond:', err);
        setError('Pond not found. It may have expired or the link is invalid.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPond();
    }
  }, [id]);

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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your pond...</div>
      </div>
    );
  }

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
