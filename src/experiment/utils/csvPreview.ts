import Papa from 'papaparse';

const DEFAULT_PREVIEW_ROWS = 20;

export function parseCsvPreviewRows(csvText: string, maxRows = DEFAULT_PREVIEW_ROWS): string[][] {
  const parsed = Papa.parse<string[]>(csvText, {
    preview: maxRows,
    skipEmptyLines: 'greedy',
  });

  const firstError = parsed.errors[0];
  if (firstError) {
    throw new Error(firstError.message || 'Failed to parse CSV');
  }

  return (parsed.data ?? []).map((row) => row.map((cell) => String(cell ?? '').trim()));
}
