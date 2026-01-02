'use client';

import { Card, CardBody } from '@heroui/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  subtitle?: string;
}

export default function KPICard({ title, value, trend, icon: Icon, subtitle }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-[#1a1a1a] border border-gray-800">
        <CardBody className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-white text-2xl font-bold">{value}</h3>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    trend.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trend.isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-gray-500 text-xs mt-2">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Icon className="w-6 h-6 text-purple-400" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

