import mongoose, { Document, Schema, Model } from 'mongoose';

export type IssueStatus = 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';

export interface ILocation {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    district?: string;
    sector?: string;
}

export interface IIssueMedia {
    url: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    size: number;
    mimeType: string;
    mediaType: 'image' | 'audio' | 'video';
}

export interface IIssueActivity {
    action: IssueStatus | 'status_changed' | 'sla_breached' | 'assigned' | 'submitted';
    description: string;
    performedBy: mongoose.Types.ObjectId;
    performedByModel: 'User' | 'Agency';
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface IWorkflowTransition {
    fromStatus?: IssueStatus;
    toStatus: IssueStatus;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;
    changedByModel: 'User' | 'Agency';
    comment?: string;
}

export interface IDeviceInfo {
    deviceId: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    registeredAt: Date;
}

export interface IIssue extends Document {
    tenantId: string;
    tenantSlug?: string;

    trackingNumber: string;
    title: string;
    description?: string;
    category: string;
    categoryTemplateId?: string;
    categoryTemplateVersion?: number;

    priority: 'High' | 'Medium' | 'Low';
    status: IssueStatus;

    location?: ILocation;
    media: IIssueMedia[];
    customFields: Record<string, any>;
    reportMarkdown?: string;

    slaDeadline?: Date;
    slaStatus: 'within_sla' | 'at_risk' | 'breached';

    reportedBy: mongoose.Types.ObjectId;
    reporterDevice: IDeviceInfo;
    isVerifiedReporter: boolean;

    assignedAgency?: mongoose.Types.ObjectId;
    assignedOfficer?: mongoose.Types.ObjectId;
    assignedAt?: Date;

    submittedAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;

    activities: IIssueActivity[];
    workflowHistory: IWorkflowTransition[];

    isPublic: boolean;
    showOnMap: boolean;

    viewCount: number;
    upvoteCount: number;
    upvotedBy: mongoose.Types.ObjectId[];

    resolutionNotes?: string;
    resolutionMedia: IIssueMedia[];

    source: 'web' | 'mobile' | 'ios' | 'android' | 'api';
    tags?: string[];
    metadata?: Record<string, any>;

    createdAt: Date;
    updatedAt: Date;

    addActivity: (
        action: IIssueActivity['action'],
        description: string,
        performedBy: mongoose.Types.ObjectId,
        performedByModel?: 'User' | 'Agency',
        metadata?: Record<string, any>
    ) => void;

    changeStatus: (
        newStatus: IssueStatus,
        performedBy: mongoose.Types.ObjectId,
        performedByModel?: 'User' | 'Agency',
        notes?: string
    ) => Promise<void>;
}

const MediaSchema = new Schema(
    {
        url: { type: String, required: true },
        thumbnailUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        size: { type: Number, default: 0 },
        mimeType: String,
        mediaType: {
            type: String,
            enum: ['image', 'audio', 'video'],
            default: 'image',
        },
    },
    { _id: false }
);

const IssueSchema = new Schema<IIssue>(
    {
        tenantId: {
            type: String,
            default: 'public',
            index: true,
            trim: true,
        },
        tenantSlug: {
            type: String,
            trim: true,
        },
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
            maxlength: 5000,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        categoryTemplateId: String,
        categoryTemplateVersion: Number,
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium',
            index: true,
        },
        status: {
            type: String,
            enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'],
            default: 'submitted',
            index: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: false,
            },
            coordinates: {
                type: [Number],
                required: false,
                validate: {
                    validator: function (this: any, coords: number[]) {
                        if (!coords || coords.length === 0) return true;
                        return (
                            coords.length === 2 &&
                            coords[0] >= -180 &&
                            coords[0] <= 180 &&
                            coords[1] >= -90 &&
                            coords[1] <= 90
                        );
                    },
                    message: 'Invalid coordinates format',
                },
            },
            address: String,
            district: String,
            sector: String,
        },
        media: {
            type: [MediaSchema],
            default: [],
        },
        customFields: {
            type: Schema.Types.Mixed,
            default: {},
        },
        reportMarkdown: {
            type: String,
            maxlength: 20000,
        },
        slaDeadline: Date,
        slaStatus: {
            type: String,
            enum: ['within_sla', 'at_risk', 'breached'],
            default: 'within_sla',
            index: true,
        },
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        reporterDevice: {
            deviceId: { type: String, required: true },
            deviceModel: String,
            osVersion: String,
            appVersion: String,
            registeredAt: { type: Date, default: Date.now },
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
        activities: [
            {
                action: {
                    type: String,
                    enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed', 'status_changed', 'sla_breached', 'assigned'],
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
            },
        ],
        workflowHistory: [
            {
                fromStatus: {
                    type: String,
                    enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'],
                },
                toStatus: {
                    type: String,
                    enum: ['submitted', 'acknowledged', 'pending', 'resolved', 'closed'],
                    required: true,
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                changedBy: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                changedByModel: {
                    type: String,
                    enum: ['User', 'Agency'],
                    required: true,
                },
                comment: String,
            },
        ],
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
        upvotedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        resolutionNotes: String,
        resolutionMedia: {
            type: [MediaSchema],
            default: [],
        },
        source: {
            type: String,
            enum: ['web', 'mobile', 'ios', 'android', 'api'],
            default: 'web',
        },
        tags: [String],
        metadata: Schema.Types.Mixed,
    },
    {
        timestamps: true,
    }
);

IssueSchema.index({ tenantId: 1, location: '2dsphere' });
IssueSchema.index({ tenantId: 1, reportedBy: 1, status: 1 });
IssueSchema.index({ tenantId: 1, assignedAgency: 1, status: 1 });
IssueSchema.index({ tenantId: 1, category: 1, status: 1 });
IssueSchema.index({ tenantId: 1, submittedAt: -1 });
IssueSchema.index({ 'reporterDevice.deviceId': 1 });

IssueSchema.virtual('formattedTrackingNumber').get(function () {
    return this.trackingNumber;
});

IssueSchema.methods.addActivity = function (
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

IssueSchema.methods.changeStatus = async function (
    newStatus: IssueStatus,
    performedBy: mongoose.Types.ObjectId,
    performedByModel: 'User' | 'Agency' = 'User',
    notes?: string
) {
    const oldStatus = this.status;
    this.status = newStatus;

    const now = new Date();
    if (newStatus === 'acknowledged') this.acknowledgedAt = now;
    if (newStatus === 'resolved') this.resolvedAt = now;
    if (newStatus === 'closed') this.closedAt = now;

    this.workflowHistory.push({
        fromStatus: oldStatus,
        toStatus: newStatus,
        changedAt: now,
        changedBy: performedBy,
        changedByModel: performedByModel,
        comment: notes,
    });

    this.addActivity(
        'status_changed',
        `Status changed from ${oldStatus} to ${newStatus}${notes ? `: ${notes}` : ''}`,
        performedBy,
        performedByModel,
        { oldStatus, newStatus }
    );

    await this.save();
};

IssueSchema.statics.generateTrackingNumber = async function (): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `CS-Issue-${yyyy}-${mm}-${dd}`;

    const lastIssue = await this.findOne({
        trackingNumber: new RegExp(`^${prefix}-`),
    })
        .sort({ trackingNumber: -1 })
        .lean();

    let sequenceNumber = 1;
    if (lastIssue && typeof lastIssue.trackingNumber === 'string') {
        const parts = lastIssue.trackingNumber.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) sequenceNumber = lastSeq + 1;
    }

    return `${prefix}-${String(sequenceNumber).padStart(4, '0')}`;
};

IssueSchema.statics.findNearby = function (
    longitude: number,
    latitude: number,
    maxDistanceInMeters: number = 1000,
    tenantId: string = 'public'
) {
    return this.find({
        tenantId,
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

IssueSchema.pre('validate', async function (next) {
    if (this.isNew && !this.trackingNumber) {
        this.trackingNumber = await (this.constructor as any).generateTrackingNumber();
    }
    next();
});

const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);

export default Issue;
