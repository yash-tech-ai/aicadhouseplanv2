'use client';

import { useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, FileText, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { LayoutSuggestion } from '@/types';

export default function SuggestionsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [parameters, setParameters] = useState({
    plotSize: '',
    approachingRoad: '',
    overheadWire: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    openSpace: '',
    region: '',
    state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParameters(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (parameters.plotSize) params.plotSize = parseFloat(parameters.plotSize);
      if (parameters.bedrooms) params.bedrooms = parseInt(parameters.bedrooms);
      if (parameters.bathrooms) params.bathrooms = parseInt(parameters.bathrooms);
      if (parameters.floors) params.floors = parseInt(parameters.floors);
      if (parameters.openSpace) params.openSpace = parseFloat(parameters.openSpace);
      if (parameters.region) params.region = parameters.region;
      if (parameters.state) params.state = parameters.state;

      // Get layout suggestions
      const layoutResults = await api.getLayoutSuggestions(params);
      setSuggestions(layoutResults);

      // Get AI suggestions
      const aiResults = await api.getAiSuggestions(params);
      setAiSuggestions(aiResults.suggestions || []);

      toast({
        title: 'Suggestions generated',
        description: `Found ${layoutResults.length} layout suggestions`,
      });
    } catch (error) {
      toast({
        title: 'Failed to get suggestions',
        description: 'Unable to generate suggestions at this time',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Suggestions</h1>
        <p className="text-slate-600 mt-2">
          Get intelligent layout suggestions based on your plot parameters
        </p>
      </div>

      {/* Input Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Plot Parameters</CardTitle>
          <CardDescription>Provide details about your plot and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="plotSize">Plot Size (sq ft) *</Label>
              <Input
                id="plotSize"
                name="plotSize"
                type="number"
                placeholder="e.g., 1200"
                value={parameters.plotSize}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approachingRoad">Approaching Road (ft)</Label>
              <Input
                id="approachingRoad"
                name="approachingRoad"
                type="number"
                placeholder="e.g., 20"
                value={parameters.approachingRoad}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overheadWire">Overhead Wire Distance (ft)</Label>
              <Input
                id="overheadWire"
                name="overheadWire"
                type="number"
                placeholder="e.g., 10"
                value={parameters.overheadWire}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                placeholder="e.g., 3"
                value={parameters.bedrooms}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                placeholder="e.g., 2"
                value={parameters.bathrooms}
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
                value={parameters.floors}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openSpace">Open Space (%)</Label>
              <Input
                id="openSpace"
                name="openSpace"
                type="number"
                placeholder="e.g., 20"
                value={parameters.openSpace}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g., North India"
                value={parameters.region}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                placeholder="e.g., Maharashtra"
                value={parameters.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <Button
            onClick={handleGetSuggestions}
            disabled={isLoading || !parameters.plotSize || !parameters.bedrooms || !parameters.bathrooms}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isLoading ? 'Generating Suggestions...' : 'Get AI Suggestions'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Intelligent suggestions for your design</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {aiSuggestions.map((suggestion, idx) => (
                <li key={idx} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                  <p className="text-slate-700">{suggestion}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Popular Layouts */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Layouts for Your Plot</CardTitle>
            <CardDescription>
              Top {suggestions.length} most popular layouts matching your requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.drawingId}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    {suggestion.thumbnail ? (
                      <img
                        src={suggestion.thumbnail}
                        alt={suggestion.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{suggestion.name}</h3>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">
                          {suggestion.popularity}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {Math.round(suggestion.matchScore)}% match
                      </span>
                    </div>
                    {suggestion.reasons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-700 mb-1">Why this layout:</p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {suggestion.reasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link href={`/dashboard/drawings/${suggestion.drawingId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Layout
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length === 0 && aiSuggestions.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
            <p className="text-slate-600">
              Enter your plot parameters above to get AI-powered layout suggestions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
