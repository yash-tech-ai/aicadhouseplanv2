'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDrawingStore } from '@/stores/drawing.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function DrawingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentDrawing, fetchDrawing, deleteDrawing, isLoading } = useDrawingStore();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      fetchDrawing(id);
    }
  }, [id, fetchDrawing]);

  const handleDelete = async () => {
    if (!currentDrawing) return;
    if (!confirm(`Are you sure you want to delete "${currentDrawing.name}"?`)) return;

    try {
      await deleteDrawing(currentDrawing.id);
      toast({
        title: 'Drawing deleted',
        description: 'The drawing has been successfully deleted.',
      });
      router.push('/dashboard/drawings');
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the drawing.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !currentDrawing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const validationResults = currentDrawing.validationResults as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/drawings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{currentDrawing.name}</h1>
            <p className="text-slate-600 mt-1">
              {currentDrawing.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <div className="flex items-center gap-2">
                {currentDrawing.status === 'validated' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {currentDrawing.status === 'rejected' && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {(currentDrawing.status === 'pending' || currentDrawing.status === 'processing') && (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <span
                  className={`font-medium ${
                    currentDrawing.status === 'validated'
                      ? 'text-green-600'
                      : currentDrawing.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {currentDrawing.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Validation Score</p>
              <p className="text-2xl font-bold">{currentDrawing.validationScore}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Views</p>
              <p className="text-2xl font-bold">{currentDrawing.viewCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Uploaded</p>
              <p className="font-medium">{formatDate(currentDrawing.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="matches">Similar Drawings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Drawing Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                {currentDrawing.thumbnailPath ? (
                  <img
                    src={currentDrawing.thumbnailPath}
                    alt={currentDrawing.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-slate-500">No preview available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentDrawing.region && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Region</span>
                  <span className="font-medium">{currentDrawing.region}</span>
                </div>
              )}
              {currentDrawing.state && (
                <div className="flex justify-between">
                  <span className="text-slate-600">State</span>
                  <span className="font-medium">{currentDrawing.state}</span>
                </div>
              )}
              {currentDrawing.category && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Category</span>
                  <span className="font-medium">{currentDrawing.category.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">File Path</span>
                <span className="font-medium text-sm">{currentDrawing.filePath}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Parameters</CardTitle>
              <CardDescription>Auto-extracted and manual parameters</CardDescription>
            </CardHeader>
            <CardContent>
              {currentDrawing.parameters && currentDrawing.parameters.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {currentDrawing.parameters.map((param) => (
                    <div
                      key={param.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{param.parameterName}</p>
                        {param.isCustom && (
                          <Badge variant="secondary" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {param.parameterValue}
                        {param.unit && <span className="text-sm ml-1">{param.unit}</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{param.dataType}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 py-8">No parameters extracted yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Report</CardTitle>
              <CardDescription>Building code compliance check</CardDescription>
            </CardHeader>
            <CardContent>
              {validationResults ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">Total Rules</p>
                      <p className="text-2xl font-bold">{validationResults.totalRules || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Passed</p>
                      <p className="text-2xl font-bold">{validationResults.passedRules || 0}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 mb-1">Failed</p>
                      <p className="text-2xl font-bold">{validationResults.failedRules || 0}</p>
                    </div>
                  </div>

                  {validationResults.summary?.violations && validationResults.summary.violations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        Violations
                      </h4>
                      <ul className="space-y-2">
                        {validationResults.summary.violations.map((violation: string, idx: number) => (
                          <li key={idx} className="text-sm p-3 bg-red-50 rounded border-l-4 border-red-600">
                            {violation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResults.summary?.suggestions && validationResults.summary.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {validationResults.summary.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="text-sm p-3 bg-orange-50 rounded border-l-4 border-orange-600">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-slate-600 py-8">
                  Validation not yet complete. Please wait...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Similar Drawings</CardTitle>
              <CardDescription>Drawings with similar characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-600 py-8">
                No similar drawings found yet. Run matching to find similar designs.
              </p>
              <div className="flex justify-center">
                <Link href="/dashboard/search">
                  <Button>Find Similar Drawings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
