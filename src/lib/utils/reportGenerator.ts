import { getCategoryByName } from '@/config/categories';

function formatDate(value: string | Date | undefined): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

function toDisplayValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return 'Not provided';
  return String(value);
}

export function generateIssueMarkdown(issue: any): string {
  const categoryInfo = getCategoryByName(issue.category);
  const submittedDate = formatDate(issue.submittedAt || issue.createdAt);
  const slaDeadline = formatDate(issue.slaDeadline);

  let markdown = '# Civic Signal - Official Issue Report\n\n';
  markdown += `## Reference: ${issue.trackingNumber || issue._id}\n`;
  markdown += `**Status:** ${(issue.status || 'unknown').toUpperCase()} | **Priority:** ${(issue.priority || 'medium').toUpperCase()}\n`;
  markdown += `**Category:** ${issue.category || 'Unknown'} | **Submitted:** ${submittedDate}\n\n`;
  markdown += '---\n\n';

  markdown += '### Description\n';
  markdown += `${issue.description || 'No description provided.'}\n\n`;

  if (issue.customFields && Object.keys(issue.customFields).length > 0) {
    markdown += '### Category-Specific Details\n';
    Object.entries(issue.customFields).forEach(([key, value]) => {
      const fieldConfig = categoryInfo?.fields.find((field) => field.name === key);
      const label = fieldConfig ? fieldConfig.label : key;
      markdown += `- **${label}:** ${toDisplayValue(value)}\n`;
    });
    markdown += '\n';
  }

  markdown += '### Location Context\n';
  if (issue.location?.coordinates?.length === 2) {
    const [longitude, latitude] = issue.location.coordinates;
    markdown += `- **Coordinates:** ${latitude}, ${longitude}\n`;
    if (issue.location.address) markdown += `- **Address:** ${issue.location.address}\n`;
    if (issue.location.district) markdown += `- **District:** ${issue.location.district}\n`;
    if (issue.location.sector) markdown += `- **Sector:** ${issue.location.sector}\n`;
  } else {
    markdown += '- No precise location provided.\n';
  }
  markdown += '\n';

  markdown += '### SLA Information\n';
  markdown += `- **Target Resolution:** ${categoryInfo?.estimatedResponseTime || 'N/A'}\n`;
  markdown += `- **Deadline:** ${slaDeadline}\n`;
  markdown += `- **Current Compliance:** ${(issue.slaStatus || 'unknown').replace('_', ' ').toUpperCase()}\n\n`;

  const mediaList = issue.media || issue.photos || [];
  if (mediaList.length > 0) {
    markdown += `### Evidence Attachments (${mediaList.length})\n\n`;
    mediaList.forEach((media: any, index: number) => {
      const mediaType = media.mediaType || 'image';
      markdown += `#### Attachment ${index + 1} (${mediaType})\n`;
      if (mediaType === 'image') {
        markdown += `![Evidence ${index + 1}](${media.url})\n\n`;
      } else {
        markdown += `- [Open ${mediaType} evidence](${media.url})\n\n`;
      }
    });
  }

  if (Array.isArray(issue.activities) && issue.activities.length > 0) {
    markdown += '### Citizen Trust Timeline\n';
    issue.activities
      .slice()
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .forEach((activity: any) => {
        markdown += `- ${formatDate(activity.timestamp)}: ${(activity.action || 'updated').toUpperCase()} - ${activity.description || 'No details'}\n`;
      });
    markdown += '\n';
  }

  markdown += '---\n';
  markdown += `*Report generated automatically by Civic Signal Enterprise System on ${new Date().toLocaleString()}*`;

  return markdown;
}
