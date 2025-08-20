import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Header from './GridComponents/Header';
import './DataGrid.css';
import type {
  ColumnDef,
  DataGridProps,
  InternalColumn,
} from './DataGrid.types';
import {
  defaultGetRowId,
  formatValue,
  getColumnMapper,
  getValue,
  quickFilterRows,
  sortRows,
} from './utils/column.utils';
import type { SearchType } from './types';
import { useDataGrid, useGridColumns, useContainerWidth } from './hooks';

export default function DataGrid<T>(props: DataGridProps<T>) {
  const {
    rows,
    getRowId = defaultGetRowId,
    height = 520,
    rowHeight = 44,
    pageSize: pageSizeProp = 25,
    checkboxSelection = false,
    initialSort = null,
    className,
    style,
    quickFilter,
    onSelectionChange,
    enableColumnReorder = true,
    onColumnsReorder,
    groupBy,
    infiniteScroll = false,
    hasMore = false,
    onLoadMore,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);

  const columns = useMemo(() => {
    return getColumnMapper(
      props?.columns ?? [],
      checkboxSelection ? (width ?? 0) - 44 : width,
    );
  }, [props?.columns, width, checkboxSelection]);

  const {
    sort,
    filter,
    onClickMenu,
    onSortChange,
    onFilterClear,
    onFilterChange,
  } = useDataGrid<T>({ initialSort });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeProp);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.key),
  );
  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const [resizingColKey, setResizingColKey] = useState<string | null>(null);
  const [dragRowId, setDragRowId] = useState<string | number | null>(null);
  const [internalRows, setInternalRows] = useState<T[]>(rows);
  const [internalGroupBy, setInternalGroupBy] = useState<string[]>(
    groupBy || [],
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState<SearchType | null>(null);

  useEffect(() => {
    setInternalRows(rows);
  }, [rows]);

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((k) => columns.find((c) => c.key === k)!)
        .filter(Boolean) as ColumnDef<T>[],
    [columnOrder, columns],
  );

  const internalColumns = useGridColumns(
    orderedColumns.map((c) => ({
      ...c,
      width: columnWidths[c.key] ?? c.width,
    })),
    width,
  );

  // columns search
  useEffect(() => {
    if (!search) {
      return;
    }
    const filteredData = rows.filter((row) =>
      Object.entries(search).every(([key, value]) =>
        String(getValue(row, internalColumns.find((c) => c.key === key)!))
          .toLowerCase()
          .includes(String(value).toLowerCase()),
      ),
    );
    setInternalRows(filteredData);
  }, [search, internalColumns, rows]);

  const processedRows = useMemo(() => {
    let out = internalRows;
    out = quickFilterRows(out, internalColumns, quickFilter);
    out = sortRows(out, sort, internalColumns);
    return out;
  }, [internalRows, internalColumns, sort, quickFilter]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);

  const pagedRows = useMemo(() => {
    if (infiniteScroll) return processedRows;
    const start = currentPage * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, currentPage, pageSize, infiniteScroll]);

  useEffect(() => {
    if (!onSelectionChange) return;
    const selectedRows = internalRows.filter((r) => selected.has(getRowId(r)));
    onSelectionChange({ selectedRowIds: selected, selectedRows });
  }, [selected, internalRows, getRowId, onSelectionChange]);

  const onToggleAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const ids = new Set<string | number>(pagedRows.map(getRowId));
        setSelected((prev) => new Set([...prev, ...ids]));
      } else {
        setSelected((prev) => {
          const copy = new Set(prev);
          pagedRows.forEach((r) => copy.delete(getRowId(r)));
          return copy;
        });
      }
    },
    [pagedRows, getRowId],
  );

  const onColumnResizeStart = (key: string, startX: number) => {
    const col = internalColumns.find((c) => c.key === key);
    if (!col) return;
    const startWidth = columnWidths[key] ?? col.computedWidth;
    setResizingColKey(key);
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(
        col.minWidth ?? 140,
        Math.min(col.maxWidth ?? 800, startWidth + delta),
      );
      setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setResizingColKey(null);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const gridTemplateColumns = useMemo(() => {
    const arr = [...internalColumns.map((c) => c.computedWidth)];
    if (checkboxSelection) {
      arr.unshift(44);
    }
    return arr.map((v) => `${v}px`).join(' ');
  }, [internalColumns, checkboxSelection]);

  // Simple virtualization for the current page (disabled when grouped to keep logic straightforward)
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const visibleRowCount = Math.ceil((height - 110) / rowHeight) + 4; // header + footer approx.
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endIndex = Math.min(pagedRows.length, startIndex + visibleRowCount);
  const offsetY = startIndex * rowHeight;

  // Grouping
  const groupKeys = groupBy && groupBy.length > 0 ? groupBy : internalGroupBy;
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const grouped = useMemo(() => {
    if (groupKeys.length === 0) return null;
    const key = groupKeys[0];
    const groups = new Map<string, T[]>();
    for (const r of processedRows) {
      const col = internalColumns.find((c) => c.key === key)!;
      const value = String(getValue(r, col));
      const arr = groups.get(value) || [];
      arr.push(r);
      groups.set(value, arr);
    }
    return Array.from(groups.entries()).map(([k, rs]) => ({
      key: k,
      rows: rs,
    }));
  }, [groupKeys, processedRows, internalColumns]);

  // Collapse groups by default when grouping changes
  useEffect(() => {
    if (groupKeys.length === 0) return;
    setExpandedGroups(() => {
      const map: Record<string, boolean> = {};
      (grouped || []).forEach((g) => {
        map[g.key] = false;
      });
      return map;
    });
  }, [groupKeys.join('|')]);

  function i18nHeaderName(key: string, cols: InternalColumn<T>[]) {
    const c = cols.find((c) => c.key === key);
    return c?.headerName || key;
  }

  // Infinite scroll trigger
  useEffect(() => {
    if (!infiniteScroll || !onLoadMore) return;
    const el = bodyRef.current;
    if (!el) return;
    const handler = () => {
      if (isLoadingMore || !hasMore) return;
      const threshold = 200; // px from bottom
      if (el.scrollTop + el.clientHeight + threshold >= el.scrollHeight) {
        setIsLoadingMore(true);
        Promise.resolve(onLoadMore()).finally(() => setIsLoadingMore(false));
      }
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [infiniteScroll, onLoadMore, isLoadingMore, hasMore]);

  return (
    <div
      ref={containerRef}
      className={`datagrid ${className || ''}`}
      style={{ ...style, height }}
    >
      {/* Group panel: drag column headers here to group */}
      <div
        className="datagrid__group-panel"
        onDragOver={(e) => {
          if (dragColKey) e.preventDefault();
        }}
        onDrop={() => {
          if (!dragColKey) return;
          setInternalGroupBy((prev) =>
            prev.includes(dragColKey!) ? prev : [...prev, dragColKey!],
          );
          setDragColKey(null);
        }}
      >
        <span>
          {groupKeys.map((k) => (
            <span key={k}>
              <button
                type="button"
                className="btn btn-primary btn-badge"
                onClick={() =>
                  setInternalGroupBy((prev) => prev.filter((x) => x !== k))
                }
              >
                <span className="badge text-bg-primary">X</span>
                {i18nHeaderName(k, internalColumns)}
              </button>
            </span>
          ))}
        </span>
        <span className="group-text">Drag and drop columns here to group…</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <Header
          internalColumns={internalColumns}
          gridTemplateColumns={gridTemplateColumns}
          checkboxSelection={checkboxSelection}
          pagedRows={pagedRows}
          selected={selected}
          getRowId={getRowId}
          onToggleAll={onToggleAll}
          sort={sort}
          onSortChange={onSortChange}
          enableColumnReorder={enableColumnReorder}
          resizingColKey={resizingColKey}
          setDragColKey={setDragColKey}
          dragColKey={dragColKey}
          setColumnOrder={setColumnOrder}
          onColumnsReorder={onColumnsReorder}
          onColumnResizeStart={onColumnResizeStart}
          search={search}
          setSearch={setSearch}
          onClickMenu={onClickMenu}
          filter={filter}
          onFilterClear={onFilterClear}
          onFilterChange={onFilterChange}
        />
        {/* {groupKeys.length === 0 ? filterRow : null} */}
        <div
          ref={bodyRef}
          className="datagrid__body"
          style={{ height: height - 110 }}
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          {grouped ? (
            <div>
              {grouped.map((g) => {
                const open = expandedGroups[g.key] ?? true;
                return (
                  <React.Fragment key={g.key}>
                    <div
                      className="datagrid__row datagrid__group-row"
                      style={{ gridTemplateColumns }}
                      onClick={() =>
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [g.key]: !open,
                        }))
                      }
                    >
                      {checkboxSelection && <div className="datagrid__cell" />}
                      <div
                        className="datagrid__cell"
                        style={{ gridColumn: `span ${internalColumns.length}` }}
                      >
                        {open ? '▼' : '▶'} Group: {g.key} ({g.rows.length})
                      </div>
                    </div>
                    {open &&
                      g.rows.map((row) => {
                        const rowId = getRowId(row);
                        const isSelected = selected.has(rowId);
                        return (
                          <div
                            key={String(rowId)}
                            className="datagrid__row"
                            style={{ gridTemplateColumns, height: rowHeight }}
                          >
                            {checkboxSelection && (
                              <div className="datagrid__cell datagrid__checkbox">
                                <input
                                  className="datagrid__checkbox"
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelected((prev) => {
                                      const copy = new Set(prev);
                                      if (checked) copy.add(rowId);
                                      else copy.delete(rowId);
                                      return copy;
                                    });
                                  }}
                                />
                              </div>
                            )}
                            {internalColumns.map((col) => {
                              const raw = getValue(row, col);
                              return (
                                <div
                                  key={col.key}
                                  className="datagrid__cell"
                                  title={String(raw)}
                                >
                                  {col.cellRenderer
                                    ? col.cellRenderer(raw, row)
                                    : formatValue(row, col)}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                height: pagedRows.length * rowHeight,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: offsetY,
                  left: 0,
                  right: 0,
                }}
              >
                {pagedRows.slice(startIndex, endIndex).map((row, idx) => {
                  const rowId = getRowId(row);
                  const isSelected = selected.has(rowId);
                  return (
                    <div
                      key={String(rowId)}
                      className="datagrid__row"
                      style={{ gridTemplateColumns, height: rowHeight }}
                      role="row"
                      aria-rowindex={startIndex + idx + 1}
                      draggable
                      onDragStart={() => setDragRowId(rowId)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragRowId == null || dragRowId === rowId) return;
                        setInternalRows((prev) => {
                          const copy = prev.slice();
                          const from = copy.findIndex(
                            (r) => getRowId(r) === dragRowId,
                          );
                          const to = copy.findIndex(
                            (r) => getRowId(r) === rowId,
                          );
                          if (from === -1 || to === -1) return prev;
                          const [moved] = copy.splice(from, 1);
                          copy.splice(to, 0, moved);
                          return copy;
                        });
                        setDragRowId(null);
                      }}
                    >
                      {checkboxSelection && (
                        <div className="datagrid__cell">
                          <input
                            className="datagrid__checkbox"
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelected((prev) => {
                                const copy = new Set(prev);
                                if (checked) copy.add(rowId);
                                else copy.delete(rowId);
                                return copy;
                              });
                            }}
                            aria-label="Select row"
                          />
                        </div>
                      )}
                      {internalColumns.map((col) => {
                        const raw = getValue(row, col);
                        return (
                          <div
                            key={col.key}
                            className="datagrid__cell"
                            title={String(raw)}
                          >
                            {col.cellRenderer
                              ? col.cellRenderer(raw, row)
                              : formatValue(row, col)}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
