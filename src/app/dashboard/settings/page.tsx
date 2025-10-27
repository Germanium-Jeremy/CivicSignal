"use client";
import { useState } from "react";
import { 
    FaCog, 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaLock,
    FaEye,
    FaEyeSlash,
    FaSave,
    FaTimes,
    FaEdit,
    FaTrash,
    FaExclamationTriangle,
    FaBell,
    FaShieldAlt,
    FaDatabase,
    FaDownload,
    FaCheckCircle
} from "react-icons/fa";

// Mock current user data
const mockUserData = {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@citymunicorp.gov",
    phone: "+1-555-0123",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const mockNotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    issueUpdates: true,
    systemAlerts: true,
    weeklyReports: false
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(mockUserData);
    const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNotificationChange = (setting: string, value: boolean) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleSaveAccount = () => {
        console.log("Saving account settings:", userData);
        setIsEditing(false);
    };

    const handleSaveNotifications = () => {
        console.log("Saving notification settings:", notificationSettings);
    };

    const handlePasswordChange = () => {
        if (userData.newPassword !== userData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        console.log("Changing password");
        setIsChangingPassword(false);
        setUserData(prev => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }));
    };

    const handleExportData = () => {
        console.log("Exporting user data");
        // This would trigger a data export
    };

    const handleDeleteData = () => {
        console.log("Deleting saved data");
        setShowDeleteConfirm(false);
    };

    const validatePassword = (password: string) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        return requirements;
    };

    const passwordRequirements = validatePassword(userData.newPassword);
    const isPasswordValid = Object.values(passwordRequirements).every(req => req);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Settings</h1>
                    <p className="text-neutral-text mt-1">
                        Manage your account preferences and security settings
                    </p>
                </div>
            </div>

            {/* Settings Container */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray">
                {/* Tab Navigation */}
                <div className="flex border-b border-light-gray overflow-x-auto">
                    {[
                        { id: "account", label: "Account Info", icon: FaUser },
                        { id: "security", label: "Security", icon: FaShieldAlt },
                        { id: "notifications", label: "Notifications", icon: FaBell },
                        { id: "data", label: "Data & Privacy", icon: FaDatabase }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'text-accent2 border-b-2 border-accent2'
                                        : 'text-neutral-text hover:text-accent2'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Account Info Tab */}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-almost-black">Account Information</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                    >
                                        <FaEdit size={14} />
                                        Edit Info
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveAccount}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                        >
                                            <FaSave size={14} />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-red-300 hover:text-red-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                        >
                                            <FaTimes size={14} />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-almost-black mb-2">
                                            First Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={userData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2">
                                                <FaUser className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{userData.firstName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-almost-black mb-2">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={userData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2">
                                                <FaEnvelope className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{userData.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-almost-black mb-2">
                                            Last Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={userData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2">
                                                <FaUser className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{userData.lastName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-almost-black mb-2">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={userData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 p-2">
                                                <FaPhone className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{userData.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-almost-black">Security Settings</h3>
                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                    >
                                        <FaLock size={14} />
                                        Change Password
                                    </button>
                                )}
                            </div>

                            {isChangingPassword && (
                                <div className="bg-light-gray/30 rounded-xl p-6 border border-light-gray">
                                    <h4 className="font-semibold text-almost-black mb-4">Change Password</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={userData.currentPassword}
                                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                    className="w-full px-4 py-2 pr-12 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text hover:text-accent2"
                                                >
                                                    {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={userData.newPassword}
                                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                    className="w-full px-4 py-2 pr-12 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text hover:text-accent2"
                                                >
                                                    {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={userData.confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                    className="w-full px-4 py-2 pr-12 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-text hover:text-accent2"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Requirements */}
                                        {userData.newPassword && (
                                            <div className="bg-white rounded-lg p-4 border border-light-gray">
                                                <h5 className="font-medium text-almost-black mb-3">Password Requirements</h5>
                                                <div className="space-y-2">
                                                    {[
                                                        { key: 'length', label: 'At least 8 characters', met: passwordRequirements.length },
                                                        { key: 'uppercase', label: 'One uppercase letter', met: passwordRequirements.uppercase },
                                                        { key: 'lowercase', label: 'One lowercase letter', met: passwordRequirements.lowercase },
                                                        { key: 'number', label: 'One number', met: passwordRequirements.number },
                                                        { key: 'special', label: 'One special character', met: passwordRequirements.special }
                                                    ].map((req) => (
                                                        <div key={req.key} className="flex items-center gap-2">
                                                            <FaCheckCircle 
                                                                className={req.met ? 'text-green-500' : 'text-gray-300'} 
                                                                size={14} 
                                                            />
                                                            <span className={`text-sm ${req.met ? 'text-green-700' : 'text-neutral-text'}`}>
                                                                {req.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handlePasswordChange}
                                                disabled={!isPasswordValid || userData.newPassword !== userData.confirmPassword}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Update Password
                                            </button>
                                            <button
                                                onClick={() => setIsChangingPassword(false)}
                                                className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-red-300 hover:text-red-600 transition-colors duration-300 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Information */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <FaShieldAlt className="text-blue-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-blue-800">Security Tips</h4>
                                        <ul className="text-blue-700 text-sm mt-2 space-y-1">
                                            <li>• Use a strong, unique password for your account</li>
                                            <li>• Never share your login credentials with others</li>
                                            <li>• Log out from shared or public computers</li>
                                            <li>• Report any suspicious activity immediately</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-almost-black">Notification Preferences</h3>
                                <button
                                    onClick={handleSaveNotifications}
                                    className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                >
                                    <FaSave size={14} />
                                    Save Preferences
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Communication Methods */}
                                <div>
                                    <h4 className="font-semibold text-almost-black mb-4">Communication Methods</h4>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                                            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
                                            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between p-4 bg-light-gray/30 rounded-lg">
                                                <div>
                                                    <h5 className="font-medium text-almost-black">{setting.label}</h5>
                                                    <p className="text-sm text-neutral-text">{setting.description}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                                        onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent2/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent2"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notification Types */}
                                <div>
                                    <h4 className="font-semibold text-almost-black mb-4">Notification Types</h4>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'issueUpdates', label: 'Issue Updates', description: 'Get notified when issues are updated or resolved' },
                                            { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications and maintenance alerts' },
                                            { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly summary reports of activities' }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between p-4 bg-light-gray/30 rounded-lg">
                                                <div>
                                                    <h5 className="font-medium text-almost-black">{setting.label}</h5>
                                                    <p className="text-sm text-neutral-text">{setting.description}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                                        onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent2/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent2"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Privacy Tab */}
                    {activeTab === "data" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-almost-black">Data & Privacy</h3>

                            {/* Export Data */}
                            <div className="bg-light-gray/30 rounded-xl p-6 border border-light-gray">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FaDownload className="text-blue-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-almost-black mb-2">Export Your Data</h4>
                                        <p className="text-neutral-text text-sm mb-4">
                                            Download a copy of all your data including profile information, issue reports, and activity history.
                                        </p>
                                        <button
                                            onClick={handleExportData}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                        >
                                            <FaDownload size={14} />
                                            Export Data
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Saved Data */}
                            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <FaTrash className="text-yellow-600" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-almost-black mb-2">Delete Saved Data</h4>
                                        <p className="text-neutral-text text-sm mb-4">
                                            Remove your saved preferences, cached data, and temporary files. This will not delete your account or profile information.
                                        </p>
                                        {!showDeleteConfirm ? (
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                                            >
                                                <FaTrash size={14} />
                                                Delete Saved Data
                                            </button>
                                        ) : (
                                            <div className="bg-white rounded-lg p-4 border border-yellow-300">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FaExclamationTriangle className="text-yellow-600" size={16} />
                                                    <span className="font-medium text-almost-black">Confirm Data Deletion</span>
                                                </div>
                                                <p className="text-sm text-neutral-text mb-4">
                                                    Are you sure you want to delete your saved data? This action cannot be undone.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleDeleteData}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                                                    >
                                                        Yes, Delete Data
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-accent2 hover:text-accent2 transition-colors duration-300 text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Information */}
                            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaShieldAlt className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-800 mb-2">Your Privacy Matters</h4>
                                        <div className="text-green-700 text-sm space-y-2">
                                            <p>• Your personal information is encrypted and securely stored</p>
                                            <p>• We never share your data with third parties without consent</p>
                                            <p>• You have full control over your data and can export or delete it anytime</p>
                                            <p>• All data processing complies with privacy regulations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
