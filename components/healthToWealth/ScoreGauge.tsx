'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ScoreGaugeProps {
  score: number; // 300-850
  maxScore?: number;
  percentile: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export function ScoreGauge({
  score,
  maxScore = 850,
  percentile,
  status,
}: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 280;
    canvas.height = 200;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background arc (300-850 range)
    const minAngle = Math.PI + Math.PI / 3; // 240°
    const maxAngle = -Math.PI / 3; // 60° (right side)

    // Draw arc segments with colors
    const arcSegments = [
      {
        start: minAngle,
        end: minAngle + (Math.PI * 1.33 * 0.2),
        color: '#dc2626',
      }, // 300-387.5 (Poor)
      {
        start: minAngle + (Math.PI * 1.33 * 0.2),
        end: minAngle + (Math.PI * 1.33 * 0.4),
        color: '#f59e0b',
      }, // 387.5-475 (Fair)
      {
        start: minAngle + (Math.PI * 1.33 * 0.4),
        end: minAngle + (Math.PI * 1.33 * 0.7),
        color: '#0ea5e9',
      }, // 475-662.5 (Good)
      {
        start: minAngle + (Math.PI * 1.33 * 0.7),
        end: maxAngle,
        color: '#22c55e',
      }, // 662.5-850 (Excellent)
    ];

    // Draw each arc segment
    arcSegments.forEach((segment) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, segment.start, segment.end, false);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Draw needle pointer
    const scoreRatio = (score - 300) / (maxScore - 300);
    const needleAngle = minAngle + scoreRatio * Math.PI * 1.33;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * radius,
      centerY + Math.sin(needleAngle) * radius
    );
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Draw score text
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}`, centerX, centerY + 40);

    // Draw percentile text below
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Better than ${percentile}% of peers`, centerX, centerY + 65);
  }, [score, percentile, maxScore]);

  return (
    <div className="flex flex-col items-center gap-4" role="img" aria-label={`Health-to-Wealth Score: ${score}, ${status} status, ${percentile}th percentile`}>
      <canvas
        ref={canvasRef}
        width={280}
        height={200}
        className="w-full max-w-md"
        aria-hidden="true"
      />
      <div
        className={cn(
          'text-center p-4 rounded-lg',
          status === 'excellent'
            ? 'bg-green-50'
            : status === 'good'
            ? 'bg-blue-50'
            : status === 'fair'
            ? 'bg-yellow-50'
            : 'bg-red-50'
        )}
      >
        <p
          className={cn(
            'text-sm font-semibold',
            status === 'excellent'
              ? 'text-green-700'
              : status === 'good'
              ? 'text-blue-700'
              : status === 'fair'
              ? 'text-yellow-700'
              : 'text-red-700'
          )}
        >
          {status === 'excellent'
            ? '✓ Excellent Health-Wealth Alignment'
            : status === 'good'
            ? '↗ Good Trajectory'
            : status === 'fair'
            ? '→ Fair - Room for Improvement'
            : '⚠ Alert - Prioritize Interventions'}
        </p>
      </div>
    </div>
  );
}

