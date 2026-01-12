'use client';

import { useEffect, useRef } from 'react';
import { PondConfig } from '@/lib/types';
import { PondRenderer } from '@/lib/canvas/PondRenderer';

interface PondCanvasProps {
  config: PondConfig;
}

export default function PondCanvas({ config }: PondCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PondRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create renderer
    const renderer = new PondRenderer(canvasRef.current, config);
    rendererRef.current = renderer;

    // Start animation
    renderer.start();

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, [config]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    rendererRef.current.handleClick(x, y);
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!rendererRef.current || !canvasRef.current || e.touches.length === 0) return;

    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    rendererRef.current.handleClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onTouchStart={handleTouch}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'pointer',
        touchAction: 'none',
      }}
    />
  );
}
