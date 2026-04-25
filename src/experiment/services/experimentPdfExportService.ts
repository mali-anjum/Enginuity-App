import { Platform } from 'react-native';

import type { Experiment } from '@/experiment/state/experimentSlice';
import type { Project } from '@/project/state/projectSlice';

type ExportPdfParams = {
  experiment: Experiment;
  projectName: string;
  hardwareNames: string[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildList(items: string[]): string {
  if (items.length === 0) return '<p>None</p>';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function buildImageGrid(urls: string[]): string {
  if (urls.length === 0) return '<p>No images attached.</p>';
  return `
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      ${urls
        .map(
          (url) => `
        <div style="width: 220px; margin-bottom: 10px;">
          <img src="${escapeHtml(url)}" style="width: 100%; height: auto; border: 1px solid #D0D7DE; border-radius: 8px;" />
        </div>
      `,
        )
        .join('')}
    </div>
  `;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export async function exportExperimentAsPdf({
  experiment,
  projectName,
  hardwareNames,
}: ExportPdfParams): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('PDF export is not supported on web.');
  }

  const imageUrls = experiment.attachments
    .filter((attachment) => attachment.fileType?.startsWith('image/') ?? false)
    .map((attachment) => attachment.url);
  const dateRange = `${formatDate(experiment.createdAt)} - ${formatDate(experiment.updatedAt)}`;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; padding: 20px; }
          h1 { margin-bottom: 6px; }
          h2 { margin-top: 22px; margin-bottom: 8px; font-size: 18px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
          p { line-height: 1.5; margin: 6px 0; white-space: pre-wrap; }
          .meta { color: #4B5563; margin-bottom: 14px; }
          .commit { font-family: "SFMono-Regular", Menlo, monospace; background: #F3F4F6; padding: 8px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(experiment.title)}</h1>
        <p class="meta">Project: ${escapeHtml(projectName)}</p>
        <p class="meta">Date range: ${escapeHtml(dateRange)}</p>

        <h2>Objective</h2>
        <p>${escapeHtml(experiment.objective || '—')}</p>

        <h2>Hardware Used</h2>
        ${buildList(hardwareNames)}

        <h2>Observations</h2>
        <p>${escapeHtml(experiment.observations || '—')}</p>

        <h2>GitHub Commit Reference</h2>
        <p class="commit">${escapeHtml(experiment.githubCommit || '—')}</p>

        <h2>Attached Images</h2>
        ${buildImageGrid(imageUrls)}
      </body>
    </html>
  `;

  const options = {
    html,
    fileName: `experiment-report-${experiment.id}`,
    base64: false,
  };

  const { generatePDF } = await import('react-native-html-to-pdf');
  const pdf = await generatePDF(options);
  if (!pdf.filePath) {
    throw new Error('Failed to generate PDF file');
  }
  return pdf.filePath;
}

export function resolveProjectName(project: Project | null): string {
  return project?.title?.trim() ? project.title : 'Unknown project';
}
