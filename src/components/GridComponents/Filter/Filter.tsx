import { useRef, useState, useEffect } from 'react';

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
      {open && <div className="dropdown-menu show menu-dropdown">TODO</div>}
    </div>
  );
};

export default Filter;
