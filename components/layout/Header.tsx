'use client';

import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { MessageSquare, Share2, Plus, UserPlus, MoreVertical } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-white text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          isIconOnly
          variant="light"
          className="text-gray-400 hover:text-white"
          aria-label="Ask AI"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        
        <Button
          isIconOnly
          variant="light"
          className="text-gray-400 hover:text-white"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        
        <Button
          startContent={<Plus className="w-4 h-4" />}
          className="bg-purple-500 text-white font-medium"
        >
          Add Project
        </Button>
        
        <Button
          startContent={<UserPlus className="w-4 h-4" />}
          className="bg-gray-700 text-white font-medium hover:bg-gray-600"
        >
          New Client
        </Button>
        
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              src="https://i.pravatar.cc/150?u=user"
              className="cursor-pointer"
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem key="profile">Profile</DropdownItem>
            <DropdownItem key="settings">Settings</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

