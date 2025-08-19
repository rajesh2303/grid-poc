import { useMemo } from 'react';
import type { ColumnDef, InternalColumn } from '../DataGrid.types';

export function useGridColumns<T>(
  columns: ColumnDef<T>[],
  containerWidth: number | null,
): InternalColumn<T>[] {
  return useMemo(() => {
    const totalFlex = columns.reduce((sum, c) => sum + (c.flex || 0), 0);
    return columns.map((c) => {
      let width = c.width ?? 160;
      if (containerWidth && totalFlex > 0 && c.flex) {
        const remaining =
          containerWidth - columns.reduce((s, x) => s + (x.width ?? 0), 0);
        const share = Math.max(remaining, 0) * (c.flex / totalFlex);
        width = Math.max(
          c.minWidth ?? 80,
          Math.min(c.maxWidth ?? 800, Math.floor((c.width || 0) + share)),
        );
      }
      return { ...c, computedWidth: width } as InternalColumn<T>;
    });
  }, [columns, containerWidth]);
}
