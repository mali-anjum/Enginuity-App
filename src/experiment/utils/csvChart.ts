import Papa from 'papaparse';

export type CsvChartSeriesPoint = { x: number; y: number };

export type CsvChartPreview = {
  headers: string[];
  parsedRowCount: number;
  rowsLimited: boolean;
  numericColumnIndexes: number[];
  pointsByColumnPair: (xColumn: number, yColumn: number) => CsvChartSeriesPoint[];
};

function toNumber(value: string | undefined): number | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseCsvChartPreview(csvText: string, maxRows = 500): CsvChartPreview {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: 'greedy' });
  const allRows = (parsed.data ?? []).map((row) => row.map((cell) => `${cell ?? ''}`));
  const rows = allRows.slice(0, maxRows);
  const parsedRowCount = rows.length;
  const rowsLimited = allRows.length > maxRows;
  const maxColumnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);

  if (parsedRowCount === 0 || maxColumnCount === 0) {
    return {
      headers: [],
      parsedRowCount,
      rowsLimited,
      numericColumnIndexes: [],
      pointsByColumnPair: () => [],
    };
  }

  const headerRow = rows[0] ?? [];
  const headers = Array.from({ length: maxColumnCount }, (_, index) => {
    const label = headerRow[index]?.trim();
    return label ? label : `Column ${index + 1}`;
  });
  const dataRows = rows.slice(1);

  const numericColumnIndexes: number[] = [];
  for (let columnIndex = 0; columnIndex < maxColumnCount; columnIndex += 1) {
    let numericCount = 0;
    for (const row of dataRows) {
      if (toNumber(row[columnIndex]) !== null) numericCount += 1;
    }
    if (numericCount > 0) numericColumnIndexes.push(columnIndex);
  }

  return {
    headers,
    parsedRowCount,
    rowsLimited,
    numericColumnIndexes,
    pointsByColumnPair: (xColumn: number, yColumn: number) => {
      const points: CsvChartSeriesPoint[] = [];
      for (const row of dataRows) {
        const xValue = toNumber(row[xColumn]);
        const yValue = toNumber(row[yColumn]);
        if (xValue === null || yValue === null) continue;
        points.push({ x: xValue, y: yValue });
      }
      return points;
    },
  };
}
