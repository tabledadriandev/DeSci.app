import path from 'node:path';
import { promises as fs } from 'node:fs';

// Base path to the shared ta_labs folder (sibling of wellness-app)
export function getTaLabsPath(...segments: string[]): string {
  return path.resolve(process.cwd(), '..', 'ta_labs', ...segments);
}

// Very small CSV parser that supports commas, quotes, and newlines in fields.
// Assumes first row is header. Returns array of records keyed by header.
export async function readCsvRecords(
  relativePath: string,
  options?: { limit?: number },
): Promise<Record<string, string>[]> {
  const filePath = getTaLabsPath(relativePath);
  const raw = await fs.readFile(filePath, 'utf8');

  const rows = parseCsv(raw, options?.limit);
  if (rows.length === 0) return [];

  const [header, ...data] = rows;
  return data.map((cols) => {
    const rec: Record<string, string> = {};
    header.forEach((h, idx) => {
      rec[h] = cols[idx] ?? '';
    });
    return rec;
  });
}

function parseCsv(input: string, limit?: number): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }

    if (char === '"' && inQuotes) {
      if (next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
        if (limit && rows.length >= limit) break;
        row = [];
        field = '';
      }
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}


