/**
 * app/settings/page.tsx
 * Settings Page
 * User profile and app settings management.
 */
'use client';

import { useEffect, useState } from 'react';
import { getUserProfile } from '@/src/utils/api';
import { User } from '@/src/utils/types';
import { logger } from '@/src/utils/prettyLogs';
import Card from '@/src/components/ui/Card';
import { User as UserIcon, Bell, Lock, HelpCircle, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      logger.info('Loading user profile', 'SettingsPage');
      try {
        const userData = await getUserProfile();
        logger.info(`Loaded user: ${userData.email}`, 'SettingsPage');
        setUser(userData);
      } catch (error) {
        logger.error(`Failed to load user: ${error}`, 'SettingsPage');
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: UserIcon, label: 'Profile', description: 'Manage your personal information' },
        { icon: Bell, label: 'Notifications', description: 'Control your notification preferences' },
        { icon: Lock, label: 'Privacy & Security', description: 'Manage your security settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', description: 'Get help and support' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-base text-text-secondary">
          Manage your account and preferences
        </p>
      </div>

      {user && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
              <p className="text-sm text-text-secondary">{user.email}</p>
              {user.hasCompletedOnboarding && (
                <p className="text-xs text-brand-success font-medium mt-1">
                  Total donated: ${user.totalDonated.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {settingsSections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h3 className="text-lg font-bold text-text-primary">{section.title}</h3>

          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full text-left"
                onClick={() => logger.debug(`Settings option clicked: ${item.label}`, 'SettingsPage')}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-base font-bold text-text-primary">
                        {item.label}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-text-secondary">→</div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      ))}

      <button
        className="w-full"
        onClick={() => logger.info('User logged out', 'SettingsPage')}
      >
        <Card className="hover:shadow-md transition-shadow border-brand-error">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-brand-error" />
            </div>
            <div className="flex-grow text-left">
              <h4 className="text-base font-bold text-brand-error">Log Out</h4>
              <p className="text-sm text-text-secondary">
                Sign out of your account
              </p>
            </div>
          </div>
        </Card>
      </button>
    </div>
  );
}
