import { CATEGORIES } from '@/config/categories';
import mongoose, { Document, Schema } from 'mongoose';

// Interface for Agency document
export interface IAgency extends Document {
    name: string;
    type: string;
    registrationNumber: string;
    website?: string;
    address: string;
    district: string;
    sector: string;
    description?: string;
    serviceDomains: string[];
    primaryOfficer: mongoose.Types.ObjectId; // Reference to User
    officers: mongoose.Types.ObjectId[]; // Array of User references
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    verificationNotes?: string;
    verifiedBy?: mongoose.Types.ObjectId; // Reference to admin who verified
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Agency Schema
const AgencySchema = new Schema<IAgency>({
    name: {
        type: String,
        required: [true, 'Agency name is required'],
        trim: true,
        minlength: [2, 'Agency name must be at least 2 characters'],
        maxlength: [200, 'Agency name cannot exceed 200 characters']
    },
    type: {
        type: String,
        required: [true, 'Agency type is required'],
        enum: [
            'government', 'municipal', 'state', 'federal', 
            'utility', 'transport', 'health', 'education', 
            'police', 'fire', 'environmental', 'private', 'ngo', 'other'
        ]
    },
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true
    },
    sector: {
        type: String,
        required: [true, 'Sector is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    serviceDomains: [{
        type: String,
        enum: CATEGORIES.map(cat => cat.name)
    }],
    primaryOfficer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Primary officer is required']
    },
    officers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verificationNotes: {
        type: String,
        trim: true
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            return ret;
        }
    }
});

// Indexes
AgencySchema.index({ primaryOfficer: 1 });
AgencySchema.index({ officers: 1 });
AgencySchema.index({ verificationStatus: 1 });
AgencySchema.index({ type: 1 });

// Prevent multiple agencies with same registration number
AgencySchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('registrationNumber')) {
        const existingAgency = await mongoose.model('Agency').findOne({ 
            registrationNumber: this.registrationNumber,
            _id: { $ne: this._id }
        });
        
        if (existingAgency) {
            throw new Error('An agency with this registration number already exists');
        }
    }
    next();
});

const Agency = mongoose.models.Agency || mongoose.model<IAgency>('Agency', AgencySchema);

export default Agency;
