import User from '@/models/User';
import Issue from '@/models/Issue';
import connectDB from '../mongodb';

export interface DeviceInfo {
    deviceId: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
}

/**
 * Verify if the device ID matches the one registered during user registration
 * This helps prevent scam reports from fake accounts
 */
export async function verifyDevice(userId: string, deviceInfo: DeviceInfo): Promise<{ isVerified: boolean; reason?: string; trustScore: number; }> {
    try {
        await connectDB();
    
        const user = await User.findById(userId);
    
        if (!user) {
            return {
                isVerified: false,
                reason: 'User not found',
                trustScore: 0,
            };
        }
    
    // Check if user has a registered device
    const registeredDevice = user.registeredDevices?.find(
        (device: any) => device.deviceId === deviceInfo.deviceId
    );
    
    if (!registeredDevice) {
        // Device not registered - could be a new device or suspicious
        return {
            isVerified: false,
            reason: 'Device not registered with this account',
            trustScore: 30, // Low trust, but not zero (user might have a new device)
        };
    }
    
    // Calculate trust score based on various factors
    let trustScore = 100;
    
    // Factor 1: How long has the device been registered?
    const daysSinceRegistration = Math.floor(
        (Date.now() - registeredDevice.registeredAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRegistration < 1) {
        trustScore -= 20; // New device, slightly suspicious
    } else if (daysSinceRegistration < 7) {
        trustScore -= 10; // Recent device
    }
    
    // Factor 2: Check user's issue history
    const userIssues = await Issue.find({ reportedBy: userId });
    const recentIssues = userIssues.filter(
        (issue: any) => Date.now() - issue.submittedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    // Penalize if user has reported too many issues recently (potential spam)
    if (recentIssues.length > 10) {
        trustScore -= 40;
    } else if (recentIssues.length > 5) {
        trustScore -= 20;
    }
    
    // Factor 3: Check for multiple devices from same user (suspicious if > 3)
    if (user.registeredDevices && user.registeredDevices.length > 3) {
        trustScore -= 15;
    }
    
    // Factor 4: User verification status
    if (!user.isEmailVerified) {
        trustScore -= 20;
    }
    if (!user.isPhoneVerified) {
        trustScore -= 20;
    }
    
    // Ensure score stays in valid range
    trustScore = Math.max(0, Math.min(100, trustScore));
    
    return {
        isVerified: trustScore >= 60, // Consider verified if trust score >= 60
        trustScore,
        reason: trustScore < 60 ? 'Low trust score' : undefined,
    };
    
  } catch (error) {
    console.error('Device verification error:', error);
    return {
        isVerified: false,
        reason: 'Verification error',
        trustScore: 0,
    };
  }
}

/**
 * Register a new device for a user
 */
export async function registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    
    if (!user) {
        return false;
    }
    
    // Initialize registeredDevices if it doesn't exist
    if (!user.registeredDevices) {
        user.registeredDevices = [];
    }
    
    // Check if device is already registered
    const existingDevice = user.registeredDevices.find(
        (device: any) => device.deviceId === deviceInfo.deviceId
    );
    
    if (existingDevice) {
        // Update device info
        existingDevice.deviceModel = deviceInfo.deviceModel;
        existingDevice.osVersion = deviceInfo.osVersion;
        existingDevice.appVersion = deviceInfo.appVersion;
        existingDevice.lastUsed = new Date();
    } else {
        // Add new device
        user.registeredDevices.push({
            deviceId: deviceInfo.deviceId,
            deviceModel: deviceInfo.deviceModel,
            osVersion: deviceInfo.osVersion,
            appVersion: deviceInfo.appVersion,
            registeredAt: new Date(),
            lastUsed: new Date(),
        });
    }
    
    await user.save();
    return true;
    
    } catch (error) {
        console.error('Device registration error:', error);
        return false;
    }
}

/**
 * Get device information for a user
 */
export async function getUserDevices(userId: string): Promise<any[]> {
    try {
        await connectDB();
    
        const user = await User.findById(userId);
    
        if (!user || !user.registeredDevices) {
            return [];
        }
    
        return user.registeredDevices;
    
    } catch (error) {
        console.error('Get user devices error:', error);
        return [];
    }
}

/**
 * Check if user has reached daily issue submission limit
 * Helps prevent spam and abuse
 */
export async function checkSubmissionLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date; }> {
    try {
        await connectDB();
    
        const MAX_DAILY_SUBMISSIONS = 200; // Maximum issues per day per user
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayIssues = await Issue.countDocuments({
            reportedBy: userId,
            submittedAt: {
                $gte: today,
                $lt: tomorrow,
            },
        });
    
        const remaining = Math.max(0, MAX_DAILY_SUBMISSIONS - todayIssues);
    
        return {
            allowed: remaining > 0,
            remaining,
            resetAt: tomorrow,
        };
    
    } catch (error) {
        console.error('Check submission limit error:', error);
        return {
            allowed: true, // Allow on error to not block legitimate users
            remaining: 1,
            resetAt: new Date(),
        };
    }
}
