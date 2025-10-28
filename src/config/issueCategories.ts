// Issue Categories Configuration
// Predefined categories for issue reporting

export interface IssueCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name or emoji
  color: string; // Hex color for UI
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: string; // Human-readable format
  relatedAgencyTypes?: string[]; // Which agency types handle this
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  {
    id: 'roads_infrastructure',
    name: 'Roads & Infrastructure',
    description: 'Potholes, damaged roads, broken sidewalks, road signs',
    icon: '🛣️',
    color: '#FF6B6B',
    priority: 'medium',
    estimatedResponseTime: '3-7 days',
    relatedAgencyTypes: ['Municipal Corporation', 'Road Authority'],
  },
  {
    id: 'street_lighting',
    name: 'Street Lighting',
    description: 'Broken street lights, dark areas, faulty lighting',
    icon: '💡',
    color: '#FFA500',
    priority: 'medium',
    estimatedResponseTime: '2-5 days',
    relatedAgencyTypes: ['Municipal Corporation', 'Utility Company'],
  },
  {
    id: 'water_supply',
    name: 'Water Supply',
    description: 'Water leaks, no water supply, contaminated water, burst pipes',
    icon: '💧',
    color: '#4ECDC4',
    priority: 'high',
    estimatedResponseTime: '1-3 days',
    relatedAgencyTypes: ['Water Authority', 'Municipal Corporation'],
  },
  {
    id: 'sanitation_waste',
    name: 'Sanitation & Waste',
    description: 'Overflowing garbage, uncollected waste, blocked drains',
    icon: '🗑️',
    color: '#95E1D3',
    priority: 'medium',
    estimatedResponseTime: '1-2 days',
    relatedAgencyTypes: ['Sanitation Department', 'Municipal Corporation'],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    description: 'Power outages, damaged poles, exposed wires',
    icon: '⚡',
    color: '#FFD93D',
    priority: 'high',
    estimatedResponseTime: '1-2 days',
    relatedAgencyTypes: ['Electricity Board', 'Utility Company'],
  },
  {
    id: 'public_safety',
    name: 'Public Safety',
    description: 'Dangerous structures, unsafe areas, security concerns',
    icon: '🚨',
    color: '#E74C3C',
    priority: 'urgent',
    estimatedResponseTime: '< 24 hours',
    relatedAgencyTypes: ['Police', 'Municipal Corporation', 'Fire Department'],
  },
  {
    id: 'parks_recreation',
    name: 'Parks & Recreation',
    description: 'Damaged park equipment, overgrown vegetation, maintenance needs',
    icon: '🌳',
    color: '#6BCF7F',
    priority: 'low',
    estimatedResponseTime: '7-14 days',
    relatedAgencyTypes: ['Parks Department', 'Municipal Corporation'],
  },
  {
    id: 'traffic_parking',
    name: 'Traffic & Parking',
    description: 'Traffic signal issues, illegal parking, road congestion',
    icon: '🚦',
    color: '#3498DB',
    priority: 'medium',
    estimatedResponseTime: '2-5 days',
    relatedAgencyTypes: ['Traffic Police', 'Municipal Corporation'],
  },
  {
    id: 'public_transport',
    name: 'Public Transport',
    description: 'Bus stop issues, damaged shelters, transit problems',
    icon: '🚌',
    color: '#9B59B6',
    priority: 'low',
    estimatedResponseTime: '5-10 days',
    relatedAgencyTypes: ['Transport Authority', 'Municipal Corporation'],
  },
  {
    id: 'environmental',
    name: 'Environmental Issues',
    description: 'Pollution, illegal dumping, environmental hazards',
    icon: '🌍',
    color: '#27AE60',
    priority: 'medium',
    estimatedResponseTime: '3-7 days',
    relatedAgencyTypes: ['Environmental Protection', 'Municipal Corporation'],
  },
  {
    id: 'stray_animals',
    name: 'Stray Animals',
    description: 'Stray dogs, animal safety concerns',
    icon: '🐕',
    color: '#F39C12',
    priority: 'medium',
    estimatedResponseTime: '2-5 days',
    relatedAgencyTypes: ['Animal Control', 'Municipal Corporation'],
  },
  {
    id: 'noise_pollution',
    name: 'Noise Pollution',
    description: 'Excessive noise, loud events, disturbances',
    icon: '🔊',
    color: '#E67E22',
    priority: 'low',
    estimatedResponseTime: '1-3 days',
    relatedAgencyTypes: ['Police', 'Municipal Corporation'],
  },
  {
    id: 'illegal_construction',
    name: 'Illegal Construction',
    description: 'Unauthorized construction, zoning violations',
    icon: '🏗️',
    color: '#C0392B',
    priority: 'medium',
    estimatedResponseTime: '5-10 days',
    relatedAgencyTypes: ['Building Department', 'Municipal Corporation'],
  },
  {
    id: 'public_property',
    name: 'Public Property Damage',
    description: 'Vandalism, damaged public property, graffiti',
    icon: '🏛️',
    color: '#8E44AD',
    priority: 'low',
    estimatedResponseTime: '7-14 days',
    relatedAgencyTypes: ['Municipal Corporation', 'Police'],
  },
  {
    id: 'other',
    name: 'Other Issues',
    description: 'Issues not covered in other categories',
    icon: '📋',
    color: '#95A5A6',
    priority: 'low',
    estimatedResponseTime: '5-10 days',
    relatedAgencyTypes: ['Municipal Corporation'],
  },
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): IssueCategory | undefined {
  return ISSUE_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Get category by name
 */
export function getCategoryByName(name: string): IssueCategory | undefined {
  return ISSUE_CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds(): string[] {
  return ISSUE_CATEGORIES.map(cat => cat.id);
}

/**
 * Get all category names
 */
export function getAllCategoryNames(): string[] {
  return ISSUE_CATEGORIES.map(cat => cat.name);
}

/**
 * Validate if a category exists
 */
export function isValidCategory(categoryId: string): boolean {
  return ISSUE_CATEGORIES.some(cat => cat.id === categoryId);
}

/**
 * Get categories by priority
 */
export function getCategoriesByPriority(priority: IssueCategory['priority']): IssueCategory[] {
  return ISSUE_CATEGORIES.filter(cat => cat.priority === priority);
}

/**
 * Get categories for a specific agency type
 */
export function getCategoriesForAgency(agencyType: string): IssueCategory[] {
  return ISSUE_CATEGORIES.filter(cat => 
    cat.relatedAgencyTypes?.some(type => 
      type.toLowerCase().includes(agencyType.toLowerCase())
    )
  );
}
