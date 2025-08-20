import { useRef, useState, useEffect } from 'react';
import './filter.css';

const Filter = () => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="dropdown-menu show menu-dropdown filter-dropdown">
          <div className="select-container">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Contains
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    One
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Two
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Three
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Type to filter"
            />
          </div>
          <div className="text-container">
            <p className="text-item selected">AND</p>
            <p className="text-item">OR</p>
          </div>
          <hr />
          <div className="select-container-and">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Contains
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    One
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Two
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Three
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="search-container-or">
            <input
              type="text"
              className="form-control"
              placeholder="Type to filter"
            />
          </div>
          <div className="button-container">
            <button type="button" className="btn btn-outline-primary btn-sm">
              Clear
            </button>
            <button type="button" className="btn btn-primary btn-sm">
              Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
