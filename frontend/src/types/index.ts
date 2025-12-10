export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'head_architect' | 'architect' | 'user';
  organization?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Drawing {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  uploaderId: string;
  filePath: string;
  thumbnailPath?: string;
  region?: string;
  state?: string;
  validationScore: number;
  status: 'pending' | 'processing' | 'validated' | 'rejected';
  validationResults?: any;
  viewCount: number;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
  category?: DrawingCategory;
  uploader?: User;
  parameters?: DrawingParameter[];
}

export interface DrawingCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingParameter {
  id: string;
  drawingId: string;
  parameterName: string;
  parameterValue: string;
  unit?: string;
  dataType: 'numeric' | 'text' | 'boolean' | 'json';
  isCustom: boolean;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  region: string;
  state: string;
  city?: string;
  ruleType: 'setback' | 'open_space' | 'height' | 'far' | 'coverage' | 'parking' | 'ventilation' | 'staircase' | 'custom';
  ruleConfig: any;
  priority: number;
  isActive: boolean;
  applicableCategory?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  drawing: Drawing;
  metadata: any;
  matchScore: number;
  matchDetails: {
    geometricScore: number;
    parameterScore: number;
    layoutScore: number;
    complianceScore: number;
  };
  similarities: string[];
  differences: string[];
}

export interface LayoutSuggestion {
  drawingId: string;
  name: string;
  description: string;
  matchScore: number;
  popularity: number;
  thumbnail?: string;
  reasons: string[];
}

export interface ValidationReport {
  drawingId: string;
  overallScore: number;
  passed: boolean;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  ruleResults: RuleEvaluationResult[];
  summary: {
    violations: string[];
    suggestions: string[];
    criticalIssues: string[];
  };
}

export interface RuleEvaluationResult {
  ruleName: string;
  ruleId: string;
  passed: boolean;
  score: number;
  details: string;
  violations: string[];
  suggestions: string[];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
