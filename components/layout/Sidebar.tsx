'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  FileText,
  Users,
  Building2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardBody, Button, Input } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface Workgroup {
  name: string;
  items?: { name: string; href: string }[];
  href?: string;
}

const navItems: NavItem[] = [
  { name: 'Inbox', icon: Inbox, href: '/inbox' },
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Projects', icon: FolderKanban, href: '/projects' },
  { name: 'Calendar', icon: Calendar, href: '/calendar' },
  { name: 'Documents', icon: FileText, href: '/documents' },
  { name: 'Teams', icon: Users, href: '/teams' },
  { name: 'Company', icon: Building2, href: '/company' },
];

const workgroups: Workgroup[] = [
  {
    name: 'Website Copy',
    items: [
      { name: 'Client website', href: '/workgroups/website-copy/client' },
      { name: 'Personal project', href: '/workgroups/website-copy/personal' },
    ],
  },
  { name: 'UX Research', href: '/workgroups/ux-research' },
  { name: 'Assets Library', href: '/workgroups/assets' },
  { name: 'Marketing', href: '/workgroups/marketing' },
  { name: 'Development', href: '/workgroups/development' },
  { name: 'Support', href: '/workgroups/support' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
      {/* Logo and Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <span className="text-white font-semibold text-lg">Lunor Inc.</span>
        </div>
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            base: 'w-full',
            input: 'text-white',
            inputWrapper: 'bg-gray-800 border-gray-700',
          }}
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Workgroups Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Workgroups
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="min-w-6 w-6 h-6"
            aria-label="Add workgroup"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <Link href="/workgroups/all">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <span className="text-sm">All Work</span>
            </div>
          </Link>
          {workgroups.map((group) => {
            const isExpanded = expandedGroups.has(group.name);
            const hasItems = group.items && group.items.length > 0;
            return (
              <div key={group.name}>
                <button
                  onClick={() => hasItems && toggleGroup(group.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <span className="text-sm">{group.name}</span>
                  {hasItems && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && hasItems && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1">
                        {group.items?.map((item) => (
                          <Link key={item.href} href={item.href}>
                            <div className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors text-sm">
                              {item.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium CTA */}
      <div className="p-4 border-t border-gray-800">
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <CardBody className="p-4">
            <h3 className="text-white font-semibold text-sm mb-1">Try Premium</h3>
            <p className="text-gray-400 text-xs mb-3">
              Unlimited workgroups, projects, and leads
            </p>
            <Button
              size="sm"
              className="w-full bg-purple-500 text-white font-medium"
            >
              Get 7 Days Free
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

