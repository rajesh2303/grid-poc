import { useCallback, useMemo, useState } from 'react';
import type {
  ColumnDef,
  FilterType,
  FilterValue,
  SortType,
} from '../DataGrid.types';
import { MenuKey, type MenuItemType } from '../GridComponents/Menu/Menu.utils';

/**
 * Custom hook for managing DataGrid sorting and menu actions.
 * @template T Row data type
 */

const useDataGrid = <T>({ initialSort }: { initialSort: SortType | null }) => {
  const [sort, setSort] = useState<SortType | null>(initialSort);
  const [filter, setFilter] = useState<FilterType<T> | null>(null);

  const onFilterClear = useCallback((column?: ColumnDef<T> | null) => {
    setFilter((prev) => {
      if (!prev) return null;
      const newFilters = { ...prev };
      if (column) {
        delete newFilters[column.key];
      } else {
        return null;
      }
      return newFilters;
    });
  }, []);

  const onFilterChange = useCallback((filter: FilterValue<T> | null) => {
    setFilter((prev) => {
      if (filter == null) return null;
      return {
        ...prev,
        [filter.column?.key ?? '']: filter,
      };
    });
  }, []);

  const onSortChange = useCallback(
    (col: ColumnDef<T>, order?: 'asc' | 'desc') => {
      if (col.sortable === false) return;
      setSort((prev) => {
        if (order) return { key: col.key, direction: order };
        if (!prev || prev.key !== col.key)
          return { key: col.key, direction: 'asc' };
        if (prev.direction === 'asc')
          return { key: col.key, direction: 'desc' };
        return null;
      });
    },
    [],
  );

  const onClickMenu = useCallback(
    (col: ColumnDef<T>, item: MenuItemType) => {
      if (item.key === MenuKey.SORT_ASCENDING) onSortChange(col, 'asc');
      else if (item.key === MenuKey.SORT_DESCENDING) onSortChange(col, 'desc');
      else if (item.key === MenuKey.CLEAR_SORT) onClearSort();
    },
    [onSortChange],
  );

  const onClearSort = useCallback(() => {
    setSort(null);
  }, []);

  return useMemo(
    () => ({
      sort,
      filter,
      onFilterClear,
      onFilterChange,
      onSortChange,
      onClickMenu,
    }),
    [sort, filter, onFilterClear, onFilterChange, onSortChange, onClickMenu],
  );
};

export default useDataGrid;
