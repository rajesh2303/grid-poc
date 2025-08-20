import { useRef, useState, useEffect } from 'react';
import { MenuData } from './Menu.utils';
import MenuItem from './MenuItem';
import './menu.css';

const Menu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div
      ref={menuRef}
      style={{ display: 'inline-block', position: 'relative' }}
      className="filter-menu"
    >
      <i
        className="bi bi-three-dots-vertical"
        style={{ color: '#2A4899', fontSize: '14px', cursor: 'pointer' }}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <ul
          className="dropdown-menu show menu-dropdown"
          style={{ position: 'absolute', zIndex: 1000, right: 0 }}
        >
          {MenuData.map((item, index) => (
            <MenuItem item={item} key={index} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Menu;
