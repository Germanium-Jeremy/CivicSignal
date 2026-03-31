// Unified category template configuration.
// This acts as a default template registry and can be overridden from the database per tenant.

export type IssueFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
export type IssueMediaType = 'image' | 'audio' | 'video';
export type IssueStatus = 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';
export type LocationPolicy = 'precise' | 'general' | 'optional';

export interface CategoryFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface CategoryField {
  name: string;
  label: string;
  type: IssueFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  validation?: CategoryFieldValidation;
}

export interface CategoryEvidenceRule {
  mediaType: IssueMediaType;
  minCount: number;
  maxCount: number;
  required?: boolean;
}

export interface CategoryWorkflow {
  initialStatus: IssueStatus;
  transitions: Record<IssueStatus, IssueStatus[]>;
  terminalStatuses: IssueStatus[];
}

export interface Category {
  id: string;
  slug: string;
  templateVersion: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResponseTime: string;
  slaHours: number;
  locationPolicy: LocationPolicy;
  requiredMedia: IssueMediaType[];
  evidenceRules: CategoryEvidenceRule[];
  fields: CategoryField[];
  workflow: CategoryWorkflow;
}

const DEFAULT_WORKFLOW: CategoryWorkflow = {
  initialStatus: 'submitted',
  transitions: {
    submitted: ['acknowledged', 'pending'],
    acknowledged: ['pending', 'resolved'],
    pending: ['acknowledged', 'resolved'],
    resolved: ['closed', 'pending'],
    closed: [],
  },
  terminalStatuses: ['closed'],
};

export const CATEGORIES: Category[] = [
  {
    id: 'infrastructure',
    slug: 'infrastructure',
    templateVersion: 1,
    name: 'Infrastructure',
    description: 'Roads, bridges, streetlights, and public works maintenance',
    icon: '🏗️',
    color: '#3B82F6',
    estimatedResponseTime: '5 days',
    slaHours: 120,
    locationPolicy: 'precise',
    requiredMedia: ['image'],
    evidenceRules: [{ mediaType: 'image', minCount: 1, maxCount: 8, required: true }],
    fields: [
      { name: 'assetId', label: 'Asset/Pole ID', type: 'text', required: false, placeholder: 'e.g., ST-1234' },
      { name: 'urgencyReason', label: 'Reason for Urgency', type: 'textarea', required: true, validation: { minLength: 10, maxLength: 500 } },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'permits-licensing',
    slug: 'permits-licensing',
    templateVersion: 1,
    name: 'Permits & Licensing',
    description: 'Construction permits, business licenses, and regulatory compliance',
    icon: '📋',
    color: '#8B5CF6',
    estimatedResponseTime: '2 days',
    slaHours: 48,
    locationPolicy: 'general',
    requiredMedia: [],
    evidenceRules: [],
    fields: [
      { name: 'permitNumber', label: 'Permit Number', type: 'text', required: false },
      { name: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['Retail', 'Service', 'Construction', 'Industrial'] },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'utilities',
    slug: 'utilities',
    templateVersion: 1,
    name: 'Utilities',
    description: 'Water, electricity, gas, and essential utility services',
    icon: '⚡',
    color: '#10B981',
    estimatedResponseTime: '24 hours',
    slaHours: 24,
    locationPolicy: 'precise',
    requiredMedia: ['image'],
    evidenceRules: [{ mediaType: 'image', minCount: 1, maxCount: 6, required: true }],
    fields: [
      { name: 'meterNumber', label: 'Meter Number', type: 'text', required: false },
      { name: 'utilityType', label: 'Utility Type', type: 'select', required: true, options: ['Water', 'Electricity', 'Gas', 'Sewage'] },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'waste-management',
    slug: 'waste-management',
    templateVersion: 1,
    name: 'Waste Management',
    description: 'Garbage collection, recycling, and waste disposal services',
    icon: '🗑️',
    color: '#059669',
    estimatedResponseTime: '3 days',
    slaHours: 72,
    locationPolicy: 'precise',
    requiredMedia: ['image'],
    evidenceRules: [{ mediaType: 'image', minCount: 1, maxCount: 6, required: true }],
    fields: [
      { name: 'binType', label: 'Bin Type', type: 'select', required: true, options: ['General', 'Recycling', 'Organic', 'Hazardous'] },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'transportation',
    slug: 'transportation',
    templateVersion: 1,
    name: 'Transportation',
    description: 'Public transit, traffic management, and transportation services',
    icon: '🚌',
    color: '#DC2626',
    estimatedResponseTime: '4 hours',
    slaHours: 4,
    locationPolicy: 'general',
    requiredMedia: [],
    evidenceRules: [],
    fields: [
      { name: 'routeNumber', label: 'Bus/Route Number', type: 'text', required: false },
      { name: 'delayDuration', label: 'Delay Duration (minutes)', type: 'number', required: false, validation: { min: 1, max: 720 } },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'emergency-services',
    slug: 'emergency-services',
    templateVersion: 1,
    name: 'Emergency Services',
    description: 'Police, fire, medical, and emergency response services',
    icon: '🚨',
    color: '#DC2626',
    priority: 'urgent',
    estimatedResponseTime: '2 hours',
    slaHours: 2,
    locationPolicy: 'precise',
    requiredMedia: ['image', 'audio'],
    evidenceRules: [
      { mediaType: 'image', minCount: 1, maxCount: 10, required: true },
      { mediaType: 'audio', minCount: 1, maxCount: 3, required: true },
      { mediaType: 'video', minCount: 0, maxCount: 2, required: false },
    ],
    fields: [
      { name: 'incidentType', label: 'Incident Type', type: 'select', required: true, options: ['Crime', 'Medical', 'Fire', 'Accident'] },
      { name: 'witnessCount', label: 'Witnesses', type: 'number', required: false, validation: { min: 0, max: 1000 } },
      { name: 'isWeaponInvolved', label: 'Weapon Involved?', type: 'boolean', required: true },
    ],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'parks-recreation',
    slug: 'parks-recreation',
    templateVersion: 1,
    name: 'Parks & Recreation',
    description: 'Public parks, recreational facilities, and community spaces',
    icon: '🌳',
    color: '#16A34A',
    estimatedResponseTime: '2 days',
    slaHours: 48,
    locationPolicy: 'precise',
    requiredMedia: ['image'],
    evidenceRules: [{ mediaType: 'image', minCount: 1, maxCount: 5, required: true }],
    fields: [{ name: 'parkName', label: 'Park Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 120 } }],
    workflow: DEFAULT_WORKFLOW,
  },
  {
    id: 'other-services',
    slug: 'other-services',
    templateVersion: 1,
    name: 'Other Services',
    description: 'Miscellaneous services not covered in other categories',
    icon: '📄',
    color: '#6B7280',
    estimatedResponseTime: '2 days',
    slaHours: 48,
    locationPolicy: 'optional',
    requiredMedia: [],
    evidenceRules: [],
    fields: [],
    workflow: DEFAULT_WORKFLOW,
  },
];

export function getCategoryByName(name: string): Category | undefined {
  const normalized = name.trim().toLowerCase();
  return CATEGORIES.find((cat) => cat.name.toLowerCase() === normalized || cat.slug.toLowerCase() === normalized || cat.id.toLowerCase() === normalized);
}

export function getCategoryById(id: string): Category | undefined {
  const normalized = id.trim().toLowerCase();
  return CATEGORIES.find((cat) => cat.id.toLowerCase() === normalized || cat.slug.toLowerCase() === normalized);
}

export function getAllCategoryNames(): string[] {
  return CATEGORIES.map((cat) => cat.name);
}

export function isValidCategory(categoryName: string): boolean {
  return !!getCategoryByName(categoryName);
}
