'use client';

import { useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Search, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { MatchResult } from '@/types';

export default function SearchPage() {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [searchParams, setSearchParams] = useState({
    plotSize: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    region: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params: any = {};
      if (searchParams.plotSize) params.plotSize = parseFloat(searchParams.plotSize);
      if (searchParams.bedrooms) params.bedrooms = parseInt(searchParams.bedrooms);
      if (searchParams.bathrooms) params.bathrooms = parseInt(searchParams.bathrooms);
      if (searchParams.floors) params.floors = parseInt(searchParams.floors);
      if (searchParams.region) params.region = searchParams.region;
      if (searchParams.state) params.state = searchParams.state;

      const results = await api.findMatches(params);
      setMatchResults(results);

      toast({
        title: 'Search complete',
        description: `Found ${results.length} matching drawings`,
      });
    } catch (error) {
      toast({
        title: 'Search failed',
        description: 'Failed to search for matching drawings',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search & Match</h1>
        <p className="text-slate-600 mt-2">
          Find similar drawings based on parameters and specifications
        </p>
      </div>

      {/* Search Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
          <CardDescription>Enter specifications to find matching drawings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="plotSize">Plot Size (sq ft)</Label>
              <Input
                id="plotSize"
                name="plotSize"
                type="number"
                placeholder="e.g., 1200"
                value={searchParams.plotSize}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                placeholder="e.g., 3"
                value={searchParams.bedrooms}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                placeholder="e.g., 2"
                value={searchParams.bathrooms}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors">Floors</Label>
              <Input
                id="floors"
                name="floors"
                type="number"
                placeholder="e.g., 2"
                value={searchParams.floors}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g., North India"
                value={searchParams.region}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                placeholder="e.g., Maharashtra"
                value={searchParams.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search for Matches'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {matchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Results</CardTitle>
            <CardDescription>
              Found {matchResults.length} drawings matching your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchResults.map((result, idx) => (
                <div
                  key={result.drawing.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                      {result.drawing.thumbnailPath ? (
                        <img
                          src={result.drawing.thumbnailPath}
                          alt={result.drawing.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{result.drawing.name}</h3>
                          <p className="text-sm text-slate-600">
                            {result.drawing.description || 'No description'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">
                              {Math.round(result.matchScore)}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">Match Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-slate-600">Geometric</p>
                          <p className="font-semibold text-sm">
                            {Math.round(result.matchDetails.geometricScore)}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-slate-600">Parameter</p>
                          <p className="font-semibold text-sm">
                            {Math.round(result.matchDetails.parameterScore)}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-xs text-slate-600">Layout</p>
                          <p className="font-semibold text-sm">
                            {Math.round(result.matchDetails.layoutScore)}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="text-xs text-slate-600">Compliance</p>
                          <p className="font-semibold text-sm">
                            {Math.round(result.matchDetails.complianceScore)}%
                          </p>
                        </div>
                      </div>

                      {result.similarities.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-green-700 mb-1">Similarities:</p>
                          <ul className="text-sm text-slate-600 list-disc list-inside">
                            {result.similarities.slice(0, 3).map((sim, i) => (
                              <li key={i}>{sim}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Link href={`/dashboard/drawings/${result.drawing.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {matchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No results yet</h3>
            <p className="text-slate-600">
              Enter search parameters above to find matching drawings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
