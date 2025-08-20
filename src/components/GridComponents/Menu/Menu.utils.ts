export type MenuItemType = {
  label: string;
  icon?: string;
  isSubmenu?: boolean;
  subMenu?: MenuItemType[];
  key?: MenuKey;
};

export const MenuKey = {
  SORT_ASCENDING: 'sort-ascending',
  SORT_DESCENDING: 'sort-descending',
  CONFIG_SORTING: 'config-sorting',
  CLEAR_SORT: 'clear-sort',
  UNPIN_COLUMN: 'unpin-column',
  PIN_LEFT: 'pin-left',
  PIN_RIGHT: 'pin-right',
  AUTOSIZE_ALL_COLUMNS: 'autosize-all-columns',
  AUTOSIZE_THIS_COLUMN: 'autosize-this-column',
  FREEZE_COLUMN: 'freeze-column',
  COLUMN_1: 'column-1',
  COLUMN_2: 'column-2',
  SHOW_GROUP_BAR: 'show-group-bar',
  SHOW_FILTER_ROW: 'show-filter-row',
  RESET_COLUMN: 'reset-column',
  GROUP_BY_THIS_COLUMN: 'group-by-this-column',
} as const;

export type MenuKey = (typeof MenuKey)[keyof typeof MenuKey];

export const MenuData: MenuItemType[] = [
  {
    label: 'Sort ascending',
    icon: 'bi bi-arrow-up',
    key: MenuKey.SORT_ASCENDING,
  },
  {
    label: 'Sort descending',
    icon: 'bi bi-arrow-down',
    key: MenuKey.SORT_DESCENDING,
  },
  {
    label: 'Config Sorting',
    icon: 'bi bi-gear',
    key: MenuKey.CONFIG_SORTING,
  },
  {
    label: 'Clear Sort',
    icon: 'bi bi-eraser',
    key: MenuKey.CLEAR_SORT,
  },
  {
    label: 'Pin Column',
    icon: 'bi bi-pin-angle',
    isSubmenu: true,
    subMenu: [
      {
        label: 'No Pin',
        key: MenuKey.UNPIN_COLUMN,
      },
      {
        label: 'Pin left',
        icon: 'bi bi-arrow-left-short',
        key: MenuKey.PIN_LEFT,
      },
      {
        label: 'Pin right',
        icon: 'bi bi-arrow-right-short',
        key: MenuKey.PIN_RIGHT,
      },
    ],
  },
  {
    label: 'Autosize all columns',
    icon: 'bi bi-arrow-repeat',
    key: MenuKey.AUTOSIZE_ALL_COLUMNS,
  },
  {
    label: 'Autosize this column',
    icon: 'bi bi-arrow-repeat',
    key: MenuKey.AUTOSIZE_THIS_COLUMN,
  },
  {
    label: 'Freeze column',
    icon: 'bi bi-snow',
    key: MenuKey.FREEZE_COLUMN,
  },
  {
    label: 'Choose column',
    icon: 'bi bi-list-check',
    isSubmenu: true,
    subMenu: [
      {
        label: 'Column 1',
        icon: 'bi bi-list-check',
        key: MenuKey.COLUMN_1,
      },
      {
        label: 'Column 2',
        icon: 'bi bi-list-check',
        key: MenuKey.COLUMN_2,
      },
    ],
  },
  {
    label: 'Show group bar',
    icon: 'bi bi-bar-chart',
    key: MenuKey.SHOW_GROUP_BAR,
  },
  {
    label: 'Show filter row',
    icon: '',
    key: MenuKey.SHOW_FILTER_ROW,
  },
  {
    label: 'Reset Column',
    icon: '',
    key: MenuKey.RESET_COLUMN,
  },
  {
    label: 'Group by this column',
    icon: '',
    key: MenuKey.GROUP_BY_THIS_COLUMN,
  },
];
