'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ValidationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rule Validation</h1>
        <p className="text-slate-600 mt-2">
          Validate drawings against regional building codes
        </p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">Validation Dashboard</h3>
          <p className="text-slate-600">
            Coming soon - Manage and view validation rules and results
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
