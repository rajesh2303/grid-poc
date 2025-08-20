import React, { useState } from 'react';
import type { ColumnDef, SortDirection } from '../DataGrid.types';
import Search from './Search';
import type { SearchType } from '../types';
import Menu from './Menu/Menu';
import { Filter } from './Filter';
interface HeaderProps<T> {
  internalColumns: ColumnDef<T>[];
  gridTemplateColumns: string;
  checkboxSelection: boolean;
  pagedRows: T[];
  selected: Set<string | number>;
  getRowId: (row: T) => string | number;
  onToggleAll: (checked: boolean) => void;
  sort: { key: string; direction: Exclude<SortDirection, null> } | null;
  setSort: React.Dispatch<
    React.SetStateAction<{
      key: string;
      direction: Exclude<SortDirection, null>;
    } | null>
  >;
  search: SearchType | null;
  enableColumnReorder: boolean;
  resizingColKey: string | null;
  setDragColKey: (key: string | null) => void;
  dragColKey: string | null;
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onColumnsReorder?: (arr: string[]) => void;
  onColumnResizeStart: (key: string, startX: number) => void;
  setSearch: React.Dispatch<React.SetStateAction<SearchType | null>>;
}

function Header<T>({
  internalColumns,
  gridTemplateColumns,
  checkboxSelection,
  pagedRows,
  selected,
  getRowId,
  onToggleAll,
  sort,
  setSort,
  enableColumnReorder,
  resizingColKey,
  setDragColKey,
  dragColKey,
  setColumnOrder,
  onColumnsReorder,
  onColumnResizeStart,
  search,
  setSearch,
}: HeaderProps<T>) {
  const [openSearch, setOpenSearch] = useState<string | null>(null);

  return (
    <div className="datagrid__header" style={{ gridTemplateColumns }}>
      {checkboxSelection && (
        <div
          className="datagrid__header-cell"
          role="columnheader"
          aria-colindex={1}
        >
          <input
            className="datagrid__checkbox"
            type="checkbox"
            checked={
              pagedRows.every((r) => selected.has(getRowId(r))) &&
              pagedRows.length > 0
            }
            onChange={(e) => onToggleAll(e.target.checked)}
            aria-label="Select all rows on page"
          />
        </div>
      )}
      {internalColumns.map((col, i) => {
        const isSorted = sort?.key === col.key && sort.direction;
        return (
          <div
            key={col.key}
            className="datagrid__header-cell"
            role="columnheader"
            aria-colindex={i + 1 + (checkboxSelection ? 1 : 0)}
            draggable={enableColumnReorder && !resizingColKey}
            onDragStart={(e) => {
              if (resizingColKey) {
                e.preventDefault();
                return;
              }
              setDragColKey(col.key);
            }}
            onDragOver={(e) =>
              enableColumnReorder ? e.preventDefault() : undefined
            }
            onDrop={() => {
              if (!enableColumnReorder || !dragColKey || dragColKey === col.key)
                return;
              setColumnOrder((prev) => {
                const arr = prev.slice();
                const from = arr.indexOf(dragColKey);
                const to = arr.indexOf(col.key);
                arr.splice(to, 0, ...arr.splice(from, 1));
                onColumnsReorder && onColumnsReorder(arr);
                return arr;
              });
              setDragColKey(null);
            }}
          >
            {openSearch === col.key ? (
              <Search
                value={search?.[col.key] ?? ''}
                onChange={(value) =>
                  setSearch((prev) => ({ ...prev, [col.key]: value }))
                }
                placeholder={col.searchPlaceholder}
                onClose={() => setOpenSearch(null)}
              />
            ) : (
              <div className="datagrid__header-cell-content">
                <button
                  className={`datagrid__btn justify-content-${col.hozAlign || 'left'}`}
                  style={{
                    padding: '.2rem .4rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: col.sortable === false ? 'default' : 'pointer',
                  }}
                  onClick={() => {
                    if (col.sortable === false) return;
                    setSort((prev) => {
                      if (!prev || prev.key !== col.key)
                        return { key: col.key, direction: 'asc' } as const;
                      if (prev.direction === 'asc')
                        return { key: col.key, direction: 'desc' } as const;
                      return null;
                    });
                  }}
                  aria-label={`Sort by ${col.headerName}`}
                >
                  <span style={{ fontWeight: 600 }}>{col.headerName}</span>
                  {isSorted && (
                    <span className="datagrid__sort-indicator">
                      {sort!.direction === 'asc' ? (
                        <i className="bi bi-sort-up medium-icon" />
                      ) : (
                        <i className="bi bi-sort-down medium-icon" />
                      )}
                    </span>
                  )}
                </button>
                <span
                  style={{
                    marginLeft: 6,
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {col.search !== false ? (
                    <i
                      className="bi bi-search"
                      style={{
                        color: '#3C3B4C',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setOpenSearch(col.key)}
                    />
                  ) : null}
                  {col.filterable !== false && <Filter />}
                  <Menu />
                </span>
              </div>
            )}
            {col.resizable !== false && (
              <div
                className="datagrid__resizer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onColumnResizeStart(col.key, e.clientX);
                }}
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${col.headerName}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Header;
