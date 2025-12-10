'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-600 mt-2">
          Manage users, rules, and system settings
        </p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>
          <p className="text-slate-600">
            Coming soon - User management and system configuration
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
