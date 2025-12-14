// Mapping between issue categories and agency service domains

// Agency service domains from Agency model
export type AgencyServiceDomain = 
  | 'infrastructure' 
  | 'utilities' 
  | 'waste' 
  | 'transport' 
  | 'safety' 
  | 'health' 
  | 'environment' 
  | 'housing' 
  | 'education' 
  | 'social' 
  | 'permits' 
  | 'taxation' 
  | 'emergency' 
  | 'parks' 
  | 'other';

// Simplified mapping of actual issue categories to service domains
export const CATEGORY_TO_SERVICE_DOMAIN: Record<string, AgencyServiceDomain> = {
  // Infrastructure
  'roads_infrastructure': 'infrastructure',
  'street_lighting': 'infrastructure',
  'public_property': 'infrastructure',
  'illegal_construction': 'permits',
  
  // Utilities
  'water_supply': 'utilities',
  'electricity': 'utilities',
  
  // Waste
  'sanitation_waste': 'waste',
  
  // Transport
  'traffic_parking': 'transport',
  'public_transport': 'transport',
  
  // Safety
  'public_safety': 'safety',
  
  // Environment
  'environmental': 'environment',
  'noise_pollution': 'environment',
  
  // Parks
  'parks_recreation': 'parks',
  
  // Other
  'stray_animals': 'other',
};

// Helper function to get service domain for a category
export function getServiceDomainForCategory(categoryId: string): AgencyServiceDomain {
  return CATEGORY_TO_SERVICE_DOMAIN[categoryId] || 'other';
}

// Helper function to get all categories that belong to a service domain
export function getCategoriesForServiceDomain(serviceDomain: AgencyServiceDomain): string[] {
  return Object.entries(CATEGORY_TO_SERVICE_DOMAIN)
    .filter(([_, domain]) => domain === serviceDomain)
    .map(([categoryId]) => categoryId);
}

// Helper function to check if a category belongs to any of the agency's service domains
export function isCategoryInAgencyServiceDomains(categoryId: string, agencyServiceDomains: AgencyServiceDomain[]): boolean {
  const serviceDomain = getServiceDomainForCategory(categoryId);
  return agencyServiceDomains.includes(serviceDomain);
}
