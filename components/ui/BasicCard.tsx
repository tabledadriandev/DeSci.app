'use client';

import { ReactNode } from 'react';

interface BasicCardProps {
  children: ReactNode;
  className?: string;
  width?: string;
  height?: string;
}

export default function BasicCard({ 
  children, 
  className = '',
  width = 'w-48',
  height = 'h-64'
}: BasicCardProps) {
  return (
    <div
      className={`relative drop-shadow-xl ${width} ${height} overflow-hidden rounded-xl bg-[#3d3c3d] ${className}`}
    >
      <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-xl inset-0.5 bg-[#323132]">
        {children}
      </div>
      <div className="absolute w-56 h-48 bg-white blur-[50px] -left-1/2 -top-1/2"></div>
    </div>
  );
}

