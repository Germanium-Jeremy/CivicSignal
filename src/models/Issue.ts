import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for Location
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  district?: string;
  sector?: string;
}

// Interface for Issue Photo
export interface IIssuePhoto {
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
}

// Interface for Issue Update/Activity
export interface IIssueActivity {
  action: 'submitted' | 'acknowledged' | 'pending' | 'resolved';
  description: string;
  performedBy: mongoose.Types.ObjectId;
  performedByModel: 'User' | 'Agency';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Interface for Device Info (for verification)
export interface IDeviceInfo {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  registeredAt: Date;
}

// Main Issue Interface
export interface IIssue extends Document {
  // Tracking Information
  trackingNumber: string;
  
  // Basic Information
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'acknowledged' | 'pending' | 'resolved';
  
  // Location Information
  location: ILocation;
  
  // Media
  photos: IIssuePhoto[];
  
  // Reporter Information
  reportedBy: mongoose.Types.ObjectId; // Reference to User
  reporterDevice: IDeviceInfo;
  isVerifiedReporter: boolean;
  
  // Assignment Information
  assignedAgency?: mongoose.Types.ObjectId; // Reference to Agency
  assignedOfficer?: mongoose.Types.ObjectId; // Reference to User
  assignedAt?: Date;
  
  // Timestamps
  submittedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Activity Log
  activities: IIssueActivity[];
  
  // Public visibility
  isPublic: boolean;
  showOnMap: boolean;
  
  // Statistics
  viewCount: number;
  upvoteCount: number;
  upvotedBy: mongoose.Types.ObjectId[];
  
  // Resolution
  resolutionNotes?: string;
  resolutionPhotos: IIssuePhoto[];
  
  // Metadata
  tags?: string[];
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Issue Schema
const IssueSchema = new Schema<IIssue>(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    
    category: {
      type: String,
      required: true,
      index: true,
    },
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'pending', 'resolved'],
      default: 'submitted',
      index: true,
    },
    
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function(coords: number[]) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;      // latitude
          },
          message: 'Invalid coordinates format',
        },
      },
      address: String,
      district: String,
      sector: String,
    },
    
    photos: [{
      url: {
        type: String,
        required: true,
      },
      thumbnailUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      size: Number,
      mimeType: String,
    }],
    
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    reporterDevice: {
      deviceId: {
        type: String,
        required: true,
      },
      deviceModel: String,
      osVersion: String,
      appVersion: String,
      registeredAt: {
        type: Date,
        default: Date.now,
      },
    },
    
    isVerifiedReporter: {
      type: Boolean,
      default: false,
    },
    
    assignedAgency: {
      type: Schema.Types.ObjectId,
      ref: 'Agency',
      index: true,
    },
    
    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    
    assignedAt: Date,
    
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    
    acknowledgedAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    
    activities: [{
      action: {
        type: String,
        enum: ['submitted', 'acknowledged', 'pending', 'resolved'],
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      performedBy: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      performedByModel: {
        type: String,
        enum: ['User', 'Agency'],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      metadata: Schema.Types.Mixed,
    }],
    
    isPublic: {
      type: Boolean,
      default: true,
    },
    
    showOnMap: {
      type: Boolean,
      default: true,
    },
    
    viewCount: {
      type: Number,
      default: 0,
    },
    
    upvoteCount: {
      type: Number,
      default: 0,
    },
    
    upvotedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    resolutionNotes: String,
    
    resolutionPhotos: [{
      url: {
        type: String,
        required: true,
      },
      thumbnailUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      size: Number,
      mimeType: String,
    }],
    
    tags: [String],
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
IssueSchema.index({ location: '2dsphere' }); // Geospatial index for location queries
IssueSchema.index({ trackingNumber: 1 });
IssueSchema.index({ reportedBy: 1, status: 1 });
IssueSchema.index({ assignedAgency: 1, status: 1 });
IssueSchema.index({ category: 1, status: 1 });
IssueSchema.index({ submittedAt: -1 });
IssueSchema.index({ 'reporterDevice.deviceId': 1 });

// Virtual for formatted tracking number
IssueSchema.virtual('formattedTrackingNumber').get(function() {
  return this.trackingNumber;
});

// Method to add activity
IssueSchema.methods.addActivity = function(
  action: IIssueActivity['action'],
  description: string,
  performedBy: mongoose.Types.ObjectId,
  performedByModel: 'User' | 'Agency' = 'User',
  metadata?: Record<string, any>
) {
  this.activities.push({
    action,
    description,
    performedBy,
    performedByModel,
    timestamp: new Date(),
    metadata,
  });
};

// Method to change status
IssueSchema.methods.changeStatus = async function(
  newStatus: IIssue['status'],
  performedBy: mongoose.Types.ObjectId,
  notes?: string
) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Update relevant timestamp
  switch (newStatus) {
    case 'acknowledged':
      this.acknowledgedAt = new Date();
      break;
    case 'resolved':
      this.resolvedAt = new Date();
      break;
    case 'pending':
      this.pendingAt = new Date();
      break;
    case 'submitted':
      this.submittedAt = new Date();
      break;
  }
  
  // Add activity
  this.addActivity(
    'status_changed',
    `Status changed from ${oldStatus} to ${newStatus}${notes ? ': ' + notes : ''}`,
    performedBy,
    'User'
  );
  
  await this.save();
};

// Static method to generate tracking number
IssueSchema.statics.generateTrackingNumber = async function(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'CS';
  
  // Find the last tracking number for this year
  const lastIssue = await this.findOne({
    trackingNumber: new RegExp(`^${prefix}-${year}-`),
  }).sort({ trackingNumber: -1 });
  
  let sequenceNumber = 1;
  
  if (lastIssue) {
    const parts = lastIssue.trackingNumber.split('-');
    sequenceNumber = parseInt(parts[2]) + 1;
  }
  
  // Format: CS-2024-0001
  return `${prefix}-${year}-${String(sequenceNumber).padStart(4, '0')}`;
};

// Static method to find nearby issues
IssueSchema.statics.findNearby = function(
  longitude: number,
  latitude: number,
  maxDistanceInMeters: number = 1000
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceInMeters,
      },
    },
  });
};

// Pre-save hook
IssueSchema.pre('save', async function(next) {
  // Generate tracking number if new
  if (this.isNew && !this.trackingNumber) {
    this.trackingNumber = await (this.constructor as any).generateTrackingNumber();
  }
  
  next();
});

// Export the model
const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);

export default Issue;
