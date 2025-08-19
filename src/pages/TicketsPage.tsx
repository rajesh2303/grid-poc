import { useMemo, useState } from 'react';
import DataGrid from '../components/DataGrid';
import type { ColumnDef } from '../components/DataGrid.types';

type Broker = {
  id: number;
  brokerName: string;
  brokerCode: string;
  brokerStatus: string;
  lastModified: string;
};

const columns: ColumnDef<Broker>[] = [
  {
    key: 'brokerName',
    headerName: 'Broker Name',
    field: 'brokerName',
    hozAlign: 'left',
    sortable: true,
    resizable: true,
  },
  {
    key: 'brokerCode',
    headerName: 'Broker Code',
    field: 'brokerCode',
    sortable: true,
    resizable: true,
  },
  {
    key: 'brokerStatus',
    headerName: 'Broker Status',
    field: 'brokerStatus',
    sortable: true,
    resizable: true,
  },
  {
    key: 'lastModified',
    headerName: 'Last Modified',
    field: 'lastModified',
    sortable: true,
    resizable: true,
    valueFormatter: (v) => new Date(v).toLocaleString(),
  },
];

function generateRows(count: number): Broker[] {
  const statuses = [
    'Onboarding',
    'Active',
    'Inactive',
    'Suspended',
    'Terminated',
  ];
  const rows: Broker[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: i + 1,
      brokerName: `Name of the broker ${i + 1}`,
      brokerCode: `BR${(4500 + (i % 600)).toString().padStart(4, '0')}`,
      brokerStatus: statuses[i % statuses.length],
      lastModified: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return rows;
}

const allRows = generateRows(1000);

export default function TicketsPage() {
  const [visibleCount, setVisibleCount] = useState(100);
  const [quick, setQuick] = useState('');
  // grouping via drag panel; remove dropdown
  const rows = useMemo(() => allRows.slice(0, visibleCount), [visibleCount]);

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      height={680}
      rowHeight={44}
      checkboxSelection
      quickFilter={quick}
      enableColumnReorder
      infiniteScroll
      hasMore={visibleCount < allRows.length}
      onLoadMore={() =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            setVisibleCount((c) => Math.min(allRows.length, c + 100));
            resolve();
          }, 400);
        })
      }
      onSelectionChange={(s) => console.log('selection', s)}
    />
  );
}
