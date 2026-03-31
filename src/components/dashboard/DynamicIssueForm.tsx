"use client";

import React, { useState } from "react";
import { CATEGORIES, Category, CategoryField } from "@/config/categories";
import { issueAPI } from "@/lib/api";
import { 
  Camera, 
  Mic, 
  Video, 
  MapPin, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DynamicIssueFormProps {
  onSuccess?: (issueId: string) => void;
}

export default function DynamicIssueForm({ onSuccess }: DynamicIssueFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    customFields: {},
    location: null,
  });
  const [media, setMedia] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationInput, setLocationInput] = useState<{
    latitude?: number;
    longitude?: number;
    address?: string;
    district?: string;
    sector?: string;
  }>({});

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep(2);
    setLocationInput({});
    setMedia([]);
    // Initialize custom fields
    const initialFields: any = {};
    category.fields.forEach(field => {
      initialFields[field.name] = field.type === 'boolean' ? false : "";
    });
    setFormData((prev: any) => ({ ...prev, customFields: initialFields }));
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(prev => [...prev, {
          data: reader.result as string,
          mimeType: file.type,
          mediaType: type,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const getSupportedMediaTypes = (category: Category) => {
    const byRules = (category.evidenceRules || []).map((rule) => rule.mediaType);
    const merged = [...byRules, ...(category.requiredMedia || [])];
    return Array.from(new Set(merged));
  };

  const validateEvidenceBeforeSubmit = () => {
    if (!selectedCategory) return { valid: false, error: "Category is required" };
    const errors: string[] = [];
    for (const rule of selectedCategory.evidenceRules || []) {
      const count = media.filter((item) => item.mediaType === rule.mediaType).length;
      if (rule.minCount !== undefined && count < rule.minCount) {
        errors.push(`At least ${rule.minCount} ${rule.mediaType} file(s) required`);
      }
      if (rule.maxCount !== undefined && count > rule.maxCount) {
        errors.push(`No more than ${rule.maxCount} ${rule.mediaType} file(s) allowed`);
      }
    }
    return { valid: errors.length === 0, error: errors.join(", ") };
  };

  const detectLocation = () => {
    if (!navigator?.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationInput((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success("Location captured.");
        setIsLocating(false);
      },
      () => {
        toast.error("Unable to get your location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const evidenceValidation = validateEvidenceBeforeSubmit();
      if (!evidenceValidation.valid) {
        throw new Error(evidenceValidation.error);
      }

      const requiresPreciseLocation = selectedCategory.locationPolicy === "precise";
      const hasCoordinates = typeof locationInput.latitude === "number" && typeof locationInput.longitude === "number";
      const hasManualLocation = Boolean(locationInput.address || locationInput.district || locationInput.sector);
      if (requiresPreciseLocation && !hasCoordinates) {
        throw new Error("This category requires precise location coordinates.");
      }
      if (selectedCategory.locationPolicy === "general" && !hasCoordinates && !hasManualLocation) {
        throw new Error("Please provide location coordinates or area details.");
      }

      // 1. Upload Media
      let uploadedMedia = [];
      if (media.length > 0) {
        toast.loading("Uploading evidence...", { id: "submit-issue" });
        const uploadResponse = await issueAPI.uploadPhotos(media.map(m => ({
          data: m.data,
          mimeType: m.mimeType
        })));
        
        if (uploadResponse.success) {
          uploadedMedia = uploadResponse.data.map((url: string, i: number) => ({
            url,
            mediaType: media[i].mediaType,
            mimeType: media[i].mimeType,
            size: media[i].size
          }));
        } else {
          throw new Error("Media upload failed");
        }
      }

      // 2. Create Issue
      toast.loading("Creating report...", { id: "submit-issue" });
      const payload = {
        title: formData.title || `${selectedCategory.name} Report`,
        description: formData.description,
        category: selectedCategory.name,
        customFields: formData.customFields,
        media: uploadedMedia,
        location: hasCoordinates
          ? {
              latitude: locationInput.latitude,
              longitude: locationInput.longitude,
              address: locationInput.address,
              district: locationInput.district,
              sector: locationInput.sector,
            }
          : hasManualLocation
          ? {
              address: locationInput.address,
              district: locationInput.district,
              sector: locationInput.sector,
            }
          : undefined,
        deviceInfo: {
          deviceId: "web-portal", // Placeholder
          platform: "web",
        },
        source: "web" as const,
      };

      const response = await issueAPI.createIssue(payload);

      if (response.success) {
        toast.success("Issue reported successfully!", { id: "submit-issue" });
        if (onSuccess) {
          onSuccess(response.data._id);
        } else {
          router.push(`/dashboard/issues/reported`);
        }
      } else {
        throw new Error(response.error || "Failed to create issue");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: "submit-issue" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Category</h2>
            <p className="text-gray-500 mb-8">Choose the type of issue you'd like to report.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat)}
                  className="group flex items-center p-4 border-2 border-gray-50 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: `${cat.color}15` }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedCategory && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center mb-6">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-lg mr-2 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name} Details</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">SLA: {selectedCategory.estimatedResponseTime}</span>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {selectedCategory.fields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  {selectedCategory.fields.map((field) => (
                    <div key={field.name} className={field.type === 'boolean' ? 'flex items-center pt-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        {field.type === 'text' && <Type size={14} className="text-gray-400" />}
                        {field.type === 'number' && <Hash size={14} className="text-gray-400" />}
                        {field.type === 'select' && <List size={14} className="text-gray-400" />}
                        {field.type === 'date' && <Calendar size={14} className="text-gray-400" />}
                        {field.type === 'boolean' && <CheckSquare size={14} className="text-gray-400" />}
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={formData.customFields[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <input
                          type="checkbox"
                          checked={formData.customFields[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          className="ml-2 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      ) : field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          rows={3}
                          value={formData.customFields[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          required={field.required}
                          value={formData.customFields[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            </form>
          </div>
        )}

        {step === 3 && selectedCategory && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center mb-6">
              <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-100 rounded-lg mr-2 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Evidence & Location</h2>
            </div>

            <div className="space-y-8">
              {/* Media Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Attach Evidence</label>
                <div className="grid grid-cols-3 gap-4">
                  {getSupportedMediaTypes(selectedCategory).includes('image') && (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-500">Add Photo</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                    </label>
                  )}
                  {getSupportedMediaTypes(selectedCategory).includes('audio') && (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                      <Mic className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-500">Voice Note</span>
                      <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileChange(e, 'audio')} />
                    </label>
                  )}
                  {getSupportedMediaTypes(selectedCategory).includes('video') && (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                      <Video className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-500">Add Video</span>
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                    </label>
                  )}
                </div>

                {media.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {media.map((item, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                        {item.mediaType === 'image' ? (
                          <img src={item.data} className="w-full h-full object-cover" />
                        ) : item.mediaType === 'audio' ? (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center"><Mic size={24} className="text-blue-500" /></div>
                        ) : (
                          <div className="w-full h-full bg-purple-100 flex items-center justify-center"><Video size={24} className="text-purple-500" /></div>
                        )}
                        <button 
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Policy */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-bold text-blue-900">Location Requirement</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  {selectedCategory.locationPolicy === 'precise' 
                    ? "Precise GPS location is required for this report to help the agency locate the issue."
                    : selectedCategory.locationPolicy === 'general'
                    ? "General area or district information is sufficient for this type of report."
                    : "Providing location is optional for this category."}
                </p>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-bold rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  {isLocating ? "Detecting..." : "Detect Location"}
                </button>
                {(selectedCategory.locationPolicy === "general" || selectedCategory.locationPolicy === "optional") && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <input
                      value={locationInput.address || ""}
                      onChange={(e) => setLocationInput((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      value={locationInput.district || ""}
                      onChange={(e) => setLocationInput((prev) => ({ ...prev, district: e.target.value }))}
                      placeholder="District"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      value={locationInput.sector || ""}
                      onChange={(e) => setLocationInput((prev) => ({ ...prev, sector: e.target.value }))}
                      placeholder="Sector"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
                {typeof locationInput.latitude === "number" && typeof locationInput.longitude === "number" && (
                  <p className="mt-3 text-sm text-blue-700">
                    Coordinates: {locationInput.latitude.toFixed(6)}, {locationInput.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Submit Report
                    <Send size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
