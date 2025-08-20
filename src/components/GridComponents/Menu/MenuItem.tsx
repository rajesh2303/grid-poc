import React, { useState, useRef, useCallback } from 'react';
import type { MenuItem as MenuItemType } from './Menu.utils';

type MenuItemProps = {
  item: MenuItemType;
};

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [subOpen, setSubOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSubOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => setSubOpen(false), 100);
  }, []);

  return (
    <li
      className="menu-list"
      onMouseEnter={item.isSubmenu ? handleMouseEnter : undefined}
      onMouseLeave={item.isSubmenu ? handleMouseLeave : undefined}
      style={{ position: 'relative' }}
    >
      <button className="dropdown-item menu-item">
        <span>
          {item.icon && (
            <i
              className={item.icon}
              style={{ paddingRight: '4px', fontSize: '12px' }}
            />
          )}
          {!item.icon && (
            <span style={{ display: 'inline-block', width: '18px' }} />
          )}
          {item.label}
        </span>
        {item.isSubmenu && (
          <i className="bi bi-chevron-right" style={{ fontSize: '12px' }} />
        )}
      </button>
      {item.isSubmenu && item.subMenu && subOpen && (
        <ul
          className="dropdown-menu show menu-dropdown submenu-dropdown"
          style={{
            position: 'absolute',
            left: '100%',
            top: 0,
            zIndex: 1100,
            minWidth: 180,
            marginLeft: 4,
          }}
        >
          {item.subMenu.map((sub, idx) => (
            <li className="menu-list" key={idx}>
              <button className="dropdown-item menu-item">
                <span>
                  {sub.icon && (
                    <i
                      className={sub.icon}
                      style={{ paddingRight: '4px', fontSize: '12px' }}
                    />
                  )}
                  {!sub.icon && (
                    <span style={{ display: 'inline-block', width: '18px' }} />
                  )}
                  {sub.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
