'use client';

import { useEffect, useState } from 'react';
import { useDrawingStore } from '@/stores/drawing.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Grid, List, Search, Filter, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type ViewMode = 'grid' | 'list';

export default function DrawingsPage() {
  const { drawings, fetchDrawings, deleteDrawing, isLoading } = useDrawingStore();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const filteredDrawings = drawings.filter(drawing =>
    drawing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drawing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteDrawing(id);
      toast({
        title: 'Drawing deleted',
        description: 'The drawing has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the drawing.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drawings</h1>
          <p className="text-slate-600 mt-2">Manage all your CAD drawings</p>
        </div>
        <Link href="/dashboard/upload">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Upload New
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search drawings by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex gap-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drawings Display */}
      {filteredDrawings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No drawings found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start by uploading your first CAD drawing'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/upload">
                <Button>Upload Drawing</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrawings.map((drawing) => (
            <Card key={drawing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-slate-100 flex items-center justify-center">
                {drawing.thumbnailPath ? (
                  <img
                    src={drawing.thumbnailPath}
                    alt={drawing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-16 w-16 text-slate-400" />
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{drawing.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {drawing.description || 'No description'}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      drawing.status === 'validated'
                        ? 'bg-green-100 text-green-800'
                        : drawing.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {drawing.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                  <span>Score: {drawing.validationScore}%</span>
                  <span>{formatDate(drawing.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/drawings/${drawing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(drawing.id, drawing.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredDrawings.map((drawing) => (
                <div key={drawing.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                      {drawing.thumbnailPath ? (
                        <img
                          src={drawing.thumbnailPath}
                          alt={drawing.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FileText className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{drawing.name}</h3>
                      <p className="text-sm text-slate-600 truncate">
                        {drawing.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span>Score: {drawing.validationScore}%</span>
                        <span>Views: {drawing.viewCount}</span>
                        <span>{formatDate(drawing.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(drawing.id, drawing.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-sm text-slate-600 text-center">
        Showing {filteredDrawings.length} of {drawings.length} drawings
      </div>
    </div>
  );
}
