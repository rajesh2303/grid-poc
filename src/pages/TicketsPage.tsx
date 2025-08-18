import { useMemo, useState } from 'react';
import DataGrid from '../components/DataGrid';
import type { ColumnDef } from '../components/DataGrid.types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';
import Chip from '../components/ui/Chip';

type Broker = {
	id: number;
	brokerName: string;
	brokerCode: string;
	brokerStatus: string;
	lastModified: string;
};

const columns: ColumnDef<Broker>[] = [
	{ key: 'brokerName', headerName: 'Broker Name', field: 'brokerName', flex: 1, sortable: true, resizable: true },
	{ key: 'brokerCode', headerName: 'Broker Code', field: 'brokerCode', width: 120, sortable: true },
	{ key: 'brokerStatus', headerName: 'Broker Status', field: 'brokerStatus', width: 140, sortable: true },
	{ key: 'lastModified', headerName: 'Last Modified', field: 'lastModified', width: 190, sortable: true, valueFormatter: (v) => new Date(v).toLocaleString() },
];

function generateRows(count: number): Broker[] {
	const statuses = ['Onboarding', 'Active', 'Inactive', 'Suspended', 'Terminated'];
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
		<div className="card">
			<div className="row" style={{ padding: 12, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
				<div className="page-title">Tickets</div>
				<div className="spacer" />
				<Button variant="soft" color="primary"><i className="bi bi-upload" /> Upload</Button>
				<Button variant="solid" color="primary"><i className="bi bi-plus-lg" /> Add Broker</Button>
			</div>

			<div className="toolbar" style={{ margin: 12 }}>
				<div style={{ position: 'relative' }}>
					<i className="bi bi-search" style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-text-secondary)' }} />
					<Input style={{ paddingLeft: 30, width: 260 }} placeholder="Search here..." value={quick} onChange={(e) => setQuick(e.target.value)} />
				</div>
				{/* grouping dropdown removed per spec; use drag panel in grid */}
				<div className="spacer" />
				<Button variant="ghost" color="neutral"><i className="bi bi-columns" /> Columns</Button>
				<Button variant="ghost" color="neutral"><i className="bi bi-box-arrow-up" /> Export</Button>
			</div>

			<div style={{ padding: '0 12px 8px' }}>
				<Chip icon="bi-sliders2">10 rows</Chip>
				<span style={{ marginLeft: 12 }} className="muted">Showing 21 - 30 of 88 results</span>
			</div>

			<div style={{ padding: '0 12px 12px' }}>
				<DataGrid
					columns={columns}
					rows={rows}
					height={680}
					rowHeight={44}
					pageSize={25}
					initialSort={{ key: 'brokerName', direction: 'asc' }}
					checkboxSelection
					quickFilter={quick}
					enableColumnReorder
					groupBy={[]}
					infiniteScroll
					hasMore={visibleCount < allRows.length}
					onLoadMore={() => new Promise<void>((resolve) => { setTimeout(() => { setVisibleCount(c => Math.min(allRows.length, c + 100)); resolve(); }, 400); })}
					onSelectionChange={(s) => console.log('selection', s)}
				/>
			</div>
		</div>
	);
}


