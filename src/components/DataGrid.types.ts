import type React from 'react';
export type SortDirection = 'asc' | 'desc' | null;

export type DataType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export type TextOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';
export type NumberOperator = 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
export type DateOperator = 'equals' | 'before' | 'after' | 'between';

export type FilterOperator = TextOperator | NumberOperator | DateOperator;

export interface FilterModel {
  operator: FilterOperator;
  value?: string | number | boolean | Date | null;
  extra?: string | number | boolean | Date | null; // for between operator
}

export type InternalColumn<T = any> = ColumnDef<T> & { computedWidth: number };

export interface ColumnDef<T = any> {
  key: string; // unique id for the column
  headerName: string;
  field?: keyof T & string; // data field from row object (optional if valueGetter is provided)
  width?: number; // in px
  minWidth?: number; // in px
  maxWidth?: number; // in px
  flex?: number; // flex grow
  dataType?: DataType;
  sortable?: boolean;
  filterable?: boolean;
  search?: boolean;
  resizable?: boolean;
  editable?: boolean;
  hozAlign?: 'left' | 'center' | 'end';
  valueGetter?: (row: T) => any;
  valueFormatter?: (value: any, row: T) => string;
  cellRenderer?: (value: any, row: T) => React.ReactNode;
  comparator?: (a: any, b: any, rowA: T, rowB: T) => number;
  filterOptions?: Array<string | number | boolean>;
  editor?: (params: {
    value: any;
    row: T;
    onChange: (next: any) => void;
    stopEditing: (commit: boolean) => void;
  }) => React.ReactNode;
}

export interface RowSelectionChange<T = any> {
  selectedRowIds: Set<string | number>;
  selectedRows: T[];
}

export interface DataGridProps<T = any> {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowId?: (row: T) => string | number;
  height?: number; // px
  rowHeight?: number; // px
  pageSize?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  initialSort?: { key: string; direction: Exclude<SortDirection, null> } | null;
  className?: string;
  style?: React.CSSProperties;
  quickFilter?: string; // external quick filter text
  onSelectionChange?: (change: RowSelectionChange<T>) => void;
  // editing
  onCellEdit?: (args: {
    rowId: string | number;
    columnKey: string;
    value: any;
    row: T;
  }) => void;

  // column reordering
  enableColumnReorder?: boolean;
  onColumnsReorder?: (columnKeys: string[]) => void;

  // filtering
  initialFilters?: Record<string, FilterModel | undefined>;
  onFiltersChange?: (filters: Record<string, FilterModel | undefined>) => void;

  // grouping
  groupBy?: string[]; // array of column keys
  onGroupByChange?: (keys: string[]) => void;

  // infinite scroll
  infiniteScroll?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}
