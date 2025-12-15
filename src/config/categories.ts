// Unified Categories Configuration
// Consolidates issue categories and service domains for consistency across platforms

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  serviceDomain: ServiceDomain;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: string;
}

export type ServiceDomain = 
  | 'infrastructure'
  | 'permits' 
  | 'utilities'
  | 'waste'
  | 'transport'
  | 'emergency'
  | 'parks'
  | 'other';

// Service domain configuration
export const SERVICE_DOMAINS: Record<ServiceDomain, { name: string; description: string; icon: string; color: string }> = {
  infrastructure: {
    name: 'Infrastructure',
    description: 'Roads, bridges, public works, and infrastructure maintenance',
    icon: '🏗️',
    color: '#3B82F6'
  },
  permits: {
    name: 'Permits & Licensing',
    description: 'Construction permits, business licenses, and regulatory compliance',
    icon: '📋',
    color: '#8B5CF6'
  },
  utilities: {
    name: 'Utilities',
    description: 'Water, electricity, gas, and essential utility services',
    icon: '⚡',
    color: '#10B981'
  },
  waste: {
    name: 'Waste Management',
    description: 'Garbage collection, recycling, and waste disposal services',
    icon: '🗑️',
    color: '#059669'
  },
  transport: {
    name: 'Transportation',
    description: 'Public transit, traffic management, and transportation services',
    icon: '🚌',
    color: '#DC2626'
  },
  emergency: {
    name: 'Emergency Services',
    description: 'Police, fire, medical, and emergency response services',
    icon: '🚨',
    color: '#DC2626'
  },
  parks: {
    name: 'Parks & Recreation',
    description: 'Public parks, recreational facilities, and community spaces',
    icon: '🌳',
    color: '#16A34A'
  },
  other: {
    name: 'Other Services',
    description: 'Miscellaneous services not covered in other categories',
    icon: '📄',
    color: '#6B7280'
  }
};

// Unified categories mapping to service domains
export const CATEGORIES: Category[] = [
  // Infrastructure
  {
    id: 'roads_infrastructure',
    name: 'Roads & Infrastructure',
    description: 'Potholes, damaged roads, broken sidewalks, road signs',
    icon: '🛣️',
    color: '#FF6B6B',
    serviceDomain: 'infrastructure',
    priority: 'medium',
    estimatedResponseTime: '3-7 days'
  },
  {
    id: 'street_lighting',
    name: 'Street Lighting',
    description: 'Broken street lights, dark areas, faulty lighting',
    icon: '💡',
    color: '#FFA500',
    serviceDomain: 'infrastructure',
    priority: 'medium',
    estimatedResponseTime: '2-5 days'
  },
  {
    id: 'public_property',
    name: 'Public Property Damage',
    description: 'Vandalism, damaged public property, graffiti',
    icon: '🏛️',
    color: '#8E44AD',
    serviceDomain: 'infrastructure',
    priority: 'low',
    estimatedResponseTime: '7-14 days'
  },
  {
    id: 'illegal_construction',
    name: 'Illegal Construction',
    description: 'Unauthorized construction, zoning violations',
    icon: '🏗️',
    color: '#C0392B',
    serviceDomain: 'permits',
    priority: 'medium',
    estimatedResponseTime: '5-10 days'
  },

  // Utilities
  {
    id: 'water_supply',
    name: 'Water Supply',
    description: 'Water leaks, no water supply, contaminated water, burst pipes',
    icon: '💧',
    color: '#4ECDC4',
    serviceDomain: 'utilities',
    priority: 'high',
    estimatedResponseTime: '1-3 days'
  },
  {
    id: 'electricity',
    name: 'Electricity',
    description: 'Power outages, damaged poles, exposed wires',
    icon: '⚡',
    color: '#FFD93D',
    serviceDomain: 'utilities',
    priority: 'high',
    estimatedResponseTime: '1-2 days'
  },

  // Waste Management
  {
    id: 'sanitation_waste',
    name: 'Sanitation & Waste',
    description: 'Overflowing garbage, uncollected waste, blocked drains',
    icon: '🗑️',
    color: '#95E1D3',
    serviceDomain: 'waste',
    priority: 'medium',
    estimatedResponseTime: '1-2 days'
  },

  // Transportation
  {
    id: 'traffic_parking',
    name: 'Traffic & Parking',
    description: 'Traffic signal issues, illegal parking, road congestion',
    icon: '🚦',
    color: '#3498DB',
    serviceDomain: 'transport',
    priority: 'medium',
    estimatedResponseTime: '2-5 days'
  },
  {
    id: 'public_transport',
    name: 'Public Transport',
    description: 'Bus stop issues, damaged shelters, transit problems',
    icon: '🚌',
    color: '#9B59B6',
    serviceDomain: 'transport',
    priority: 'low',
    estimatedResponseTime: '5-10 days'
  },

  // Safety & Emergency
  {
    id: 'public_safety',
    name: 'Public Safety',
    description: 'Dangerous structures, unsafe areas, security concerns',
    icon: '🚨',
    color: '#E74C3C',
    serviceDomain: 'emergency',
    priority: 'urgent',
    estimatedResponseTime: '< 24 hours'
  },
  {
    id: 'stray_animals',
    name: 'Stray Animals',
    description: 'Stray dogs, animal safety concerns',
    icon: '🐕',
    color: '#F39C12',
    serviceDomain: 'emergency',
    priority: 'medium',
    estimatedResponseTime: '2-5 days'
  },
  {
    id: 'noise_pollution',
    name: 'Noise Pollution',
    description: 'Excessive noise, loud events, disturbances',
    icon: '🔊',
    color: '#E67E22',
    serviceDomain: 'emergency',
    priority: 'low',
    estimatedResponseTime: '1-3 days'
  },

  // Parks & Recreation
  {
    id: 'parks_recreation',
    name: 'Parks & Recreation',
    description: 'Damaged park equipment, overgrown vegetation, maintenance needs',
    icon: '🌳',
    color: '#6BCF7F',
    serviceDomain: 'parks',
    priority: 'low',
    estimatedResponseTime: '7-14 days'
  },

  // Environmental
  {
    id: 'environmental',
    name: 'Environmental Issues',
    description: 'Pollution, illegal dumping, environmental hazards',
    icon: '🌍',
    color: '#27AE60',
    serviceDomain: 'other',
    priority: 'medium',
    estimatedResponseTime: '3-7 days'
  },

  // Other
  {
    id: 'other',
    name: 'Other Issues',
    description: 'Issues not covered in other categories',
    icon: '📋',
    color: '#95A5A6',
    serviceDomain: 'other',
    priority: 'low',
    estimatedResponseTime: '5-10 days'
  }
];

// Helper functions
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

export function getCategoriesByServiceDomain(serviceDomain: ServiceDomain): Category[] {
  return CATEGORIES.filter(cat => cat.serviceDomain === serviceDomain);
}

export function getAllServiceDomains(): ServiceDomain[] {
  return Object.keys(SERVICE_DOMAINS) as ServiceDomain[];
}

export function getServiceDomainInfo(serviceDomain: ServiceDomain) {
  return SERVICE_DOMAINS[serviceDomain];
}

export function getAllCategoryIds(): string[] {
  return CATEGORIES.map(cat => cat.id);
}

export function getAllCategoryNames(): string[] {
  return CATEGORIES.map(cat => cat.name);
}

export function isValidCategory(categoryId: string): boolean {
  return CATEGORIES.some(cat => cat.id === categoryId);
}

export function getCategoriesByPriority(priority: Category['priority']): Category[] {
  return CATEGORIES.filter(cat => cat.priority === priority);
}
