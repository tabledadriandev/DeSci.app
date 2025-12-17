'use client';

interface BoxLoaderProps {
  size?: number;
  className?: string;
}

export default function BoxLoader({ size = 32, className = '' }: BoxLoaderProps) {
  return (
    <div
      className={`boxes ${className}`}
      style={
        {
          '--size': `${size}px`,
          '--duration': '800ms',
        } as React.CSSProperties
      }
    >
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="box">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

