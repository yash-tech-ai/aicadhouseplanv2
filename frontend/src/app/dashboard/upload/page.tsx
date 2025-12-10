'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useDrawingStore } from '@/stores/drawing.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, X } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { uploadDrawing, categories, fetchCategories, isLoading } = useDrawingStore();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    region: '',
    state: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      // Auto-populate name from filename
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ''),
        }));
      }
    }
  }, [formData.name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dxf': ['.dxf'],
      'application/dwg': ['.dwg'],
      'application/octet-stream': ['.dxf', '.dwg'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CAD file to upload',
        variant: 'destructive',
      });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);
    uploadFormData.append('name', formData.name);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('categoryId', formData.categoryId);
    uploadFormData.append('region', formData.region);
    uploadFormData.append('state', formData.state);

    try {
      const drawing = await uploadDrawing(uploadFormData);
      toast({
        title: 'Upload successful',
        description: 'Your drawing has been uploaded and is being processed.',
      });
      router.push(`/dashboard/drawings/${drawing.id}`);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the drawing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Drawing</h1>
        <p className="text-slate-600 mt-2">Upload a new CAD drawing for validation and matching</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>Supported formats: DXF, DWG, PNG, JPG, JPEG, PDF</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the file here...</p>
                ) : (
                  <>
                    <p className="text-slate-700 font-medium mb-2">
                      Drag and drop your drawing file here, or click to browse
                    </p>
                    <p className="text-sm text-slate-500">
                      CAD files (.dxf, .dwg), Images (.png, .jpg, .jpeg), or PDFs up to 50MB
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      ✨ AI-powered: Images and PDFs will have parameters automatically extracted using OCR
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-slate-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drawing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Drawing Details</CardTitle>
            <CardDescription>Provide information about the drawing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Drawing Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., 2BHK Residential Plan"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Brief description of the drawing..."
                value={formData.description}
                onChange={handleChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  name="region"
                  placeholder="e.g., North India"
                  value={formData.region}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="e.g., Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !selectedFile}>
            {isLoading ? 'Uploading...' : 'Upload Drawing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
