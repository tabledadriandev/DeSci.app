'use client';

import { Card, CardBody, Avatar, Progress } from '@heroui/react';
import { Star } from 'lucide-react';

interface Performer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  color: string;
}

interface TopPerformersProps {
  performers: Performer[];
}

export default function TopPerformers({ performers }: TopPerformersProps) {
  const maxScore = Math.max(...performers.map((p: typeof performers[0]) => p.score));

  return (
    <Card className="bg-[#1a1a1a] border border-gray-800">
      <CardBody className="p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Top Performers</h3>
        <div className="space-y-4">
          {performers.map((performer: typeof performers[0], index: number) => (
            <div key={performer.id} className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={performer.avatar}
                  name={performer.name}
                  size="md"
                  className="border-2"
                  style={{ borderColor: performer.color }}
                />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{performer.name}</span>
                  <span className="text-gray-400 text-sm font-semibold">{performer.score}</span>
                </div>
                <Progress
                  value={(performer.score / maxScore) * 100}
                  color="primary"
                  className="h-2"
                  classNames={{
                    indicator: 'bg-gradient-to-r from-purple-500 to-pink-500',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

