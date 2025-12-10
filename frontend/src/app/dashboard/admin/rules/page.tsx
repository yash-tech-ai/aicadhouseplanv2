'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Search, Filter, TestTube } from 'lucide-react';

type Rule = {
  id: string;
  name: string;
  description?: string;
  ruleType: 'condition' | 'formula' | 'range';
  condition?: string;
  formula?: string;
  minValue?: number;
  maxValue?: number;
  severity: 'error' | 'warning' | 'info';
  category: string;
  state?: string;
  region?: string;
  applicableCategories?: string[];
  isActive: boolean;
  createdAt: string;
};

const initialRuleForm = {
  name: '',
  description: '',
  ruleType: 'condition' as const,
  condition: '',
  formula: '',
  minValue: undefined as number | undefined,
  maxValue: undefined as number | undefined,
  severity: 'error' as const,
  category: '',
  state: '',
  region: '',
  applicableCategories: [] as string[],
  isActive: true,
};

export default function RulesAdminPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState(initialRuleForm);
  const [testData, setTestData] = useState('{}');
  const [testResult, setTestResult] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rules, searchQuery, filterState, filterCategory, filterSeverity]);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRules();
      setRules(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch rules',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = rules;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (rule) =>
          rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // State filter
    if (filterState !== 'all') {
      filtered = filtered.filter((rule) => rule.state === filterState);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((rule) => rule.category === filterCategory);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter((rule) => rule.severity === filterSeverity);
    }

    setFilteredRules(filtered);
  };

  const handleOpenDialog = (rule?: Rule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name,
        description: rule.description || '',
        ruleType: rule.ruleType,
        condition: rule.condition || '',
        formula: rule.formula || '',
        minValue: rule.minValue,
        maxValue: rule.maxValue,
        severity: rule.severity,
        category: rule.category,
        state: rule.state || '',
        region: rule.region || '',
        applicableCategories: rule.applicableCategories || [],
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      setRuleForm(initialRuleForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    setRuleForm(initialRuleForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRule) {
        await api.updateRule(editingRule.id, ruleForm);
        toast({
          title: 'Success',
          description: 'Rule updated successfully',
        });
      } else {
        await api.createRule(ruleForm);
        toast({
          title: 'Success',
          description: 'Rule created successfully',
        });
      }
      handleCloseDialog();
      fetchRules();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingRule ? 'update' : 'create'} rule`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the rule "${name}"?`)) return;

    try {
      await api.deleteRule(id);
      toast({
        title: 'Success',
        description: 'Rule deleted successfully',
      });
      fetchRules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
    }
  };

  const handleTestRule = async () => {
    try {
      const parsedTestData = JSON.parse(testData);
      const result = await api.testRule(ruleForm, parsedTestData);
      setTestResult(result);
      toast({
        title: 'Test Complete',
        description: result.passed ? 'Rule passed!' : 'Rule failed!',
        variant: result.passed ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Invalid test data or rule configuration',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique states and categories for filters
  const uniqueStates = Array.from(new Set(rules.map((r) => r.state).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(rules.map((r) => r.category)));

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
          <h1 className="text-3xl font-bold">Validation Rules</h1>
          <p className="text-slate-600 mt-2">Manage building code validation rules</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state!}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Filter className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No rules found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || filterState !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first validation rule'}
              </p>
              {!searchQuery && filterState === 'all' && filterCategory === 'all' && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge variant="outline">{rule.ruleType}</Badge>
                      {!rule.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    {rule.description && (
                      <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Category:</span>{' '}
                        <span className="font-medium">{rule.category}</span>
                      </div>
                      {rule.state && (
                        <div>
                          <span className="text-slate-600">State:</span>{' '}
                          <span className="font-medium">{rule.state}</span>
                        </div>
                      )}
                      {rule.region && (
                        <div>
                          <span className="text-slate-600">Region:</span>{' '}
                          <span className="font-medium">{rule.region}</span>
                        </div>
                      )}
                      {rule.condition && (
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Condition:</span>{' '}
                          <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                            {rule.condition}
                          </code>
                        </div>
                      )}
                      {rule.formula && (
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Formula:</span>{' '}
                          <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                            {rule.formula}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rule.id, rule.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>
              {editingRule
                ? 'Update the validation rule configuration'
                : 'Add a new validation rule for building code compliance'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={ruleForm.category}
                    onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                    placeholder="e.g., setback, height, coverage"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  placeholder="Describe what this rule validates..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleType">Rule Type *</Label>
                  <Select
                    value={ruleForm.ruleType}
                    onValueChange={(value: any) =>
                      setRuleForm({ ...ruleForm, ruleType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="formula">Formula</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select
                    value={ruleForm.severity}
                    onValueChange={(value: any) =>
                      setRuleForm({ ...ruleForm, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {ruleForm.ruleType === 'condition' && (
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Input
                    id="condition"
                    value={ruleForm.condition}
                    onChange={(e) => setRuleForm({ ...ruleForm, condition: e.target.value })}
                    placeholder="e.g., frontSetback >= 10"
                    required={ruleForm.ruleType === 'condition'}
                  />
                  <p className="text-xs text-slate-500">
                    Use operators: {'>=, <=, >, <, ==, !=, in, not_in'}
                  </p>
                </div>
              )}

              {ruleForm.ruleType === 'formula' && (
                <div className="space-y-2">
                  <Label htmlFor="formula">Formula *</Label>
                  <Input
                    id="formula"
                    value={ruleForm.formula}
                    onChange={(e) => setRuleForm({ ...ruleForm, formula: e.target.value })}
                    placeholder="e.g., plotSize * 0.6"
                    required={ruleForm.ruleType === 'formula'}
                  />
                  <p className="text-xs text-slate-500">
                    Mathematical expression using parameters
                  </p>
                </div>
              )}

              {ruleForm.ruleType === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minValue">Min Value</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={ruleForm.minValue || ''}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          minValue: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxValue">Max Value</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={ruleForm.maxValue || ''}
                      onChange={(e) =>
                        setRuleForm({
                          ...ruleForm,
                          maxValue: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={ruleForm.state}
                    onChange={(e) => setRuleForm({ ...ruleForm, state: e.target.value })}
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={ruleForm.region}
                    onChange={(e) => setRuleForm({ ...ruleForm, region: e.target.value })}
                    placeholder="e.g., Mumbai"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={ruleForm.isActive}
                  onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (rule will be used in validation)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingRule ? 'Update' : 'Create'} Rule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Rules Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{rules.length}</p>
              <p className="text-sm text-slate-600">Total Rules</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {rules.filter((r) => r.isActive).length}
              </p>
              <p className="text-sm text-slate-600">Active</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {rules.filter((r) => r.severity === 'error').length}
              </p>
              <p className="text-sm text-slate-600">Errors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {rules.filter((r) => r.severity === 'warning').length}
              </p>
              <p className="text-sm text-slate-600">Warnings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
