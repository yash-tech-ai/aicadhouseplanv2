'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CAD House Plan Manager</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          AI-Powered CAD Drawing Management
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Upload, validate, and match architectural drawings with intelligent AI assistance.
          Ensure compliance with regional building codes automatically.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <FileText className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Standard Drawings Library</h3>
            <p className="text-slate-600">
              Upload and manage standard CAD drawings with automatic parameter extraction
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Automated Validation</h3>
            <p className="text-slate-600">
              Validate drawings against state and region-specific building codes
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Intelligent Matching</h3>
            <p className="text-slate-600">
              Find similar drawings with advanced AI-powered matching algorithms
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Building2 className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Design Suggestions</h3>
            <p className="text-slate-600">
              Get intelligent layout suggestions based on plot parameters
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>&copy; 2024 CAD House Plan Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
