import { CATEGORIES, Category, CategoryField, IssueMediaType, IssueStatus } from '@/config/categories';
import IssueCategoryTemplate from '@/models/IssueCategoryTemplate';

type UnknownRecord = Record<string, unknown>;

function asPlainTemplate(template: any): Category {
  return {
    id: template.id,
    slug: template.slug,
    templateVersion: template.templateVersion || 1,
    name: template.name,
    description: template.description,
    icon: template.icon,
    color: template.color,
    priority: template.priority,
    estimatedResponseTime: template.estimatedResponseTime,
    slaHours: template.slaHours,
    locationPolicy: template.locationPolicy,
    requiredMedia: template.requiredMedia || [],
    evidenceRules: template.evidenceRules || [],
    fields: template.fields || [],
    workflow: template.workflow,
  };
}

export async function getCategoryTemplates(tenantId: string): Promise<Category[]> {
  const dbTemplates = await IssueCategoryTemplate.find({
    tenantId,
    isActive: true,
  })
    .sort({ name: 1 })
    .lean();

  if (!dbTemplates.length) {
    return CATEGORIES;
  }

  return dbTemplates.map(asPlainTemplate);
}

export async function getCategoryTemplateByName(input: string, tenantId: string): Promise<Category | undefined> {
  const normalized = input.trim().toLowerCase();
  const templates = await getCategoryTemplates(tenantId);
  return templates.find(
    (template) =>
      template.name.toLowerCase() === normalized ||
      template.slug.toLowerCase() === normalized ||
      template.id.toLowerCase() === normalized
  );
}

export function validateCustomFields(fieldsConfig: CategoryField[], incomingCustomFields: UnknownRecord = {}) {
  const errors: string[] = [];
  const sanitizedFields: Record<string, unknown> = {};

  for (const field of fieldsConfig) {
    const rawValue = incomingCustomFields[field.name];

    if (field.required && (rawValue === null || rawValue === undefined || rawValue === '')) {
      errors.push(`Field "${field.label}" is required`);
      continue;
    }

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }

    if (field.type === 'number') {
      const parsed = Number(rawValue);
      if (Number.isNaN(parsed)) {
        errors.push(`Field "${field.label}" must be a number`);
        continue;
      }

      if (field.validation?.min !== undefined && parsed < field.validation.min) {
        errors.push(`Field "${field.label}" must be at least ${field.validation.min}`);
        continue;
      }

      if (field.validation?.max !== undefined && parsed > field.validation.max) {
        errors.push(`Field "${field.label}" must be at most ${field.validation.max}`);
        continue;
      }

      sanitizedFields[field.name] = parsed;
      continue;
    }

    if (field.type === 'boolean') {
      sanitizedFields[field.name] = Boolean(rawValue);
      continue;
    }

    if (field.type === 'select') {
      const normalized = String(rawValue).trim();
      const options = field.options || [];
      if (options.length && !options.includes(normalized)) {
        errors.push(`Field "${field.label}" has an invalid value`);
        continue;
      }
      sanitizedFields[field.name] = normalized;
      continue;
    }

    const normalized = String(rawValue).trim();
    if (field.validation?.minLength !== undefined && normalized.length < field.validation.minLength) {
      errors.push(`Field "${field.label}" must be at least ${field.validation.minLength} characters`);
      continue;
    }

    if (field.validation?.maxLength !== undefined && normalized.length > field.validation.maxLength) {
      errors.push(`Field "${field.label}" must be at most ${field.validation.maxLength} characters`);
      continue;
    }

    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(normalized)) {
        errors.push(`Field "${field.label}" has an invalid format`);
        continue;
      }
    }

    sanitizedFields[field.name] = normalized;
  }

  return { valid: errors.length === 0, errors, sanitizedFields };
}

export function validateEvidenceRules(
  evidenceRules: Category['evidenceRules'],
  media: Array<{ mediaType?: IssueMediaType }>
) {
  const errors: string[] = [];
  const counts: Record<IssueMediaType, number> = { image: 0, audio: 0, video: 0 };

  for (const item of media) {
    const type = item.mediaType || 'image';
    counts[type] += 1;
  }

  for (const rule of evidenceRules) {
    const count = counts[rule.mediaType] || 0;

    if (rule.required && count < Math.max(1, rule.minCount || 0)) {
      errors.push(`At least ${Math.max(1, rule.minCount || 0)} ${rule.mediaType} file(s) are required`);
    }

    if (rule.minCount !== undefined && count < rule.minCount) {
      errors.push(`At least ${rule.minCount} ${rule.mediaType} file(s) are required`);
    }

    if (rule.maxCount !== undefined && count > rule.maxCount) {
      errors.push(`No more than ${rule.maxCount} ${rule.mediaType} file(s) are allowed`);
    }
  }

  return { valid: errors.length === 0, errors, counts };
}

export function validateLocationForPolicy(
  locationPolicy: Category['locationPolicy'],
  location:
    | {
        latitude?: number;
        longitude?: number;
        address?: string;
        district?: string;
        sector?: string;
      }
    | undefined
) {
  if (locationPolicy === 'optional') {
    return { valid: true, error: null as string | null };
  }

  const hasCoordinates =
    location &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude);

  if (locationPolicy === 'precise' && !hasCoordinates) {
    return { valid: false, error: 'Precise location coordinates are required for this category' };
  }

  if (locationPolicy === 'general') {
    const hasManualContext = Boolean(location?.address || location?.district || location?.sector);
    if (!hasCoordinates && !hasManualContext) {
      return { valid: false, error: 'Location context is required (coordinates or district/address)' };
    }
  }

  return { valid: true, error: null as string | null };
}

export function calculateSlaDeadline(slaHours: number): Date {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + Math.max(1, slaHours));
  return deadline;
}

export function isWorkflowTransitionAllowed(workflow: Category['workflow'], fromStatus: IssueStatus, toStatus: IssueStatus): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = workflow.transitions?.[fromStatus] || [];
  return allowed.includes(toStatus);
}

