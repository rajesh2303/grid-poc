import './filter.css';
import FilterInput from './FilterInput';
import useFilter from './useFilter';
import type { ColumnDef, FilterType, FilterValue } from '../../DataGrid.types';
import { FilterText } from './Filter.utils';

type FilterProps<T> = {
  filter: FilterType<T> | null;
  onClick?: (filter: FilterValue<T>, column?: ColumnDef<T> | null) => void;
  column: ColumnDef<T>;
};

const Filter = <T,>({ filter, column, onClick }: FilterProps<T>) => {
  const {
    open,
    filterRef,
    filters,
    onClickFilter,
    handleFilterChange,
    handleOptionSelect,
    handleSubmit,
    handleClear,
    handleMethodChange,
  } = useFilter({ filter, column, onClick });

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
            filterText={filters?.text[0] ?? ''}
            selectedOption={filters?.operator[0] ?? FilterText[0]}
            onFilterTextChange={handleFilterChange}
            onOptionSelect={handleOptionSelect}
          />
          <div className="text-container">
            <p
              className={`text-item ${!filters?.method || filters?.method === 'AND' ? 'selected' : ''}`}
              onClick={() => handleMethodChange('AND')}
            >
              AND
            </p>
            <p
              className={`text-item ${filters?.method === 'OR' ? 'selected' : ''}`}
              onClick={() => handleMethodChange('OR')}
            >
              OR
            </p>
          </div>
          <hr />
          <FilterInput
            index={1}
            filterText={filters?.text[1] ?? ''}
            selectedOption={filters?.operator[1] ?? FilterText[0]}
            onFilterTextChange={handleFilterChange}
            onOptionSelect={handleOptionSelect}
          />
          <div className="button-container">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
            >
              Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
