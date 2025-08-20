import { FilterText } from './Filter.utils';

type FilterInputProps = {
  index: number;
  filterText: string;
  selectedOption: string;
  onFilterTextChange: (text: string, filterIndex: number) => void;
  onOptionSelect: (option: string, filterIndex: number) => void;
};
const FilterInput = ({
  index,
  filterText,
  selectedOption,
  onFilterTextChange,
  onOptionSelect,
}: FilterInputProps) => {
  return (
    <>
      <div className="select-container">
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {selectedOption}
          </button>
          <ul className="dropdown-menu">
            {FilterText.map((text) => (
              <li key={`${text}-${index}`}>
                <button
                  className="dropdown-item"
                  onClick={() => onOptionSelect(text, index)}
                >
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="search-container">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Type to filter"
          value={filterText}
          onChange={(e) => onFilterTextChange(e.target.value, index)}
        />
      </div>
    </>
  );
};

export default FilterInput;
