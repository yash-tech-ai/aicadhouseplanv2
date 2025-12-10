'use client';

import { useEffect } from 'react';
import { useDrawingStore } from '@/stores/drawing.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { drawings, fetchDrawings } = useDrawingStore();

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const stats = {
    total: drawings.length,
    validated: drawings.filter(d => d.status === 'validated').length,
    pending: drawings.filter(d => d.status === 'pending' || d.status === 'processing').length,
    rejected: drawings.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Overview of your CAD drawings and validation status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drawings</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-600 mt-1">All uploaded drawings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-xs text-slate-600 mt-1">Passed validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-slate-600 mt-1">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-slate-600 mt-1">Failed validation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/upload">
            <Button className="w-full h-20" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload Drawing</span>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/search">
            <Button className="w-full h-20" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Search Drawings</span>
              </div>
            </Button>
          </Link>
          <Link href="/dashboard/suggestions">
            <Button className="w-full h-20" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Get AI Suggestions</span>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Drawings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Drawings</CardTitle>
          <CardDescription>Your latest uploaded CAD drawings</CardDescription>
        </CardHeader>
        <CardContent>
          {drawings.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>No drawings uploaded yet</p>
              <Link href="/dashboard/upload">
                <Button className="mt-4">Upload Your First Drawing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {drawings.slice(0, 5).map((drawing) => (
                <div
                  key={drawing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{drawing.name}</p>
                      <p className="text-sm text-slate-600">
                        {drawing.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        drawing.status === 'validated'
                          ? 'bg-green-100 text-green-800'
                          : drawing.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {drawing.status}
                    </span>
                    <Link href={`/dashboard/drawings/${drawing.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
