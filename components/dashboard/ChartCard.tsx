'use client';

import { Card, CardHeader, CardBody, Button } from '@heroui/react';
import { Maximize2, ChevronLeft } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  onMaximize?: () => void;
}

export default function ChartCard({ title, children, controls, onMaximize }: ChartCardProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  return (
    <Card className="bg-[#1a1a1a] border border-gray-800">
      <CardHeader className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          {controls}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-gray-400 hover:text-white"
            onClick={handleMaximize}
            aria-label={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <div className={isMaximized ? 'fixed inset-0 z-50 bg-[#0f0f0f] p-8' : ''}>
          {children}
        </div>
      </CardBody>
    </Card>
  );
}

