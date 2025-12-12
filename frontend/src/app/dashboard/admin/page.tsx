'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Settings, FileText, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-600 mt-2">
          Manage users, rules, and system settings
        </p>
      </div>

      {/* Admin Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rules Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Validation Rules</CardTitle>
                <CardDescription>Manage building code validation rules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Create, edit, and manage validation rules for different states and regions.
              Configure conditions, formulas, and severity levels.
            </p>
            <Link href="/dashboard/admin/rules">
              <Button className="w-full">Manage Rules</Button>
            </Link>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Add, edit, and remove users. Manage roles and permissions for architects
              and administrators.
            </p>
            <Link href="/dashboard/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Parameter Definitions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Parameter Definitions</CardTitle>
                <CardDescription>Define extractable parameters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Configure parameters that can be extracted from CAD files. Define data types,
              units, and validation rules.
            </p>
            <Link href="/dashboard/admin/parameters">
              <Button className="w-full">Manage Parameters</Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>View system analytics and reports</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              View detailed statistics about drawings, validations, user activity, and
              system performance.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">245</p>
                <p className="text-xs text-blue-800">Total Drawings</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">89%</p>
                <p className="text-xs text-green-800">Validation Rate</p>
              </div>
            </div>
            <Link href="/dashboard/validation">
              <Button className="w-full" variant="outline">
                View Statistics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of system activity (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">142</p>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-xs text-green-600 mt-1">+12 this month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">85</p>
              <p className="text-sm text-slate-600">Active Rules</p>
              <p className="text-xs text-blue-600 mt-1">15 states covered</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">23</p>
              <p className="text-sm text-slate-600">Uploads Today</p>
              <p className="text-xs text-green-600 mt-1">+5 from yesterday</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">1,247</p>
              <p className="text-sm text-slate-600">Total Validations</p>
              <p className="text-xs text-green-600 mt-1">89% pass rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
