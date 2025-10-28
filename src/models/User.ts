import mongoose, { Document, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationCode?: string;
  phoneVerificationCode?: string;
  emailVerificationExpires?: Date;
  phoneVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  loginDevices: {
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    location?: string;
    lastLogin: Date;
    isActive: boolean;
  }[];
  registeredDevices?: {
    deviceId: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    registeredAt: Date;
    lastUsed: Date;
  }[];
  isActive: boolean;
  role: 'citizen' | 'agency_officer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    select: false
  },
  phoneVerificationCode: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  phoneVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  refreshTokens: [{
    type: String,
    select: false
  }],
  loginDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceName: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    location: String,
    lastLogin: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  registeredDevices: [{
    deviceId: {
      type: String,
      required: false
    },
    deviceModel: String,
    osVersion: String,
    appVersion: String,
    registeredAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['citizen', 'agency_officer', 'admin'],
    default: 'citizen'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
    const { password, emailVerificationCode, phoneVerificationCode, passwordResetToken, refreshTokens, ...rest } = ret;
    return rest;
    }
  }
});

// Indexes for better performance
UserSchema.index({ emailVerificationCode: 1 });
UserSchema.index({ passwordResetToken: 1 });

// Export model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
