import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key:        string;
  header:     string;
  className?: string;
  render:     (item: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns:    DataTableColumn<T>[];
  data:       T[];
  emptyText?: string;
  className?: string;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyText = 'Sin registros',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col) => (
              <th key={col.key} className={`table-th ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`table-td ${col.className ?? ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
