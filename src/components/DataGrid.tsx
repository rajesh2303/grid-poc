import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './DataGrid.css';
import type { ColumnDef, DataGridProps, SortDirection, FilterModel } from './DataGrid.types';

type InternalColumn<T = any> = ColumnDef<T> & { computedWidth: number };

function defaultGetRowId(row: any): string | number {
	if (row == null) return Math.random().toString(36).slice(2);
	if (typeof row === 'object') {
		if ('id' in row) return (row as any).id;
		if ('_id' in row) return (row as any)._id;
	}
	return JSON.stringify(row);
}

function getValue<T>(row: T, col: ColumnDef<T>) {
	const raw = col.valueGetter ? col.valueGetter(row) : (col.field ? (row as any)[col.field] : undefined);
	return raw;
}

function formatValue<T>(row: T, col: ColumnDef<T>) {
	const v = getValue(row, col);
	if (col.valueFormatter) return col.valueFormatter(v, row);
	if (v == null) return '';
	return String(v);
}

function useGridColumns<T>(columns: ColumnDef<T>[], containerWidth: number | null): InternalColumn<T>[] {
	return useMemo(() => {
		const totalFlex = columns.reduce((sum, c) => sum + (c.flex || 0), 0);
		return columns.map((c) => {
			let width = c.width ?? 160;
			if (containerWidth && totalFlex > 0 && c.flex) {
				const remaining = containerWidth - columns.reduce((s, x) => s + (x.width ?? 0), 0);
				const share = Math.max(remaining, 0) * (c.flex / totalFlex);
				width = Math.max(c.minWidth ?? 80, Math.min(c.maxWidth ?? 800, Math.floor((c.width || 0) + share)));
			}
			return { ...c, computedWidth: width } as InternalColumn<T>;
		});
	}, [columns, containerWidth]);
}

function sortRows<T>(rows: T[], sort: { key: string; direction: Exclude<SortDirection, null> } | null, columns: ColumnDef<T>[]): T[] {
	if (!sort) return rows;
	const col = columns.find(c => c.key === sort.key);
	if (!col) return rows;
	const dir = sort.direction === 'asc' ? 1 : -1;
	const comparator = col.comparator || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
	return [...rows].sort((ra, rb) => comparator(getValue(ra, col), getValue(rb, col), ra, rb) * dir);
}

function quickFilterRows<T>(rows: T[], columns: ColumnDef<T>[], text: string | undefined): T[] {
	if (!text) return rows;
	const q = text.toLowerCase();
	return rows.filter((r) => columns.some((c) => String(getValue(r, c) ?? '').toLowerCase().includes(q)));
}

function useContainerWidth<T extends HTMLElement>(ref: React.RefObject<T | null>) {
	const [width, setWidth] = useState<number | null>(null);
	useEffect(() => {
		function update() {
			if (ref.current) setWidth(ref.current.clientWidth);
		}
		update();
		const ro = new ResizeObserver(update);
		if (ref.current) ro.observe(ref.current);
		return () => ro.disconnect();
	}, [ref]);
	return width;
}

export default function DataGrid<T>(props: DataGridProps<T>) {
	const {
		columns,
		rows,
		getRowId = defaultGetRowId,
		height = 520,
		rowHeight = 44,
		pageSize: pageSizeProp = 25,
		pageSizeOptions = [10, 25, 50, 100],
		checkboxSelection = true,
		initialSort = null,
		className,
		style,
		quickFilter,
		onSelectionChange,
		onCellEdit,
		enableColumnReorder = true,
		onColumnsReorder,
		initialFilters,
		onFiltersChange,
		groupBy,
		// onGroupByChange,
		infiniteScroll = false,
		hasMore = false,
		onLoadMore,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const width = useContainerWidth(containerRef);

	const [sort, setSort] = useState<typeof initialSort>(initialSort);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(pageSizeProp);
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
	const [selected, setSelected] = useState<Set<string | number>>(new Set());
	const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map(c => c.key));
	const [filters, setFilters] = useState<Record<string, FilterModel | undefined>>(initialFilters || {});
	const [dragColKey, setDragColKey] = useState<string | null>(null);
	const [resizingColKey, setResizingColKey] = useState<string | null>(null);
	const [dragRowId, setDragRowId] = useState<string | number | null>(null);
	const [internalRows, setInternalRows] = useState<T[]>(rows);
	const [internalGroupBy, setInternalGroupBy] = useState<string[]>(groupBy || []);
	const [editing, setEditing] = useState<{ rowId: string | number; colKey: string; value: any } | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	// removed duplicate internalGroupBy

	useEffect(() => {
		setInternalRows(rows);
	}, [rows]);

	const orderedColumns = useMemo(() => columnOrder.map(k => columns.find(c => c.key === k)!).filter(Boolean) as ColumnDef<T>[], [columnOrder, columns]);

	const internalColumns = useGridColumns(
		orderedColumns.map(c => ({ ...c, width: columnWidths[c.key] ?? c.width })),
		width
	);

	const applyColumnFilters = useCallback((inputRows: T[]): T[] => {
		const entries = Object.entries(filters).filter(([, f]) => !!f) as [string, FilterModel][];
		if (entries.length === 0) return inputRows;
		return inputRows.filter((r) => {
			return entries.every(([key, f]) => {
				const col = internalColumns.find(c => c.key === key);
				if (!col) return true;
				const raw = getValue(r, col);
				const op = f.operator;
				const val = f.value as any;
				const extra = f.extra as any;
				if (col.dataType === 'number') {
					const num = Number(raw);
					if (Number.isNaN(num)) return false;
					if (op === 'equals') return num === Number(val);
					if (op === 'gt') return num > Number(val);
					if (op === 'gte') return num >= Number(val);
					if (op === 'lt') return num < Number(val);
					if (op === 'lte') return num <= Number(val);
					if (op === 'between') return num >= Number(val) && num <= Number(extra);
				}
				if (col.dataType === 'date') {
					const ts = raw ? new Date(raw as any).getTime() : NaN;
					if (Number.isNaN(ts)) return false;
					if (op === 'equals') return ts === new Date(String(val)).getTime();
					if (op === 'before') return ts < new Date(String(val)).getTime();
					if (op === 'after') return ts > new Date(String(val)).getTime();
					if (op === 'between') return ts >= new Date(String(val)).getTime() && ts <= new Date(String(extra)).getTime();
				}
				// default text
				const str = String(raw ?? '').toLowerCase();
				const needle = String(val ?? '').toLowerCase();
				if (op === 'equals') return str === needle;
				if (op === 'startsWith') return str.startsWith(needle);
				if (op === 'endsWith') return str.endsWith(needle);
				// contains
				return str.includes(needle);
			});
		});
	}, [filters, internalColumns]);

	const processedRows = useMemo(() => {
		let out = internalRows;
		out = applyColumnFilters(out);
		out = quickFilterRows(out, internalColumns, quickFilter);
		out = sortRows(out, sort, internalColumns);
		return out;
	}, [internalRows, internalColumns, sort, quickFilter, applyColumnFilters]);

	const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
	const currentPage = Math.min(page, totalPages - 1);
	const pagedRows = useMemo(() => {
		if (infiniteScroll) return processedRows;
		const start = currentPage * pageSize;
		return processedRows.slice(start, start + pageSize);
	}, [processedRows, currentPage, pageSize, infiniteScroll]);

	useEffect(() => {
		if (!onSelectionChange) return;
		const selectedRows = internalRows.filter(r => selected.has(getRowId(r)));
		onSelectionChange({ selectedRowIds: selected, selectedRows });
	}, [selected, internalRows, getRowId, onSelectionChange]);

	const onToggleAll = useCallback((checked: boolean) => {
		if (checked) {
			const ids = new Set<string | number>(pagedRows.map(getRowId));
			setSelected(prev => new Set([...prev, ...ids]));
		} else {
			setSelected(prev => {
				const copy = new Set(prev);
				pagedRows.forEach(r => copy.delete(getRowId(r)));
				return copy;
			});
		}
	}, [pagedRows, getRowId]);

	const onColumnResizeStart = (key: string, startX: number) => {
		const col = internalColumns.find(c => c.key === key);
		if (!col) return;
		const startWidth = columnWidths[key] ?? col.computedWidth;
		setResizingColKey(key);
		const onMove = (e: MouseEvent) => {
			const delta = e.clientX - startX;
			const newWidth = Math.max(col.minWidth ?? 80, Math.min(col.maxWidth ?? 800, startWidth + delta));
			setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
		};
		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			setResizingColKey(null);
		};
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	const gridTemplateColumns = useMemo(() => {
		const arr = [checkboxSelection ? 44 : 0, ...internalColumns.map(c => c.computedWidth)];
		return arr.map(v => `${v}px`).join(' ');
	}, [internalColumns, checkboxSelection]);

	const header = (
		<div className="datagrid__header" style={{ gridTemplateColumns }}>
			{checkboxSelection && (
				<div className="datagrid__header-cell" role="columnheader" aria-colindex={1}>
					<input
						className="datagrid__checkbox"
						type="checkbox"
						checked={pagedRows.every(r => selected.has(getRowId(r))) && pagedRows.length > 0}
						onChange={(e) => onToggleAll(e.target.checked)}
						aria-label="Select all rows on page"
					/>
				</div>
			)}
			{internalColumns.map((col, i) => {
				const isSorted = sort?.key === col.key && sort.direction;
				return (
					<div
						key={col.key}
						className="datagrid__header-cell"
						role="columnheader"
						aria-colindex={i + 1 + (checkboxSelection ? 1 : 0)}
						draggable={enableColumnReorder && !resizingColKey}
						onDragStart={(e) => { if (resizingColKey) { e.preventDefault(); return; } setDragColKey(col.key); }}
						onDragOver={(e) => enableColumnReorder ? e.preventDefault() : undefined}
						onDrop={() => {
							if (!enableColumnReorder || !dragColKey || dragColKey === col.key) return;
							setColumnOrder((prev) => {
								const arr = prev.slice();
								const from = arr.indexOf(dragColKey);
								const to = arr.indexOf(col.key);
								arr.splice(to, 0, ...arr.splice(from, 1));
								onColumnsReorder && onColumnsReorder(arr);
								return arr;
							});
							setDragColKey(null);
						}}
					>
						<button
							className="datagrid__btn"
							style={{ padding: '.2rem .4rem', background: 'transparent', border: 'none', cursor: col.sortable === false ? 'default' : 'pointer' }}
							onClick={() => {
								if (col.sortable === false) return;
								setSort((prev) => {
									if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' } as const;
									if (prev.direction === 'asc') return { key: col.key, direction: 'desc' } as const;
									return null;
								});
							}}
							aria-label={`Sort by ${col.headerName}`}
						>
							<span style={{ fontWeight: 600 }}>{col.headerName}</span>
							<span style={{ marginLeft: 6, color: 'var(--color-text-secondary)' }}>
								{col.filterable !== false ? <i className="bi bi-funnel" /> : null}
								{col.resizable !== false ? <i className="bi bi-arrows-expand" style={{ marginLeft: 6 }} /> : null}
							</span>
							{isSorted && <span className="datagrid__sort-indicator">{sort!.direction === 'asc' ? '▲' : '▼'}</span>}
						</button>
						{col.resizable !== false && (
							<div
								className="datagrid__resizer"
								onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onColumnResizeStart(col.key, e.clientX); }}
								role="separator"
								aria-orientation="vertical"
								aria-label={`Resize ${col.headerName}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);

	const filterRow = (
		<div className="datagrid__header" style={{ gridTemplateColumns }}>
			{checkboxSelection && <div className="datagrid__header-cell" />}
			{internalColumns.map((col) => {
				if (col.filterable === false) return <div key={col.key} className="datagrid__header-cell" />;
				const f = filters[col.key];
				const set = (next: FilterModel | undefined) => {
					setFilters(prev => {
						const merged = { ...prev, [col.key]: next };
						onFiltersChange && onFiltersChange(merged);
						return merged;
					});
				};
				const commonStyle: React.CSSProperties = { width: '100%' };
				if (col.dataType === 'number') {
					return (
						<div key={col.key} className="datagrid__header-cell" style={{ gap: '.25rem' }}>
							<select value={(f?.operator as string) || 'equals'} onChange={(e) => set({ operator: e.target.value as any, value: f?.value ?? '' })}>
								<option value="equals">=</option>
								<option value="gt">&gt;</option>
								<option value="gte">≥</option>
								<option value="lt">&lt;</option>
								<option value="lte">≤</option>
								<option value="between">between</option>
							</select>
							<input style={commonStyle} type="number" value={(f?.value as any) ?? ''} onChange={(e) => set({ operator: (f?.operator as any) || 'equals', value: e.target.value })} />
							{f?.operator === 'between' && (
								<input style={commonStyle} type="number" value={(f?.extra as any) ?? ''} onChange={(e) => set({ operator: 'between', value: f?.value ?? '', extra: e.target.value })} />
							)}
						</div>
					);
				}
				if (col.dataType === 'date') {
					return (
						<div key={col.key} className="datagrid__header-cell" style={{ gap: '.25rem' }}>
							<select value={(f?.operator as string) || 'equals'} onChange={(e) => set({ operator: e.target.value as any, value: f?.value ?? '' })}>
								<option value="equals">on</option>
								<option value="before">before</option>
								<option value="after">after</option>
								<option value="between">between</option>
							</select>
							<input style={commonStyle} type="date" value={(f?.value as any) ?? ''} onChange={(e) => set({ operator: (f?.operator as any) || 'equals', value: e.target.value })} />
							{f?.operator === 'between' && (
								<input style={commonStyle} type="date" value={(f?.extra as any) ?? ''} onChange={(e) => set({ operator: 'between', value: f?.value ?? '', extra: e.target.value })} />
							)}
						</div>
					);
				}
				// text
				return (
					<div key={col.key} className="datagrid__header-cell" style={{ gap: '.25rem' }}>
						<select value={(f?.operator as string) || 'contains'} onChange={(e) => set({ operator: e.target.value as any, value: f?.value ?? '' })}>
							<option value="contains">contains</option>
							<option value="equals">equals</option>
							<option value="startsWith">starts with</option>
							<option value="endsWith">ends with</option>
						</select>
						<input style={commonStyle} value={(f?.value as any) ?? ''} onChange={(e) => set({ operator: (f?.operator as any) || 'contains', value: e.target.value })} />
					</div>
				);
			})}
		</div>
	);

	// Simple virtualization for the current page (disabled when grouped to keep logic straightforward)
	const bodyRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const visibleRowCount = Math.ceil((height - 110) / rowHeight) + 4; // header + footer approx.
	const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
	const endIndex = Math.min(pagedRows.length, startIndex + visibleRowCount);
	const offsetY = startIndex * rowHeight;

	// Editing helpers
	const beginEdit = useCallback((row: T, col: ColumnDef<T>) => {
		if (col.editable === false) return;
		const rowId = getRowId(row);
		setEditing({ rowId, colKey: col.key, value: getValue(row, col) });
	}, [getRowId]);

	const commitEdit = useCallback((commit: boolean) => {
		setEditing((ed) => {
			if (!ed) return null;
			if (commit) {
				const col = internalColumns.find(c => c.key === ed.colKey);
				if (col && col.field) {
					setInternalRows(prev => prev.map(r => {
						if (getRowId(r) !== ed.rowId) return r;
						return { ...(r as any), [col.field!]: ed.value } as T;
					}));
				}
				onCellEdit && onCellEdit({ rowId: ed.rowId, columnKey: ed.colKey, value: ed.value, row: internalRows.find(r => getRowId(r) === ed.rowId)! });
			}
			return null;
		});
	}, [internalColumns, onCellEdit, internalRows, getRowId]);

	// Grouping
	const groupKeys = (groupBy && groupBy.length > 0 ? groupBy : internalGroupBy);
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
	const grouped = useMemo(() => {
		if (groupKeys.length === 0) return null;
		const key = groupKeys[0];
		const groups = new Map<string, T[]>();
		for (const r of processedRows) {
			const col = internalColumns.find(c => c.key === key)!;
			const value = String(getValue(r, col));
			const arr = groups.get(value) || [];
			arr.push(r);
			groups.set(value, arr);
		}
		return Array.from(groups.entries()).map(([k, rs]) => ({ key: k, rows: rs }));
	}, [groupKeys, processedRows, internalColumns]);

	// Collapse groups by default when grouping changes
	useEffect(() => {
		if (groupKeys.length === 0) return;
		setExpandedGroups(() => {
			const map: Record<string, boolean> = {};
			(grouped || []).forEach(g => { map[g.key] = false; });
			return map;
		});
	}, [groupKeys.join('|')]);

	function i18nHeaderName(key: string, cols: InternalColumn<T>[]) {
		const c = cols.find(c => c.key === key);
		return c?.headerName || key;
	}

	// Infinite scroll trigger
	useEffect(() => {
		if (!infiniteScroll || !onLoadMore) return;
		const el = bodyRef.current;
		if (!el) return;
		const handler = () => {
			if (isLoadingMore || !hasMore) return;
			const threshold = 200; // px from bottom
			if (el.scrollTop + el.clientHeight + threshold >= el.scrollHeight) {
				setIsLoadingMore(true);
				Promise.resolve(onLoadMore()).finally(() => setIsLoadingMore(false));
			}
		};
		el.addEventListener('scroll', handler);
		return () => el.removeEventListener('scroll', handler);
	}, [infiniteScroll, onLoadMore, isLoadingMore, hasMore]);

	return (
		<div ref={containerRef} className={`datagrid ${className || ''}`} style={{ ...style, height }}>
			<div className="datagrid__toolbar">
				<div style={{ fontWeight: 600 }}>Results: {processedRows.length}</div>
				<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
					<label className="visually-hidden" htmlFor="pageSize">Rows per page</label>
					<select
						id="pageSize"
						value={pageSize}
						onChange={(e) => { setPage(0); setPageSize(Number(e.target.value)); }}
					>
						{pageSizeOptions.map(p => <option key={p} value={p}>{p} / page</option>)}
					</select>
				</div>
			</div>
			{/* Group panel: drag column headers here to group */}
			<div className="datagrid__group-panel"
				onDragOver={(e) => {
					if (dragColKey) e.preventDefault();
				}}
				onDrop={() => {
					if (!dragColKey) return;
					setInternalGroupBy((prev) => prev.includes(dragColKey!) ? prev : [...prev, dragColKey!]);
					setDragColKey(null);
				}}
			>
				{groupKeys.length === 0 ? (
					<span className="muted">Drag and drop columns here to group…</span>
				) : (
					<span>
						{groupKeys.map((k) => (
							<span key={k} className="datagrid__group-chip">
								{i18nHeaderName(k, internalColumns)}
								<button className="datagrid__btn" onClick={() => setInternalGroupBy(prev => prev.filter(x => x !== k))}>×</button>
							</span>
						))}
					</span>
				)}
			</div>
			{header}
			{groupKeys.length === 0 ? filterRow : null}
			<div
				ref={bodyRef}
				className="datagrid__body"
				style={{ height: height - 110, overflow: 'auto' }}
				onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
			>
				{grouped ? (
					<div>
						{grouped.map((g) => {
							const open = expandedGroups[g.key] ?? true;
							return (
								<React.Fragment key={g.key}>
									<div className="datagrid__row datagrid__group-row" style={{ gridTemplateColumns }} onClick={() => setExpandedGroups(prev => ({ ...prev, [g.key]: !open }))}>
										{checkboxSelection && <div className="datagrid__cell" />}
										<div className="datagrid__cell" style={{ gridColumn: `span ${internalColumns.length}` }}>
											{open ? '▼' : '▶'} Group: {g.key} ({g.rows.length})
										</div>
									</div>
									{open && g.rows.map((row) => {
										const rowId = getRowId(row);
										const isSelected = selected.has(rowId);
										return (
											<div key={String(rowId)} className="datagrid__row" style={{ gridTemplateColumns, height: rowHeight }}>
												{checkboxSelection && (
													<div className="datagrid__cell">
														<input className="datagrid__checkbox" type="checkbox" checked={isSelected} onChange={(e) => {
															const checked = e.target.checked;
															setSelected(prev => { const copy = new Set(prev); if (checked) copy.add(rowId); else copy.delete(rowId); return copy; });
														}} />
													</div>
												)}
												{internalColumns.map((col) => {
													const isEditing = editing && editing.rowId === getRowId(row) && editing.colKey === col.key;
													const raw = getValue(row, col);
													if (isEditing) {
														return (
															<div key={col.key} className="datagrid__cell">
																<DefaultEditor
																	type={col.dataType || 'text'}
																	value={editing.value}
																	onChange={(v) => setEditing(prev => prev ? { ...prev, value: v } : prev)}
																	onKeyDown={(e) => {
																		if (e.key === 'Enter') commitEdit(true);
																		if (e.key === 'Escape') commitEdit(false);
																	}}
																	onBlur={() => commitEdit(true)}
																/>
															</div>
													);
													}
													return (
														<div key={col.key} className="datagrid__cell" title={String(raw)} onDoubleClick={() => beginEdit(row, col)}>
															{col.cellRenderer ? col.cellRenderer(raw, row) : formatValue(row, col)}
														</div>
													);
												})}
											</div>
										);
									})}
								</React.Fragment>
							);
						})}
					</div>
				) : (
					<div style={{ height: pagedRows.length * rowHeight, position: 'relative' }}>
						<div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
							{pagedRows.slice(startIndex, endIndex).map((row, idx) => {
								const rowId = getRowId(row);
								const isSelected = selected.has(rowId);
								return (
									<div
										key={String(rowId)}
										className="datagrid__row"
										style={{ gridTemplateColumns, height: rowHeight }}
										role="row"
										aria-rowindex={startIndex + idx + 1}
										draggable
										onDragStart={() => setDragRowId(rowId)}
										onDragOver={(e) => e.preventDefault()}
										onDrop={() => {
											if (dragRowId == null || dragRowId === rowId) return;
											setInternalRows(prev => {
												const copy = prev.slice();
												const from = copy.findIndex(r => getRowId(r) === dragRowId);
												const to = copy.findIndex(r => getRowId(r) === rowId);
												if (from === -1 || to === -1) return prev;
												const [moved] = copy.splice(from, 1);
												copy.splice(to, 0, moved);
												return copy;
											});
											setDragRowId(null);
										}}
									>
										{checkboxSelection && (
											<div className="datagrid__cell">
												<input
													className="datagrid__checkbox"
													type="checkbox"
													checked={isSelected}
													onChange={(e) => {
														const checked = e.target.checked;
														setSelected(prev => {
															const copy = new Set(prev);
															if (checked) copy.add(rowId); else copy.delete(rowId);
															return copy;
														});
													}}
													aria-label="Select row"
												/>
											</div>
										)}
										{internalColumns.map((col) => {
											const isEditing = editing && editing.rowId === getRowId(row) && editing.colKey === col.key;
											const raw = getValue(row, col);
											if (isEditing) {
												return (
													<div key={col.key} className="datagrid__cell">
														<DefaultEditor
															type={col.dataType || 'text'}
															value={editing.value}
															onChange={(v) => setEditing(prev => prev ? { ...prev, value: v } : prev)}
															onKeyDown={(e) => {
																if (e.key === 'Enter') commitEdit(true);
																if (e.key === 'Escape') commitEdit(false);
															}}
															onBlur={() => commitEdit(true)}
														/>
													</div>
											);
											}
											return (
												<div key={col.key} className="datagrid__cell" title={String(raw)} onDoubleClick={() => beginEdit(row, col)}>
													{col.cellRenderer ? col.cellRenderer(raw, row) : formatValue(row, col)}
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
			<div className="datagrid__footer">
				{infiniteScroll ? (
					<div>{isLoadingMore ? 'Loading more…' : hasMore ? 'Scroll to load more' : 'No more results'}</div>
				) : (
					<>
						<div>Page {currentPage + 1} of {totalPages}</div>
						<div className="datagrid__pagination">
							<button className="datagrid__btn" onClick={() => setPage(0)} disabled={currentPage === 0}>&laquo;</button>
							<button className="datagrid__btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>&lsaquo;</button>
							<button className="datagrid__btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>&rsaquo;</button>
							<button className="datagrid__btn" onClick={() => setPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>&raquo;</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function DefaultEditor({ type, value, onChange, onKeyDown, onBlur }: { type: string; value: any; onChange: (v: any) => void; onKeyDown: (e: React.KeyboardEvent) => void; onBlur?: () => void }) {
	if (type === 'number') return <input autoFocus type="number" value={value ?? ''} onChange={(e) => onChange((e.target as HTMLInputElement).value)} onKeyDown={onKeyDown} onBlur={onBlur} />;
	if (type === 'date') return <input autoFocus type="date" value={value ?? ''} onChange={(e) => onChange((e.target as HTMLInputElement).value)} onKeyDown={onKeyDown} onBlur={onBlur} />;
	return <input autoFocus value={value ?? ''} onChange={(e) => onChange((e.target as HTMLInputElement).value)} onKeyDown={onKeyDown} onBlur={onBlur} />;
}

// Cell renderer with editing support
/*
function useEditing<T>(
	params: {
		editing: { rowId: string | number; colKey: string; value: any } | null;
		setEditing: React.Dispatch<React.SetStateAction<{ rowId: string | number; colKey: string; value: any } | null>>;
		getRowId: (row: T) => string | number;
		internalRows: T[];
		setInternalRows: React.Dispatch<React.SetStateAction<T[]>>;
		onCellEdit?: DataGridProps<T>['onCellEdit'];
	}
) {
	const { editing: ed, setEditing, getRowId, internalRows, setInternalRows, onCellEdit } = params;
	const startEdit = (row: T, col: ColumnDef<T>) => {
		if (col.editable === false) return;
		const rowId = getRowId(row);
		setEditing({ rowId, colKey: col.key, value: getValue(row, col) });
	};
	const stopEdit = (commit: boolean) => {
		if (!ed) return;
		if (commit) {
			setInternalRows(prev => prev.map(r => {
				if (getRowId(r) !== ed.rowId) return r;
				const colKey = ed.colKey;
				const col = Object.values(prev[0] || {}).length, _ = colKey; // no-op to avoid unused var lint
				return { ...(r as any), [colKey]: ed.value } as T;
			}));
			onCellEdit && onCellEdit({ rowId: ed.rowId, columnKey: ed.colKey, value: ed.value, row: internalRows.find(r => getRowId(r) === ed.rowId)! });
		}
		setEditing(null);
	};
	return { startEdit, stopEdit };
}
*/

// function renderCell<T>(row: T, col: ColumnDef<T>) {
// 	const content = col.cellRenderer ? col.cellRenderer(getValue(row, col), row) : formatValue(row, col);
// 	return (
// 		<div key={col.key} className="datagrid__cell" title={String(content)}>
// 			{content}
// 		</div>
// 	);
// }


