// Unified Categories Configuration
// Consolidates issue categories and service domains for consistency across platforms

export interface Category {
  name: string;
  description: string;
  icon: string;
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: string;
}

// Service domain configuration
export const CATEGORIES: Category[] = [
  {
    name: 'Infrastructure',
    description: 'Roads, bridges, public works, and infrastructure maintenance',
    icon: '🏗️',
    color: '#3B82F6',
    estimatedResponseTime: '2-5 days',
  }, {
    name: 'Permits & Licensing',
    description: 'Construction permits, business licenses, and regulatory compliance',
    icon: '📋',
    color: '#8B5CF6',
    estimatedResponseTime: '1-2 days',
  }, {
    name: 'Utilities',
    description: 'Water, electricity, gas, and essential utility services',
    icon: '⚡',
    color: '#10B981',
    estimatedResponseTime: '1-2 days',
  }, {
    name: 'Waste Management',
    description: 'Garbage collection, recycling, and waste disposal services',
    icon: '🗑️',
    color: '#059669',
    estimatedResponseTime: '1-3 days',
  }, {
    name: 'Transportation',
    description: 'Public transit, traffic management, and transportation services',
    icon: '🚌',
    color: '#DC2626',
    estimatedResponseTime: '2-4 hours',
  }, {
    name: 'Emergency Services',
    description: 'Police, fire, medical, and emergency response services',
    icon: '🚨',
    color: '#DC2626',
    estimatedResponseTime: '1-2 hours',
  }, {
    name: 'Parks & Recreation',
    description: 'Public parks, recreational facilities, and community spaces',
    icon: '🌳',
    color: '#16A34A',
    estimatedResponseTime: '1-2 days',
  }, {
    name: 'Other Services',
    description: 'Miscellaneous services not covered in other categories',
    icon: '📄',
    color: '#6B7280',
    estimatedResponseTime: '1-2 days',
  }
]

// Helper functions
export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}


export function getAllCategoryNames(): string[] {
  return CATEGORIES.map(cat => cat.name);
}

export function isValidCategory(categoryName: string): boolean {
  return CATEGORIES.some(cat => cat.name === categoryName);
}
