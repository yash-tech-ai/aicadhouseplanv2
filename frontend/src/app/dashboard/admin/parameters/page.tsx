'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  Database,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Parameter {
  id: string;
  name: string;
  displayName: string;
  description: string;
  dataType: 'text' | 'numeric' | 'boolean' | 'date';
  unit?: string;
  isRequired: boolean;
  isExtractable: boolean;
  category: string;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: any;
  createdAt: string;
}

export default function ParameterDefinitionsPage() {
  const { toast } = useToast();
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [paramForm, setParamForm] = useState({
    name: '',
    displayName: '',
    description: '',
    dataType: 'text' as Parameter['dataType'],
    unit: '',
    isRequired: false,
    isExtractable: true,
    category: 'general',
    min: '',
    max: '',
    pattern: '',
    defaultValue: '',
  });

  useEffect(() => {
    fetchParameters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [parameters, searchQuery, filterCategory]);

  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockParameters: Parameter[] = [
        {
          id: '1',
          name: 'plot_area',
          displayName: 'Plot Area',
          description: 'Total area of the plot in square feet',
          dataType: 'numeric',
          unit: 'sq ft',
          isRequired: true,
          isExtractable: true,
          category: 'dimensions',
          validationRules: { min: 100, max: 50000 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'num_bedrooms',
          displayName: 'Number of Bedrooms',
          description: 'Total number of bedrooms in the plan',
          dataType: 'numeric',
          isRequired: true,
          isExtractable: true,
          category: 'rooms',
          validationRules: { min: 1, max: 10 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'num_bathrooms',
          displayName: 'Number of Bathrooms',
          description: 'Total number of bathrooms',
          dataType: 'numeric',
          isRequired: true,
          isExtractable: true,
          category: 'rooms',
          validationRules: { min: 1, max: 10 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'num_floors',
          displayName: 'Number of Floors',
          description: 'Total number of floors including ground',
          dataType: 'numeric',
          isRequired: true,
          isExtractable: true,
          category: 'structure',
          validationRules: { min: 1, max: 10 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'building_height',
          displayName: 'Building Height',
          description: 'Total height of the building',
          dataType: 'numeric',
          unit: 'ft',
          isRequired: false,
          isExtractable: true,
          category: 'dimensions',
          validationRules: { min: 10, max: 200 },
          createdAt: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'has_parking',
          displayName: 'Has Parking',
          description: 'Whether the plan includes parking',
          dataType: 'boolean',
          isRequired: false,
          isExtractable: true,
          category: 'amenities',
          createdAt: new Date().toISOString(),
        },
        {
          id: '7',
          name: 'construction_type',
          displayName: 'Construction Type',
          description: 'Type of construction (RCC, Steel, etc.)',
          dataType: 'text',
          isRequired: false,
          isExtractable: false,
          category: 'structure',
          createdAt: new Date().toISOString(),
        },
      ];

      setParameters(mockParameters);
      setFilteredParameters(mockParameters);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch parameters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...parameters];

    if (searchQuery) {
      filtered = filtered.filter(
        (param) =>
          param.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          param.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          param.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((param) => param.category === filterCategory);
    }

    setFilteredParameters(filtered);
  };

  const handleOpenDialog = (parameter?: Parameter) => {
    if (parameter) {
      setEditingParameter(parameter);
      setParamForm({
        name: parameter.name,
        displayName: parameter.displayName,
        description: parameter.description,
        dataType: parameter.dataType,
        unit: parameter.unit || '',
        isRequired: parameter.isRequired,
        isExtractable: parameter.isExtractable,
        category: parameter.category,
        min: parameter.validationRules?.min?.toString() || '',
        max: parameter.validationRules?.max?.toString() || '',
        pattern: parameter.validationRules?.pattern || '',
        defaultValue: parameter.defaultValue || '',
      });
    } else {
      setEditingParameter(null);
      setParamForm({
        name: '',
        displayName: '',
        description: '',
        dataType: 'text',
        unit: '',
        isRequired: false,
        isExtractable: true,
        category: 'general',
        min: '',
        max: '',
        pattern: '',
        defaultValue: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveParameter = () => {
    if (editingParameter) {
      toast({
        title: 'Parameter Updated',
        description: `${paramForm.displayName} has been updated successfully.`,
      });
    } else {
      toast({
        title: 'Parameter Created',
        description: `${paramForm.displayName} has been created successfully.`,
      });
    }
    setIsDialogOpen(false);
    fetchParameters();
  };

  const handleDeleteParameter = (parameter: Parameter) => {
    if (confirm(`Are you sure you want to delete ${parameter.displayName}?`)) {
      toast({
        title: 'Parameter Deleted',
        description: `${parameter.displayName} has been deleted.`,
      });
      fetchParameters();
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'numeric':
        return <Hash className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'numeric':
        return 'bg-blue-100 text-blue-800';
      case 'text':
        return 'bg-green-100 text-green-800';
      case 'boolean':
        return 'bg-purple-100 text-purple-800';
      case 'date':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dimensions':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rooms':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'structure':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'amenities':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    total: parameters.length,
    required: parameters.filter((p) => p.isRequired).length,
    extractable: parameters.filter((p) => p.isExtractable).length,
    numeric: parameters.filter((p) => p.dataType === 'numeric').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parameter Definitions</h1>
          <p className="text-slate-600 mt-2">
            Define and manage extractable parameters from CAD files
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Parameters</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Required</p>
                <p className="text-2xl font-bold text-red-600">{stats.required}</p>
              </div>
              <Settings className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">AI Extractable</p>
                <p className="text-2xl font-bold text-green-600">{stats.extractable}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Numeric</p>
                <p className="text-2xl font-bold text-purple-600">{stats.numeric}</p>
              </div>
              <Hash className="h-8 w-8 text-purple-600" />
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
                placeholder="Search parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="dimensions">Dimensions</SelectItem>
                <SelectItem value="rooms">Rooms</SelectItem>
                <SelectItem value="structure">Structure</SelectItem>
                <SelectItem value="amenities">Amenities</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parameters Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-slate-600">Loading parameters...</p>
          </CardContent>
        </Card>
      ) : filteredParameters.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600">No parameters found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParameters.map((parameter) => (
            <Card key={parameter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getDataTypeIcon(parameter.dataType)}
                      {parameter.displayName}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getDataTypeColor(parameter.dataType)}>
                        {parameter.dataType}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(parameter.category)}>
                        {parameter.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(parameter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteParameter(parameter)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600">{parameter.description}</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Internal Name:</span>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {parameter.name}
                    </code>
                  </div>
                  {parameter.unit && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit:</span>
                      <span className="font-medium">{parameter.unit}</span>
                    </div>
                  )}
                  {parameter.validationRules && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Range:</span>
                      <span className="font-medium">
                        {parameter.validationRules.min} - {parameter.validationRules.max}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {parameter.isRequired && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {parameter.isExtractable && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      AI Extractable
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Parameter Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParameter ? 'Edit Parameter' : 'Add New Parameter'}
            </DialogTitle>
            <DialogDescription>
              {editingParameter
                ? 'Update parameter definition and validation rules'
                : 'Define a new extractable parameter'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Internal Name *</Label>
                <Input
                  id="name"
                  value={paramForm.name}
                  onChange={(e) => setParamForm({ ...paramForm, name: e.target.value })}
                  placeholder="plot_area"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={paramForm.displayName}
                  onChange={(e) => setParamForm({ ...paramForm, displayName: e.target.value })}
                  placeholder="Plot Area"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={paramForm.description}
                onChange={(e) => setParamForm({ ...paramForm, description: e.target.value })}
                placeholder="Describe what this parameter represents..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataType">Data Type *</Label>
                <Select
                  value={paramForm.dataType}
                  onValueChange={(value: Parameter['dataType']) =>
                    setParamForm({ ...paramForm, dataType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={paramForm.category}
                  onValueChange={(value) => setParamForm({ ...paramForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="dimensions">Dimensions</SelectItem>
                    <SelectItem value="rooms">Rooms</SelectItem>
                    <SelectItem value="structure">Structure</SelectItem>
                    <SelectItem value="amenities">Amenities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit (Optional)</Label>
              <Input
                id="unit"
                value={paramForm.unit}
                onChange={(e) => setParamForm({ ...paramForm, unit: e.target.value })}
                placeholder="sq ft, meters, etc."
              />
            </div>

            {paramForm.dataType === 'numeric' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={paramForm.min}
                    onChange={(e) => setParamForm({ ...paramForm, min: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={paramForm.max}
                    onChange={(e) => setParamForm({ ...paramForm, max: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {paramForm.dataType === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="pattern">Validation Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  value={paramForm.pattern}
                  onChange={(e) => setParamForm({ ...paramForm, pattern: e.target.value })}
                  placeholder="^[A-Z]{2}-\d{5}$"
                />
              </div>
            )}

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={paramForm.isRequired}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, isRequired: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isRequired" className="cursor-pointer">
                  Required Parameter
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isExtractable"
                  checked={paramForm.isExtractable}
                  onChange={(e) =>
                    setParamForm({ ...paramForm, isExtractable: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isExtractable" className="cursor-pointer">
                  AI Extractable (Can be detected automatically)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveParameter}>
              {editingParameter ? 'Update Parameter' : 'Create Parameter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
