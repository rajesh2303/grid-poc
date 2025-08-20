import { useCallback, useState } from 'react';

import { useEffect, useRef } from 'react';

type SearchProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onClose?: () => void;
};

const Search = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  onClose,
}: SearchProps) => {
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearch?.(value);
      onChange?.(value);
    },
    [onChange],
  );

  const handleClearSearch = useCallback(() => {
    setSearch?.('');
    onChange?.('');
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        onClose?.();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!onClose) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="datagrid__search_container" ref={containerRef}>
      <div className="datagrid__search shadow-sm">
        <input
          type="text"
          className="datagrid__search-input"
          placeholder={placeholder}
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <i
          className="bi bi-x-square-fill"
          style={{ color: '#2A4899', fontSize: '12px', cursor: 'pointer' }}
          onClick={handleClearSearch}
        />
      </div>
    </div>
  );
};

export default Search;
