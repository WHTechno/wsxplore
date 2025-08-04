import React from 'react';
import { Github, Twitter, Send, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer: React.FC = () => {
  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://x.com/winsnip',
      color: 'hover:text-blue-400'
    },
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/winsnip',
      color: 'hover:text-white'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: 'https://t.me/winsnip',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      url: '#',
      color: 'hover:text-indigo-400'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:winsnip@gmail.com',
      color: 'hover:text-red-400'
    }
  ];

  return (
    <footer className="mt-auto border-t glass-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img
              src="https://pbs.twimg.com/profile_images/1905206975048425472/ywz3Yoc7.jpg"
              alt="OneNov Explorer"
              className="h-12 w-12 rounded-full ring-2 ring-primary/20"
            />
            <div className="text-center">
              <h3 className="text-lg font-bold aurora-text">Winsnip Explorer</h3>
              <p className="text-sm text-muted-foreground">Blockchain Explorer & Analytics</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`transition-colors duration-200 ${link.color}`}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Button>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Winsnip Explorer. Built with ❤️ for the blockchain community.</p>
            <p className="mt-1">Powered by React, TypeScript & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
