'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600 mt-2">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">User Settings</h3>
          <p className="text-slate-600">
            Coming soon - Profile settings and preferences
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
