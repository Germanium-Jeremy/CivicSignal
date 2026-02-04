import mongoose, { Document, Model, Schema } from 'mongoose';
import { CategoryField, CategoryEvidenceRule, CategoryWorkflow, LocationPolicy } from '@/config/categories';

export interface IIssueCategoryTemplate extends Document {
  tenantId: string;
  tenantSlug?: string;
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
  requiredMedia: ('image' | 'audio' | 'video')[];
  evidenceRules: CategoryEvidenceRule[];
  fields: CategoryField[];
  workflow: CategoryWorkflow;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FieldValidationSchema = new Schema(
  {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
  },
  { _id: false }
);

const CategoryFieldSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'boolean', 'textarea'],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    placeholder: String,
    helpText: String,
    validation: FieldValidationSchema,
  },
  { _id: false }
);

const EvidenceRuleSchema = new Schema(
  {
    mediaType: {
      type: String,
      enum: ['image', 'audio', 'video'],
      required: true,
    },
    minCount: { type: Number, default: 0, min: 0 },
    maxCount: { type: Number, default: 10, min: 0 },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkflowSchema = new Schema(
  {
    initialStatus: {
      type: String,
      enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'],
      required: true,
      default: 'submitted',
    },
    transitions: {
      type: Map,
      of: [{ type: String, enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'] }],
      default: {},
    },
    terminalStatuses: [{ type: String, enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'] }],
  },
  { _id: false }
);

const IssueCategoryTemplateSchema = new Schema<IIssueCategoryTemplate>(
  {
    tenantId: { type: String, required: true, index: true, trim: true },
    tenantSlug: { type: String, trim: true },
    id: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    templateVersion: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: '📄' },
    color: { type: String, default: '#6B7280' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    estimatedResponseTime: { type: String, required: true },
    slaHours: { type: Number, required: true, min: 1 },
    locationPolicy: {
      type: String,
      enum: ['precise', 'general', 'optional'],
      default: 'optional',
    },
    requiredMedia: [{ type: String, enum: ['image', 'audio', 'video'] }],
    evidenceRules: { type: [EvidenceRuleSchema], default: [] },
    fields: { type: [CategoryFieldSchema], default: [] },
    workflow: { type: WorkflowSchema, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

IssueCategoryTemplateSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
IssueCategoryTemplateSchema.index({ tenantId: 1, name: 1 });

const IssueCategoryTemplate: Model<IIssueCategoryTemplate> =
  mongoose.models.IssueCategoryTemplate || mongoose.model<IIssueCategoryTemplate>('IssueCategoryTemplate', IssueCategoryTemplateSchema);

export default IssueCategoryTemplate;

