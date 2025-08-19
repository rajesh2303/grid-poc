import type { ColumnDef, SortDirection } from '../DataGrid.types';

export function getColumnMapper<T>(
  columns: ColumnDef<T>[],
  containerWidth: number | null,
) {
  const totalWidth = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const width = containerWidth
    ? Math.floor((containerWidth - totalWidth) / columns.length)
    : 0;
  return columns.map((col) => ({
    ...col,
    width: col.width ?? width - 5,
  }));
}

export function defaultGetRowId(row: any): string | number {
  if (row == null) return Math.random().toString(36).slice(2);
  if (typeof row === 'object') {
    if ('id' in row) return (row as any).id;
    if ('_id' in row) return (row as any)._id;
  }
  return JSON.stringify(row);
}

export function getValue<T>(row: T, col: ColumnDef<T>) {
  const raw = col.valueGetter
    ? col.valueGetter(row)
    : col.field
      ? (row as any)[col.field]
      : undefined;
  return raw;
}

export function formatValue<T>(row: T, col: ColumnDef<T>) {
  const v = getValue(row, col);
  if (col.valueFormatter) return col.valueFormatter(v, row);
  if (v == null) return '';
  return String(v);
}

export function sortRows<T>(
  rows: T[],
  sort: { key: string; direction: Exclude<SortDirection, null> } | null,
  columns: ColumnDef<T>[],
): T[] {
  if (!sort) return rows;
  const col = columns.find((c) => c.key === sort.key);
  if (!col) return rows;
  const dir = sort.direction === 'asc' ? 1 : -1;
  const comparator =
    col.comparator || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
  return [...rows].sort(
    (ra, rb) => comparator(getValue(ra, col), getValue(rb, col), ra, rb) * dir,
  );
}

export function quickFilterRows<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  text: string | undefined,
): T[] {
  if (!text) return rows;
  const q = text.toLowerCase();
  return rows.filter((r) =>
    columns.some((c) =>
      String(getValue(r, c) ?? '')
        .toLowerCase()
        .includes(q),
    ),
  );
}
