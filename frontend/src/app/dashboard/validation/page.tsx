'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import apiClient from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  id: string;
  drawingId: string;
  drawingName: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  rulesChecked: number;
  rulesPassed: number;
  rulesFailed: number;
  rulesWarning: number;
  executedAt: string;
  results: Array<{
    ruleName: string;
    ruleType: string;
    status: 'passed' | 'failed' | 'warning';
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

export default function ValidationPage() {
  const { toast } = useToast();
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [filteredValidations, setFilteredValidations] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedValidation, setSelectedValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    fetchValidations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [validations, searchQuery, filterStatus]);

  const fetchValidations = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: ValidationResult[] = [
        {
          id: '1',
          drawingId: 'drawing-1',
          drawingName: '2BHK Residential Plan - Mumbai',
          status: 'passed',
          score: 95,
          rulesChecked: 20,
          rulesPassed: 19,
          rulesFailed: 0,
          rulesWarning: 1,
          executedAt: new Date().toISOString(),
          results: [
            {
              ruleName: 'Front Setback - Mumbai',
              ruleType: 'condition',
              status: 'passed',
              message: 'Front setback of 10ft meets minimum requirement of 10ft',
              severity: 'info',
            },
            {
              ruleName: 'Floor Area Ratio',
              ruleType: 'formula',
              status: 'warning',
              message: 'FAR of 1.8 is close to maximum limit of 2.0',
              severity: 'warning',
            },
          ],
        },
        {
          id: '2',
          drawingId: 'drawing-2',
          drawingName: '3BHK Villa - Bangalore',
          status: 'failed',
          score: 65,
          rulesChecked: 25,
          rulesPassed: 18,
          rulesFailed: 5,
          rulesWarning: 2,
          executedAt: new Date(Date.now() - 3600000).toISOString(),
          results: [
            {
              ruleName: 'Rear Setback - Karnataka',
              ruleType: 'condition',
              status: 'failed',
              message: 'Rear setback of 8ft does not meet minimum requirement of 10ft',
              severity: 'error',
            },
            {
              ruleName: 'Building Height Limit',
              ruleType: 'range',
              status: 'failed',
              message: 'Building height of 35ft exceeds maximum limit of 30ft',
              severity: 'error',
            },
          ],
        },
      ];

      setValidations(mockData);
      setFilteredValidations(mockData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch validation results',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...validations];

    if (searchQuery) {
      filtered = filtered.filter((v) =>
        v.drawingName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }

    setFilteredValidations(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuleStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = {
    total: validations.length,
    passed: validations.filter((v) => v.status === 'passed').length,
    failed: validations.filter((v) => v.status === 'failed').length,
    warning: validations.filter((v) => v.status === 'warning').length,
    avgScore: validations.length > 0
      ? Math.round(validations.reduce((sum, v) => sum + v.score, 0) / validations.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rule Validation</h1>
        <p className="text-slate-600 mt-2">
          Validate drawings against regional building codes
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Validations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by drawing name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'passed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('passed')}
                size="sm"
              >
                Passed
              </Button>
              <Button
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('failed')}
                size="sm"
              >
                Failed
              </Button>
              <Button
                variant={filterStatus === 'warning' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('warning')}
                size="sm"
              >
                Warnings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List View */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Validation History</h2>
          {isLoading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-slate-600">Loading validations...</p>
              </CardContent>
            </Card>
          ) : filteredValidations.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">No validation results found</p>
              </CardContent>
            </Card>
          ) : (
            filteredValidations.map((validation) => (
              <Card
                key={validation.id}
                className={`cursor-pointer transition-all ${
                  selectedValidation?.id === validation.id
                    ? 'ring-2 ring-blue-600'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedValidation(validation)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(validation.status)}
                        <h3 className="font-semibold">{validation.drawingName}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-3 w-3" />
                        {new Date(validation.executedAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(validation.status)}>
                      {validation.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Validation Score:</span>
                      <span className="font-semibold">{validation.score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Rules Checked:</span>
                      <span className="font-semibold">{validation.rulesChecked}</span>
                    </div>
                    <div className="flex gap-4 text-sm mt-2">
                      <span className="text-green-600">✓ {validation.rulesPassed} passed</span>
                      {validation.rulesFailed > 0 && (
                        <span className="text-red-600">✗ {validation.rulesFailed} failed</span>
                      )}
                      {validation.rulesWarning > 0 && (
                        <span className="text-yellow-600">⚠ {validation.rulesWarning} warnings</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail View */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Validation Details</h2>
          {selectedValidation ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedValidation.drawingName}</CardTitle>
                  <Badge className={getStatusColor(selectedValidation.status)}>
                    {selectedValidation.status.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  Validated at {new Date(selectedValidation.executedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Score Breakdown</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Rules:</span>
                        <span className="font-semibold">{selectedValidation.rulesChecked}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passed:</span>
                        <span className="font-semibold text-green-600">
                          {selectedValidation.rulesPassed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="font-semibold text-red-600">
                          {selectedValidation.rulesFailed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warnings:</span>
                        <span className="font-semibold text-yellow-600">
                          {selectedValidation.rulesWarning}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Rule Results</h3>
                    <div className="space-y-3">
                      {selectedValidation.results.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {result.status === 'passed' && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {result.status === 'failed' && (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                {result.status === 'warning' && (
                                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                                )}
                                <p className="font-medium text-sm">{result.ruleName}</p>
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {result.ruleType}
                              </Badge>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRuleStatusColor(result.status)}`}
                            >
                              {result.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{result.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600">Select a validation to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
