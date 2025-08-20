import { useRef, useState, useEffect } from 'react';
import { MenuData, type MenuItemType } from './Menu.utils';
import MenuItem from './MenuItem';
import './menu.css';
import type { ColumnDef } from '../../DataGrid.types';
import { getMenuValidate } from './MenuValidate';

type MenuProps<T> = {
  column: ColumnDef<T>;
  onClickMenu: (item: MenuItemType) => void;
};

const Menu = <T,>({ column, onClickMenu }: MenuProps<T>) => {
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
          {MenuData.map((item, index) => {
            if (getMenuValidate(column, item))
              return (
                <MenuItem
                  key={index}
                  item={{ ...item, isSubmenu: item.isSubmenu || false }}
                  onClick={onClickMenu}
                />
              );
            return null;
          })}
        </ul>
      )}
    </div>
  );
};

export default Menu;
