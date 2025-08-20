export type MenuItem = {
  label: string;
  icon?: string;
  isSubmenu?: boolean;
  subMenu?: MenuItem[];
};

export const MenuData: MenuItem[] = [
  {
    label: 'Sort ascending',
    icon: 'bi bi-arrow-up',
  },
  {
    label: 'Sort descending',
    icon: 'bi bi-arrow-down',
  },
  {
    label: 'Config Sorting',
    icon: 'bi bi-gear',
  },
  {
    label: 'Clear Sort',
    icon: 'bi bi-eraser',
  },
  {
    label: 'Pin Column',
    icon: 'bi bi-pin-angle',
    isSubmenu: true,
    subMenu: [
      {
        label: 'No Pin',
      },
      {
        label: 'Pin left',
        icon: 'bi bi-arrow-left-short',
      },
      {
        label: 'Pin right',
        icon: 'bi bi-arrow-right-short',
      },
    ],
  },
  {
    label: 'Autosize all columns',
    icon: 'bi bi-arrow-repeat',
  },
  {
    label: 'Autosize this column',
    icon: 'bi bi-arrow-repeat',
  },
  {
    label: 'Freeze column',
    icon: 'bi bi-snow',
  },
  {
    label: 'Choose column',
    icon: 'bi bi-list-check',
    isSubmenu: true,
    subMenu: [
      {
        label: 'Column 1',
        icon: 'bi bi-list-check',
      },
      {
        label: 'Column 2',
        icon: 'bi bi-list-check',
      },
    ],
  },
  {
    label: 'Show group bar',
    icon: 'bi bi-bar-chart',
  },
  {
    label: 'Show filter row',
    icon: '',
  },
  {
    label: 'Show reset Column',
    icon: '',
  },
  {
    label: 'Group by this column',
    icon: '',
  },
];
