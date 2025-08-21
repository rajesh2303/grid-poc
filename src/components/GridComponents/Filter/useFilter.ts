import { useCallback, useEffect, useRef, useState } from 'react';
import { FilterText } from './Filter.utils';
import type { ColumnDef, FilterType, FilterValue } from '../../DataGrid.types';

const useFilter = <T>({
  filter,
  column,
  onClick,
}: {
  filter: FilterType<T> | null;
  column: ColumnDef<T>;
  onClick?: (filter: FilterValue<T>, column?: ColumnDef<T> | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterValue<T> | null>(
    filter?.[column.key] ?? null,
  );

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const onClickFilter = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleFilterChange = useCallback(
    (text: string, index: number) => {
      setFilters((prev) => {
        const textArr = prev?.text ?? ['', ''];
        const operatorArr = prev?.operator ?? [FilterText[0], FilterText[0]];
        const method = prev?.method ?? 'AND';
        return {
          ...prev,
          text: textArr.map((t, i) => (i === index ? text : t)),
          operator: operatorArr,
          method,
          column: prev?.column ?? column,
        };
      });
    },
    [filter, column],
  );

  const handleOptionSelect = useCallback(
    (option: string, index: number) => {
      setFilters((prev) => {
        const textArr = prev?.text ?? ['', ''];
        const operatorArr = prev?.operator ?? [FilterText[0], FilterText[0]];
        const method = prev?.method ?? 'AND';
        return {
          ...prev,
          text: textArr,
          operator: operatorArr.map((op, i) => (i === index ? option : op)),
          method,
          column: prev?.column ?? column,
        };
      });
    },
    [filter, column],
  );

  const handleSubmit = useCallback(() => {
    onClick?.(filters, column);
    onClickFilter();
  }, [filters, column, onClick, onClickFilter]);

  const handleClear = useCallback(() => {
    setFilters(null);
  }, [column, onClick]);

  const handleMethodChange = useCallback(
    (method: 'AND' | 'OR') => {
      setFilters((prev) => {
        const textArr = prev?.text ?? ['', ''];
        const operatorArr = prev?.operator ?? [FilterText[0], FilterText[0]];
        return {
          ...prev,
          text: textArr,
          operator: operatorArr,
          method,
          column: prev?.column ?? column,
        };
      });
    },
    [filter, column],
  );

  return {
    open,
    filterRef,
    filters,
    onClickFilter,
    handleFilterChange,
    handleOptionSelect,
    handleSubmit,
    handleClear,
    handleMethodChange,
  };
};

export default useFilter;
