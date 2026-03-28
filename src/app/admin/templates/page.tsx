"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAPI } from "@/lib/api";
import type { Category, CategoryEvidenceRule, CategoryField, IssueStatus } from "@/config/categories";

const STATUS_OPTIONS: IssueStatus[] = ["submitted", "acknowledged", "pending", "resolved", "closed"];
const MEDIA_TYPES: Array<"image" | "audio" | "video"> = ["image", "audio", "video"];

function normalizeTemplate(template: Category): Category {
  return {
    ...template,
    requiredMedia: template.requiredMedia || [],
    evidenceRules: template.evidenceRules || [],
    fields: template.fields || [],
    workflow: {
      initialStatus: template.workflow?.initialStatus || "submitted",
      transitions: template.workflow?.transitions || {
        submitted: ["acknowledged", "pending"],
        acknowledged: ["pending", "resolved"],
        pending: ["acknowledged", "resolved"],
        resolved: ["closed", "pending"],
        closed: [],
      },
      terminalStatuses: template.workflow?.terminalStatuses || ["closed"],
    },
  };
}

function makeEmptyField(index: number): CategoryField {
  return {
    name: `field_${index}`,
    label: `Field ${index}`,
    type: "text",
    required: false,
    options: [],
    placeholder: "",
  };
}

function makeEmptyEvidenceRule(): CategoryEvidenceRule {
  return {
    mediaType: "image",
    minCount: 0,
    maxCount: 5,
    required: false,
  };
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Category[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  const selectedTemplate = useMemo(() => templates[selectedIndex], [templates, selectedIndex]);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      setMessage("");
      try {
        const response = await adminAPI.getCategoryTemplates();
        const categories = response?.data?.categories || [];
        setTemplates(categories.map(normalizeTemplate));
        setSelectedIndex(0);
      } catch {
        setMessage("Failed to load templates.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const updateSelectedTemplate = (updater: (template: Category) => Category) => {
    setTemplates((current) =>
      current.map((template, index) => (index === selectedIndex ? updater(template) : template))
    );
  };

  const saveTemplates = async () => {
    if (!templates.length) return;
    setIsSaving(true);
    setMessage("");
    try {
      await adminAPI.updateCategoryTemplates(templates);
      setMessage("Category templates saved successfully.");
    } catch {
      setMessage("Failed to save templates.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent2/30 border-t-accent2" />
        </div>
      </AdminLayout>
    );
  }

  if (!templates.length) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-almost-black">Template Builder</h1>
          <p className="mt-2 text-sm text-neutral-text">No templates available yet.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-almost-black">Category Template Builder</h1>
              <p className="text-sm text-neutral-text">
                Configure dynamic issue schemas, evidence requirements, and workflow rules.
              </p>
            </div>
            <button
              onClick={saveTemplates}
              disabled={isSaving}
              className="rounded-lg bg-accent2 px-4 py-2 text-sm font-semibold text-white hover:bg-accent2/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Templates"}
            </button>
          </div>
          {message ? <p className="mt-3 text-sm text-accent2">{message}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-neutral-text">Categories</p>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={`${template.slug}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedIndex === index
                      ? "border-accent2 bg-accent2/10 text-almost-black"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{template.icon} {template.name}</p>
                  <p className="text-xs text-neutral-text">{template.slug}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            {selectedTemplate ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-neutral-text">Name</span>
                    <input
                      value={selectedTemplate.name}
                      onChange={(e) =>
                        updateSelectedTemplate((template) => ({ ...template, name: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-neutral-text">Slug</span>
                    <input
                      value={selectedTemplate.slug}
                      onChange={(e) =>
                        updateSelectedTemplate((template) => ({ ...template, slug: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    <span className="mb-1 block text-neutral-text">Description</span>
                    <textarea
                      value={selectedTemplate.description}
                      onChange={(e) =>
                        updateSelectedTemplate((template) => ({ ...template, description: e.target.value }))
                      }
                      className="min-h-[84px] w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-neutral-text">SLA Hours</span>
                    <input
                      type="number"
                      min={1}
                      value={selectedTemplate.slaHours}
                      onChange={(e) =>
                        updateSelectedTemplate((template) => ({
                          ...template,
                          slaHours: Number(e.target.value || 1),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-neutral-text">Location Policy</span>
                    <select
                      value={selectedTemplate.locationPolicy}
                      onChange={(e) =>
                        updateSelectedTemplate((template) => ({
                          ...template,
                          locationPolicy: e.target.value as Category["locationPolicy"],
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <option value="precise">Precise</option>
                      <option value="general">General</option>
                      <option value="optional">Optional</option>
                    </select>
                  </label>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-almost-black">Evidence Rules</h2>
                    <button
                      onClick={() =>
                        updateSelectedTemplate((template) => ({
                          ...template,
                          evidenceRules: [...template.evidenceRules, makeEmptyEvidenceRule()],
                        }))
                      }
                      className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      Add Rule
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedTemplate.evidenceRules.map((rule, index) => (
                      <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-5">
                        <select
                          value={rule.mediaType}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              evidenceRules: template.evidenceRules.map((item, idx) =>
                                idx === index ? { ...item, mediaType: e.target.value as CategoryEvidenceRule["mediaType"] } : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                        >
                          <option value="image">Image</option>
                          <option value="audio">Audio</option>
                          <option value="video">Video</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={rule.minCount}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              evidenceRules: template.evidenceRules.map((item, idx) =>
                                idx === index ? { ...item, minCount: Number(e.target.value || 0) } : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min={0}
                          value={rule.maxCount}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              evidenceRules: template.evidenceRules.map((item, idx) =>
                                idx === index ? { ...item, maxCount: Number(e.target.value || 0) } : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                          placeholder="Max"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(rule.required)}
                            onChange={(e) =>
                              updateSelectedTemplate((template) => ({
                                ...template,
                                evidenceRules: template.evidenceRules.map((item, idx) =>
                                  idx === index ? { ...item, required: e.target.checked } : item
                                ),
                              }))
                            }
                          />
                          Required
                        </label>
                        <button
                          onClick={() =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              evidenceRules: template.evidenceRules.filter((_, idx) => idx !== index),
                            }))
                          }
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-semibold text-almost-black">Required Media</h2>
                  <div className="flex flex-wrap gap-2">
                    {MEDIA_TYPES.map((mediaType) => {
                      const checked = selectedTemplate.requiredMedia.includes(mediaType);
                      return (
                        <label key={mediaType} className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              updateSelectedTemplate((template) => ({
                                ...template,
                                requiredMedia: e.target.checked
                                  ? [...new Set([...template.requiredMedia, mediaType])]
                                  : template.requiredMedia.filter((item) => item !== mediaType),
                              }))
                            }
                          />
                          <span className="capitalize">{mediaType}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-almost-black">Dynamic Fields</h2>
                    <button
                      onClick={() =>
                        updateSelectedTemplate((template) => ({
                          ...template,
                          fields: [...template.fields, makeEmptyField(template.fields.length + 1)],
                        }))
                      }
                      className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      Add Field
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedTemplate.fields.map((field, index) => (
                      <div key={`${field.name}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-6">
                        <input
                          value={field.name}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              fields: template.fields.map((item, idx) =>
                                idx === index ? { ...item, name: e.target.value } : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                          placeholder="Key"
                        />
                        <input
                          value={field.label}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              fields: template.fields.map((item, idx) =>
                                idx === index ? { ...item, label: e.target.value } : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                          placeholder="Label"
                        />
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              fields: template.fields.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      type: e.target.value as CategoryField["type"],
                                      options: e.target.value === "select" ? item.options || [] : undefined,
                                    }
                                  : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="boolean">Boolean</option>
                          <option value="select">Select</option>
                        </select>
                        <input
                          value={field.type === "select" ? (field.options || []).join(", ") : ""}
                          onChange={(e) =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              fields: template.fields.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      options:
                                        item.type === "select"
                                          ? e.target.value
                                              .split(",")
                                              .map((option) => option.trim())
                                              .filter(Boolean)
                                          : undefined,
                                    }
                                  : item
                              ),
                            }))
                          }
                          className="rounded border border-gray-200 px-2 py-1"
                          placeholder="Options (comma separated)"
                          disabled={field.type !== "select"}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateSelectedTemplate((template) => ({
                                ...template,
                                fields: template.fields.map((item, idx) =>
                                  idx === index ? { ...item, required: e.target.checked } : item
                                ),
                              }))
                            }
                          />
                          Required
                        </label>
                        <button
                          onClick={() =>
                            updateSelectedTemplate((template) => ({
                              ...template,
                              fields: template.fields.filter((_, idx) => idx !== index),
                            }))
                          }
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-semibold text-almost-black">Workflow Transitions</h2>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.map((status) => {
                      const selected = selectedTemplate.workflow.transitions?.[status] || [];
                      return (
                        <div key={status} className="rounded-lg border border-gray-200 p-3">
                          <p className="mb-2 text-sm font-semibold capitalize">{status}</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((candidate) => {
                              const checked = selected.includes(candidate);
                              return (
                                <label key={candidate} className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) =>
                                      updateSelectedTemplate((template) => {
                                        const current = template.workflow.transitions?.[status] || [];
                                        const next = e.target.checked
                                          ? [...new Set([...current, candidate])]
                                          : current.filter((item) => item !== candidate);
                                        return {
                                          ...template,
                                          workflow: {
                                            ...template.workflow,
                                            transitions: {
                                              ...template.workflow.transitions,
                                              [status]: next,
                                            },
                                          },
                                        };
                                      })
                                    }
                                  />
                                  <span className="capitalize">{candidate}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
