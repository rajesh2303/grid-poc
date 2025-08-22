import DataGrid from '../components/DataGrid';
import type { ColumnDef } from '../components/DataGrid.types';
import uiConfig from '../assets/mock/uiConfig.json';
import BrokerData from '../assets/mock/broker.json';

// Infer the type of a broker row from the data
type BrokerRow = typeof BrokerData extends Array<infer U> ? U : never;

type MetadataItem = {
  name: string;
  key: string;
  datatype: string;
  ui: string;
  search?: string;
  format?: string;
  align?: string;
  viewlink?: string;
  comparelink?: string;
  promotelink?: string;
  lookuplink?: string;
};

// Make getColumnsFromMetadata generic for type safety
const getColumnsFromMetadata = <T extends object = any>(
  metadata: MetadataItem[],
): ColumnDef<T>[] =>
  metadata.map((meta) => {
    const column: ColumnDef<T> = {
      key: meta.key,
      headerName: meta.name,
      field: meta.key as keyof T & string,
      hozAlign: meta.align === 'right' ? 'end' : 'left',
      sortable: true,
      resizable: true,
      search: meta.search === 'true',
      searchPlaceholder: meta.name ? `Search by ${meta.name}` : undefined,
      filterable: true,
    };
    if (meta.viewlink) {
      column.cellRenderer = (value: any, row: T) => {
        let link = meta.viewlink ?? '';
        link = link.replace(
          /\{([^}]+)\}/g,
          (_, key) => (row as any)?.[key] ?? value ?? '',
        );
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'underline' }}
          >
            {value}
          </a>
        );
      };
    }
    return column;
  });

export default function TicketsPage() {
  // Get all enabled tables from uiConfig
  const enabledTables = Object.entries(uiConfig).filter(
    ([_, table]: [string, any]) => table.enable === 'true',
  );

  if (enabledTables.length === 0) {
    return <div>No tables enabled in config.</div>;
  }

  console.log(
    'enabledTables',
    getColumnsFromMetadata(uiConfig.broker.metadata),
  );

  return (
    <div style={{ padding: 16 }}>
      {enabledTables.map(([tableKey, table]: [string, any]) => (
        <div key={tableKey} style={{ marginBottom: 40 }}>
          <h6 style={{ marginBottom: 16 }}>{table.name}</h6>
          {tableKey.toLocaleLowerCase() === 'broker' ? (
            <DataGrid<BrokerRow>
              columns={getColumnsFromMetadata<BrokerRow>(table.metadata)}
              rows={BrokerData.slice(0, 100)} // Limit rows for performance
              height={680}
              rowHeight={44}
              checkboxSelection
              quickFilter={''}
              enableColumnReorder
              infiniteScroll={false}
            />
          ) : (
            <DataGrid<any>
              columns={getColumnsFromMetadata<any>(table.metadata)}
              rows={[]}
              height={680}
              rowHeight={44}
              checkboxSelection
              quickFilter={''}
              enableColumnReorder
              infiniteScroll={false}
            />
          )}
        </div>
      ))}
    </div>
  );
}
