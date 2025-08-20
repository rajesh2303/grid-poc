import { useCallback } from 'react';
import './filter.css';
import FilterInput from './FilterInput';
import useFilter from './useFilter';
import type { ColumnDef, FilterValue } from '../../DataGrid.types';
import { FilterText } from './Filter.utils';

type FilterProps<T> = {
  filter: FilterValue<T>;
  onClick?: (column?: ColumnDef<T> | null) => void;
  column?: ColumnDef<T> | null;
  onChange: (filter: FilterValue<T>) => void;
  onClear?: (column?: ColumnDef<T> | null) => void;
};

const Filter = <T,>({ filter, column, onChange }: FilterProps<T>) => {
  const { open, filterRef, onClickFilter } = useFilter();

  const handleFilterChange = useCallback(
    (text: string, index: number) => {
      const fallback = {
        text: ['', ''],
        operator: [FilterText[0], FilterText[0]],
        column: column,
      };
      const current = filter ?? fallback;
      const updatedFilter = {
        ...current,
        text: current.text.map((t, i) => (i === index ? text : t)),
        operator: current.operator,
        column: column ?? current.column,
      };
      onChange(updatedFilter);
    },
    [onChange, filter, column],
  );

  const handleOptionSelect = useCallback(
    (option: string, index: number) => {
      const fallback = {
        text: ['', ''],
        operator: [FilterText[0], FilterText[0]],
        column: column,
      };
      const current = filter ?? fallback;
      const updatedFilter = {
        ...current,
        text: current.text,
        operator: current.operator.map((o, i) => (i === index ? option : o)),
        column: column ?? current.column,
      };
      onChange(updatedFilter);
    },
    [onChange, filter, column],
  );

  return (
    <div
      ref={filterRef}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <i
        className="bi bi-funnel"
        style={{
          color: '#3C3B4C',
          fontSize: '14px',
          cursor: 'pointer',
        }}
        onClick={onClickFilter}
      />
      {open && (
        <div className="dropdown-menu show menu-dropdown filter-dropdown">
          <FilterInput
            index={0}
            filterText={filter?.text[0] ?? ''}
            selectedOption={filter?.operator[0] ?? FilterText[0]}
            onFilterTextChange={handleFilterChange}
            onOptionSelect={handleOptionSelect}
          />
          <div className="text-container">
            <p className="text-item selected">AND</p>
            <p className="text-item">OR</p>
          </div>
          <hr />
          <FilterInput
            index={1}
            filterText={filter?.text[1] ?? ''}
            selectedOption={filter?.operator[1] ?? FilterText[0]}
            onFilterTextChange={handleFilterChange}
            onOptionSelect={handleOptionSelect}
          />
          <div className="button-container">
            {/*  <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              // onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              // onClick={handleSubmit}
            >
              Filter
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
