import type { ColumnDef } from '../../DataGrid.types';
import { MenuKey, type MenuItemType } from './Menu.utils';

export const getMenuValidate = (columnn: ColumnDef, menuItem: MenuItemType) => {
  if (
    menuItem.key === MenuKey.SORT_ASCENDING ||
    menuItem.key === MenuKey.SORT_DESCENDING ||
    menuItem.key === MenuKey.CLEAR_SORT
  ) {
    return Boolean(columnn.sortable);
  }
  return true;
};
